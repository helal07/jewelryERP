<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleReturnController extends Controller
{
    public function index(Request $request)
    {
        $query = SaleReturn::with(['sale.customer', 'customer', 'branch', 'items.product', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('return_no', 'like', "%{$search}%")
                  ->orWhereHas('sale', function ($sq) use ($search) {
                      $sq->where('invoice_no', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($cq) use ($search) {
                            $cq->where('name', 'like', "%{$search}%")
                              ->orWhere('phone', 'like', "%{$search}%");
                        });
                  })
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $returns = $query->orderBy('return_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $completedSales = Sale::with(['customer', 'items.product'])
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Sales/Returns/Index', [
            'returns' => $returns,
            'sales' => $completedSales,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'return_date' => 'required|date',
            'reason' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'nullable|exists:sale_items,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'refund_amount' => 'required|numeric|min:0',
        ]);

        $sale = Sale::findOrFail($validated['sale_id']);

        $return = DB::transaction(function () use ($validated, $sale) {
            $returnNo = 'RET-' . date('Ymd') . '-' . str_pad(SaleReturn::count() + 1, 4, '0', STR_PAD_LEFT);
            
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += ($item['quantity'] * $item['unit_price']);
            }

            $saleReturn = SaleReturn::create([
                'return_no' => $returnNo,
                'sale_id' => $sale->id,
                'customer_id' => $sale->customer_id ?: 1,
                'branch_id' => $sale->branch_id ?: 1,
                'return_date' => $validated['return_date'],
                'subtotal' => $subtotal,
                'total_amount' => $validated['refund_amount'] ?? $subtotal,
                'refund_amount' => $validated['refund_amount'],
                'reason' => $validated['reason'] ?? 'Customer Item Return',
                'status' => 'completed',
                'created_by' => auth()->id() ?: 1,
            ]);

            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * ($item['unit_price'] ?? 0);
                SaleReturnItem::create([
                    'sale_return_id' => $saleReturn->id,
                    'sale_item_id' => $item['sale_item_id'] ?? null,
                    'product_id' => $item['product_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'weight' => $item['weight'] ?? 0,
                    'unit_price' => $item['unit_price'] ?? 0,
                    'total_amount' => $lineTotal,
                    'amount' => $lineTotal,
                ]);
            }

            // Update the sale invoice status to 'cancelled' and adjust due
            $newDue = max(0, $sale->due_amount - $validated['refund_amount']);
            $sale->update([
                'due_amount' => $newDue,
                'status' => 'cancelled',
            ]);

            return $saleReturn;
        });

        return redirect()->route('sales.returns.index')
            ->with('success', "Sale Return #{$return->return_no} processed successfully.");
    }

    public function destroy(SaleReturn $return)
    {
        DB::transaction(function () use ($return) {
            $sale = $return->sale;
            if ($sale) {
                $newDue = $sale->due_amount + $return->refund_amount;
                $sale->update([
                    'due_amount' => $newDue,
                    'status' => $newDue <= 0 ? 'completed' : 'pending',
                ]);
            }
            $return->items()->delete();
            $return->delete();
        });

        return redirect()->back()->with('success', 'Sale Return voucher deleted successfully.');
    }
}
