<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $branches = Branch::all();
        $products = Product::where('status', 'active')->get(['id', 'name', 'sku', 'branch_id']);

        $query = StockAdjustment::with(['product.category', 'product.purity', 'branch', 'creator'])->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('adjustment_no', 'like', "%{$s}%")
                  ->orWhereHas('product', fn($q) => $q->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%"));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $adjustments = $query->paginate(10)->withQueryString();

        return Inertia::render('Inventory/StockAdjustments/Index', [
            'adjustments' => $adjustments,
            'branches'    => $branches,
            'products'    => $products,
            'filters'     => $request->only(['search', 'branch_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id'       => 'required|exists:branches,id',
            'product_id'      => 'required|exists:products,id',
            'adjustment_date' => 'required|date',
            'type'            => 'nullable|in:in,out',
            'quantity_change' => 'required|integer|not_in:0',
            'weight_change'   => 'required|numeric',
            'reason'          => 'required|string|max:500',
        ]);

        $type = $request->input('type');
        $qtyChange = (int) $validated['quantity_change'];
        $wtChange  = (float) $validated['weight_change'];

        if ($type === 'out') {
            $qtyChange = -abs($qtyChange);
            $wtChange  = -abs($wtChange);
        } elseif ($type === 'in') {
            $qtyChange = abs($qtyChange);
            $wtChange  = abs($wtChange);
        }

        DB::transaction(function () use ($validated, $qtyChange, $wtChange) {
            $adjustment = StockAdjustment::create([
                'branch_id'       => $validated['branch_id'],
                'product_id'      => $validated['product_id'],
                'adjustment_date' => $validated['adjustment_date'],
                'quantity_change' => $qtyChange,
                'weight_change'   => $wtChange,
                'reason'          => $validated['reason'],
                'created_by'      => Auth::id(),
            ]);

            // Post to stock ledger
            $latestLedger = StockLedger::where('product_id', $validated['product_id'])
                ->where('branch_id', $validated['branch_id'])
                ->latest('id')->first();

            $prevQty = $latestLedger ? $latestLedger->balance_quantity : 0;
            $prevWt  = $latestLedger ? $latestLedger->balance_weight : 0;

            $qtyChange = (int) $validated['quantity_change'];
            $wtChange  = (float) $validated['weight_change'];

            StockLedger::create([
                'branch_id'        => $validated['branch_id'],
                'product_id'       => $validated['product_id'],
                'transaction_type' => 'adjustment',
                'reference_type'   => 'StockAdjustment',
                'reference_id'     => $adjustment->id,
                'quantity_in'      => max(0, $qtyChange),
                'quantity_out'     => max(0, -$qtyChange),
                'weight_in'        => max(0, $wtChange),
                'weight_out'       => max(0, -$wtChange),
                'balance_quantity' => $prevQty + $qtyChange,
                'balance_weight'   => $prevWt + $wtChange,
                'created_by'       => Auth::id(),
                'created_at'       => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Stock adjustment recorded successfully!');
    }

    public function destroy(StockAdjustment $adjustment)
    {
        // Remove associated ledger entry
        StockLedger::where('reference_type', 'StockAdjustment')
            ->where('reference_id', $adjustment->id)
            ->delete();

        $adjustment->delete();

        return redirect()->back()->with('success', 'Adjustment deleted successfully!');
    }
}
