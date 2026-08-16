<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\MetalPrice;
use App\Models\Product;
use App\Models\Purity;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchasePayment;
use App\Models\PurchaseReturn;
use App\Models\PurchaseReturnItem;
use App\Models\Supplier;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use App\Models\ProductCategory;

class PurchaseController extends Controller
{
    /**
     * Purchase List Page
     */
    public function index(Request $request)
    {
        $query = Purchase::with(['supplier', 'branch', 'items.product', 'items.category', 'items.purity', 'payments', 'creator'])
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                         ->orWhere('company_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('purchase_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('purchase_date', '<=', $request->date_to);
        }

        $purchases = $query->paginate(15)->withQueryString();
        $suppliers = Supplier::orderBy('name', 'asc')->get(['id', 'name', 'company_name']);
        $branches  = Branch::where('status', 'active')->get(['id', 'name']);

        // Summary Statistics
        $totalPurchases = Purchase::sum('grand_total');
        $totalPaid      = Purchase::sum('paid_amount');
        $totalDue       = Purchase::sum('due_amount');

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'branches'  => $branches,
            'filters'   => $request->only(['search', 'supplier_id', 'status', 'date_from', 'date_to']),
            'stats'     => [
                'total_purchases' => $totalPurchases,
                'total_paid'      => $totalPaid,
                'total_due'       => $totalDue,
            ],
        ]);
    }

    /**
     * Add Purchase Page
     */
    public function create()
    {
        $suppliers   = Supplier::orderBy('name', 'asc')->get();
        $products    = Product::where('status', 'active')->orderBy('name', 'asc')->get();
        $categories  = ProductCategory::orderBy('name', 'asc')->get();
        $purities    = Purity::where('is_active', true)->get();
        $branches    = Branch::where('status', 'active')->get();
        $metalPrices = MetalPrice::with('purity')->orderBy('effective_date', 'desc')->get();

        // Auto-generate invoice number using system setting prefix
        $prefix = SystemSetting::getByKey('purchase_prefix', 'PUR-');
        $nextId = (Purchase::max('id') ?? 0) + 1;
        $autoInvoiceNo = $prefix . str_pad($nextId, 5, '0', STR_PAD_LEFT);

        return Inertia::render('Purchases/Create', [
            'suppliers'     => $suppliers,
            'products'      => $products,
            'categories'    => $categories,
            'purities'      => $purities,
            'branches'      => $branches,
            'metalPrices'   => $metalPrices,
            'autoInvoiceNo' => $autoInvoiceNo,
        ]);
    }

    /**
     * Store Purchase
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id'   => 'required|exists:suppliers,id',
            'branch_id'     => 'required|exists:branches,id',
            'invoice_no'    => 'required|string|max:30|unique:purchases,invoice_no',
            'purchase_date' => 'required|date',
            'subtotal'      => 'required|numeric|min:0',
            'discount'      => 'nullable|numeric|min:0',
            'tax'           => 'nullable|numeric|min:0',
            'other_charges' => 'nullable|numeric|min:0',
            'grand_total'   => 'required|numeric|min:0',
            'paid_amount'   => 'required|numeric|min:0',
            'due_amount'    => 'required|numeric|min:0',
            'payment_method'=> 'nullable|string|in:cash,bank,cheque,mobile_banking',
            'notes'         => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.product_id'    => 'nullable|exists:products,id',
            'items.*.item_name'     => 'nullable|string|max:255',
            'items.*.stock_type'    => 'nullable|string',
            'items.*.category_id'   => 'nullable|exists:product_categories,id',
            'items.*.metal_type'    => 'required|string',
            'items.*.purity_id'     => 'required|exists:purities,id',
            'items.*.hallmark_no'   => 'nullable|string|max:100',
            'items.*.photo'         => 'nullable|string',
            'items.*.gross_weight'  => 'required|numeric|min:0',
            'items.*.stone_weight'  => 'nullable|numeric|min:0',
            'items.*.net_weight'    => 'required|numeric|min:0',
            'items.*.rate_per_gram' => 'required|numeric|min:0',
            'items.*.making_charge' => 'nullable|numeric|min:0',
            'items.*.stone_charge'  => 'nullable|numeric|min:0',
            'items.*.wastage_percentage' => 'nullable|numeric|min:0',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.total_amount'  => 'required|numeric|min:0',
        ]);

        $purchase = DB::transaction(function () use ($validated, $request) {
            $purchase = Purchase::create([
                'branch_id'     => $validated['branch_id'],
                'supplier_id'   => $validated['supplier_id'],
                'invoice_no'    => $validated['invoice_no'],
                'purchase_date' => $validated['purchase_date'],
                'subtotal'      => $validated['subtotal'],
                'discount'      => $validated['discount'] ?? 0,
                'tax'           => $validated['tax'] ?? 0,
                'other_charges' => $validated['other_charges'] ?? 0,
                'grand_total'   => $validated['grand_total'],
                'paid_amount'   => $validated['paid_amount'],
                'due_amount'    => $validated['due_amount'],
                'status'        => 'completed',
                'notes'         => $validated['notes'] ?? null,
                'created_by'    => auth()->id() ?? 1,
            ]);

            foreach ($validated['items'] as $itemData) {
                PurchaseItem::create([
                    'purchase_id'   => $purchase->id,
                    'product_id'    => $itemData['product_id'] ?? null,
                    'item_name'     => $itemData['item_name'] ?? null,
                    'stock_type'    => $itemData['stock_type'] ?? 'readymade',
                    'category_id'   => $itemData['category_id'] ?? null,
                    'description'   => $itemData['description'] ?? null,
                    'metal_type'    => $itemData['metal_type'],
                    'purity_id'     => $itemData['purity_id'],
                    'hallmark_no'   => $itemData['hallmark_no'] ?? null,
                    'photo'         => $itemData['photo'] ?? null,
                    'gross_weight'  => $itemData['gross_weight'],
                    'stone_weight'  => $itemData['stone_weight'] ?? 0,
                    'net_weight'    => $itemData['net_weight'],
                    'rate_per_gram' => $itemData['rate_per_gram'],
                    'making_charge' => $itemData['making_charge'] ?? 0,
                    'stone_charge'  => $itemData['stone_charge'] ?? 0,
                    'wastage_percentage' => $itemData['wastage_percentage'] ?? 0,
                    'quantity'      => $itemData['quantity'],
                    'total_amount'  => $itemData['total_amount'],
                ]);

                // Increment product stock if product_id exists & column exists
                if (!empty($itemData['product_id'])) {
                    $product = Product::find($itemData['product_id']);
                    if ($product && \Illuminate\Support\Facades\Schema::hasColumn('products', 'stock_quantity')) {
                        $product->increment('stock_quantity', $itemData['quantity']);
                    }
                }
            }

            // Record payment if paid_amount > 0
            if ($validated['paid_amount'] > 0) {
                $payNo = 'PAY-' . strtoupper(uniqid());
                PurchasePayment::create([
                    'purchase_id'    => $purchase->id,
                    'branch_id'      => $purchase->branch_id,
                    'payment_no'     => $payNo,
                    'payment_date'   => $purchase->purchase_date,
                    'amount'         => $validated['paid_amount'],
                    'payment_method' => $validated['payment_method'] ?? 'cash',
                    'reference_no'   => $purchase->invoice_no,
                    'notes'          => 'Initial payment on purchase',
                    'created_by'     => auth()->id() ?? 1,
                ]);
            }

            // Update Supplier Balance (due amount increases payable)
            $supplier = Supplier::find($validated['supplier_id']);
            if ($supplier && isset($supplier->opening_balance)) {
                $supplier->increment('opening_balance', $validated['due_amount']);
            }

            return $purchase;
        });

        return redirect()->route('purchases.index')
            ->with('success', "Purchase Invoice #{$purchase->invoice_no} recorded successfully.");
    }

    /**
     * View Purchase Details
     */
    public function show(Purchase $purchase)
    {
        $purchase->load(['supplier', 'branch', 'items.product', 'items.category', 'items.purity', 'returns', 'payments', 'creator']);

        if (request()->wantsJson() || request()->ajax()) {
            return response()->json($purchase);
        }

        return redirect()->route('purchases.index');
    }

    /**
     * Edit Purchase Form Page
     */
    public function edit(Purchase $purchase)
    {
        $purchase->load(['items.product', 'items.category', 'items.purity', 'supplier', 'branch']);

        $suppliers   = Supplier::orderBy('name', 'asc')->get();
        $products    = Product::where('status', 'active')->orderBy('name', 'asc')->get();
        $categories  = ProductCategory::orderBy('name', 'asc')->get();
        $purities    = Purity::where('is_active', true)->get();
        $branches    = Branch::where('status', 'active')->get();
        $metalPrices = MetalPrice::with('purity')->orderBy('effective_date', 'desc')->get();

        return Inertia::render('Purchases/Edit', [
            'purchase'    => $purchase,
            'suppliers'   => $suppliers,
            'products'    => $products,
            'categories'  => $categories,
            'purities'    => $purities,
            'branches'    => $branches,
            'metalPrices' => $metalPrices,
        ]);
    }

    /**
     * Update Purchase
     */
    public function update(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'supplier_id'   => 'required|exists:suppliers,id',
            'branch_id'     => 'required|exists:branches,id',
            'purchase_date' => 'required|date',
            'subtotal'      => 'required|numeric|min:0',
            'discount'      => 'nullable|numeric|min:0',
            'tax'           => 'nullable|numeric|min:0',
            'other_charges' => 'nullable|numeric|min:0',
            'grand_total'   => 'required|numeric|min:0',
            'paid_amount'   => 'required|numeric|min:0',
            'due_amount'    => 'required|numeric|min:0',
            'payment_method'=> 'nullable|string|in:cash,bank,cheque,mobile_banking',
            'notes'         => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.product_id'    => 'nullable|exists:products,id',
            'items.*.item_name'     => 'nullable|string|max:255',
            'items.*.stock_type'    => 'nullable|string',
            'items.*.category_id'   => 'nullable|exists:product_categories,id',
            'items.*.metal_type'    => 'required|string',
            'items.*.purity_id'     => 'required|exists:purities,id',
            'items.*.gross_weight'  => 'required|numeric|min:0',
            'items.*.stone_weight'  => 'nullable|numeric|min:0',
            'items.*.net_weight'    => 'required|numeric|min:0',
            'items.*.rate_per_gram' => 'required|numeric|min:0',
            'items.*.making_charge' => 'nullable|numeric|min:0',
            'items.*.stone_charge'  => 'nullable|numeric|min:0',
            'items.*.wastage_percentage' => 'nullable|numeric|min:0',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.total_amount'  => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $purchase) {
            $purchase->update([
                'branch_id'     => $validated['branch_id'],
                'supplier_id'   => $validated['supplier_id'],
                'purchase_date' => $validated['purchase_date'],
                'subtotal'      => $validated['subtotal'],
                'discount'      => $validated['discount'] ?? 0,
                'tax'           => $validated['tax'] ?? 0,
                'other_charges' => $validated['other_charges'] ?? 0,
                'grand_total'   => $validated['grand_total'],
                'paid_amount'   => $validated['paid_amount'],
                'due_amount'    => $validated['due_amount'],
                'notes'         => $validated['notes'] ?? null,
            ]);

            // Re-sync items
            $purchase->items()->delete();
            foreach ($validated['items'] as $itemData) {
                PurchaseItem::create([
                    'purchase_id'   => $purchase->id,
                    'product_id'    => $itemData['product_id'] ?? null,
                    'item_name'     => $itemData['item_name'] ?? null,
                    'stock_type'    => $itemData['stock_type'] ?? 'readymade',
                    'category_id'   => $itemData['category_id'] ?? null,
                    'description'   => $itemData['description'] ?? null,
                    'metal_type'    => $itemData['metal_type'],
                    'purity_id'     => $itemData['purity_id'],
                    'hallmark_no'   => $itemData['hallmark_no'] ?? null,
                    'gross_weight'  => $itemData['gross_weight'],
                    'stone_weight'  => $itemData['stone_weight'] ?? 0,
                    'net_weight'    => $itemData['net_weight'],
                    'rate_per_gram' => $itemData['rate_per_gram'],
                    'making_charge' => $itemData['making_charge'] ?? 0,
                    'stone_charge'  => $itemData['stone_charge'] ?? 0,
                    'wastage_percentage' => $itemData['wastage_percentage'] ?? 0,
                    'quantity'      => $itemData['quantity'],
                    'total_amount'  => $itemData['total_amount'],
                ]);
            }
        });

        return redirect()->route('purchases.index')
            ->with('success', "Purchase Invoice #{$purchase->invoice_no} updated successfully.");
    }

    /**
     * Delete Purchase
     */
    public function destroy(Purchase $purchase)
    {
        DB::transaction(function () use ($purchase) {
            $purchase->load(['items', 'returns', 'payments']);

            // If purchase has returns, block deletion with user friendly message
            if ($purchase->returns()->exists()) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'error' => "Cannot delete Purchase #{$purchase->invoice_no} because it has associated purchase returns."
                ]);
            }

            // Revert product stock quantities if applicable
            foreach ($purchase->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product && \Illuminate\Support\Facades\Schema::hasColumn('products', 'stock_quantity')) {
                        $product->decrement('stock_quantity', min($product->stock_quantity, $item->quantity));
                    }
                }
            }

            // Revert supplier balance if due amount was applied
            $supplier = Supplier::find($purchase->supplier_id);
            if ($supplier && isset($supplier->opening_balance) && $purchase->due_amount > 0) {
                $supplier->decrement('opening_balance', min($supplier->opening_balance, $purchase->due_amount));
            }

            // Delete payments & items
            $purchase->payments()->delete();
            $purchase->items()->delete();
            $purchase->delete();
        });

        return redirect()->route('purchases.index')
            ->with('success', "Purchase Invoice #{$purchase->invoice_no} deleted successfully.");
    }

    /**
     * Purchase Return List & Form Page
     */
    public function returns(Request $request)
    {
        $returns = PurchaseReturn::with(['purchase.supplier', 'branch', 'items.purchaseItem.product', 'creator'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        $purchases = Purchase::with(['supplier', 'items.product', 'items.purity'])
            ->orderBy('id', 'desc')
            ->get();

        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Purchases/Returns', [
            'returns'            => $returns,
            'purchases'          => $purchases,
            'branches'           => $branches,
            'selectedPurchaseId' => $request->query('purchase_id'),
        ]);
    }

    /**
     * Store Purchase Return
     */
    public function storeReturn(Request $request)
    {
        $validated = $request->validate([
            'purchase_id'  => 'required|exists:purchases,id',
            'return_date'   => 'required|date',
            'reason'        => 'nullable|string',
            'total_amount'  => 'required|numeric|min:0',
            'items'         => 'required|array|min:1',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.amount'     => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $purchase = Purchase::with('items')->findOrFail($validated['purchase_id']);
            $returnNo = 'PRET-' . strtoupper(uniqid());

            $returnObj = PurchaseReturn::create([
                'purchase_id'  => $purchase->id,
                'branch_id'    => $purchase->branch_id,
                'return_no'    => $returnNo,
                'return_date'  => $validated['return_date'],
                'reason'       => $validated['reason'] ?? null,
                'total_amount' => $validated['total_amount'],
                'created_by'   => auth()->id() ?? 1,
            ]);

            foreach ($validated['items'] as $item) {
                // Find matching purchase item
                $purchaseItem = null;
                if (!empty($item['purchase_item_id'])) {
                    $purchaseItem = PurchaseItem::find($item['purchase_item_id']);
                } elseif (!empty($item['product_id'])) {
                    $purchaseItem = PurchaseItem::where('purchase_id', $purchase->id)
                        ->where('product_id', $item['product_id'])
                        ->first() ?? $purchase->items->first();
                } else {
                    $purchaseItem = $purchase->items->first();
                }

                $purchaseItemId = $purchaseItem ? $purchaseItem->id : $purchase->items->first()->id;
                $weight = $item['weight'] ?? ($purchaseItem ? $purchaseItem->net_weight : 0);

                PurchaseReturnItem::create([
                    'purchase_return_id' => $returnObj->id,
                    'purchase_item_id'   => $purchaseItemId,
                    'quantity'           => $item['quantity'],
                    'weight'             => $weight,
                    'amount'             => $item['amount'],
                ]);

                // Decrement stock inventory for returned item
                if ($purchaseItem && $purchaseItem->product_id) {
                    $product = Product::find($purchaseItem->product_id);
                    if ($product && \Illuminate\Support\Facades\Schema::hasColumn('products', 'stock_quantity')) {
                        $product->decrement('stock_quantity', $item['quantity']);
                    }
                }
            }

            // Adjust purchase due amount / supplier balance
            if ($purchase->due_amount >= $validated['total_amount']) {
                $purchase->decrement('due_amount', $validated['total_amount']);
            } else {
                $rem = $validated['total_amount'] - $purchase->due_amount;
                $purchase->update(['due_amount' => 0]);
            }
        });

        return redirect()->route('purchases.returns')
            ->with('success', 'Purchase return recorded and inventory adjusted.');
    }

    /**
     * Purchase Payments List & Entry Page
     */
    public function payments(Request $request)
    {
        $search = $request->input('search');
        $supplierId = $request->input('supplier_id');

        $query = Purchase::with(['supplier', 'branch', 'items.product', 'items.purity', 'payments', 'creator'])
            ->where('due_amount', '>', 0);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($supplierId)) {
            $query->where('supplier_id', $supplierId);
        }

        $duePurchases = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $suppliers = Supplier::select('id', 'name', 'company_name')->orderBy('name')->get();
        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Purchases/Payments', [
            'duePurchases' => $duePurchases,
            'suppliers'    => $suppliers,
            'branches'     => $branches,
            'filters'      => $request->only(['search', 'supplier_id']),
        ]);
    }

    /**
     * Store Purchase Payment
     */
    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'purchase_id'    => 'required|exists:purchases,id',
            'payment_date'   => 'required|date',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank,cheque,mobile_banking',
            'reference_no'   => 'nullable|string|max:50',
            'notes'          => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $purchase = Purchase::findOrFail($validated['purchase_id']);
            $payNo    = 'PAY-' . strtoupper(uniqid());

            PurchasePayment::create([
                'purchase_id'    => $purchase->id,
                'branch_id'      => $purchase->branch_id,
                'payment_no'     => $payNo,
                'payment_date'   => $validated['payment_date'],
                'amount'         => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_no'   => $validated['reference_no'] ?? null,
                'notes'          => $validated['notes'] ?? null,
                'created_by'     => auth()->id() ?? 1,
            ]);

            // Update purchase paid & due amounts
            $newPaid = $purchase->paid_amount + $validated['amount'];
            $newDue  = max(0, $purchase->grand_total - $newPaid);

            $purchase->update([
                'paid_amount' => $newPaid,
                'due_amount'  => $newDue,
            ]);
        });

        return redirect()->route('purchases.payments')
            ->with('success', 'Purchase due payment recorded successfully.');
    }
}
