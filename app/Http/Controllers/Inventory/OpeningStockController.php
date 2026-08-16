<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purity;
use App\Models\StockLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OpeningStockController extends Controller
{
    public function index(Request $request)
    {
        $branches   = Branch::all();
        $categories = ProductCategory::orderBy('name')->get(['id', 'name']);
        $purities   = Purity::orderBy('name')->get(['id', 'name']);

        // Fetch opening stock ledger entries directly (joined with products)
        $query = StockLedger::with(['product.category', 'product.purity', 'branch'])
            ->where('transaction_type', 'opening');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('product', function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('sku',  'like', "%{$s}%");
            });
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $openingStocks = $query->latest('id')->paginate(20)->withQueryString();

        // Products list for Add/Edit dropdowns
        $products = Product::with(['category', 'purity'])
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'stock_type', 'metal_type', 'purity_id', 'category_id',
                   'gross_weight', 'net_weight', 'rate_per_vori', 'vat_percentage']);

        return Inertia::render('Inventory/OpeningStock/Index', [
            'openingStocks' => $openingStocks,
            'branches'      => $branches,
            'categories'    => $categories,
            'purities'      => $purities,
            'products'      => $products,
            'filters'       => $request->only(['search', 'branch_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'    => 'required|exists:products,id',
            'branch_id'     => 'required|exists:branches,id',
            'quantity'      => 'required|integer|min:0',
            'weight_in_gm'  => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            // Remove old opening for same product+branch
            StockLedger::where('transaction_type', 'opening')
                ->where('product_id', $validated['product_id'])
                ->where('branch_id',  $validated['branch_id'])
                ->delete();

            StockLedger::create([
                'branch_id'        => $validated['branch_id'],
                'product_id'       => $validated['product_id'],
                'transaction_type' => 'opening',
                'quantity_in'      => $validated['quantity'],
                'quantity_out'     => 0,
                'weight_in'        => $validated['weight_in_gm'],
                'weight_out'       => 0,
                'balance_quantity' => $validated['quantity'],
                'balance_weight'   => $validated['weight_in_gm'],
                'created_by'       => Auth::id(),
                'created_at'       => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Opening stock saved successfully!');
    }

    public function update(Request $request, StockLedger $openingStock)
    {
        $validated = $request->validate([
            'product_id'   => 'required|exists:products,id',
            'branch_id'    => 'required|exists:branches,id',
            'quantity'     => 'required|integer|min:0',
            'weight_in_gm' => 'required|numeric|min:0',
        ]);

        $openingStock->update([
            'product_id'       => $validated['product_id'],
            'branch_id'        => $validated['branch_id'],
            'quantity_in'      => $validated['quantity'],
            'balance_quantity' => $validated['quantity'],
            'weight_in'        => $validated['weight_in_gm'],
            'balance_weight'   => $validated['weight_in_gm'],
        ]);

        return redirect()->back()->with('success', 'Opening stock updated successfully!');
    }

    public function destroy(StockLedger $openingStock)
    {
        $openingStock->delete();
        return redirect()->back()->with('success', 'Opening stock entry deleted.');
    }
}
