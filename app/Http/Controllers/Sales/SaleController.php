<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['customer', 'branch', 'items.product.purity', 'creator', 'returns'])
            ->where(function ($q) {
                $q->where('sale_type', 'retail')
                  ->orWhereNull('sale_type');
            });

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'paid') {
                $query->where('status', '!=', 'cancelled')->where('due_amount', '<=', 0);
            } elseif ($status === 'due') {
                $query->where('status', '!=', 'cancelled')->where('due_amount', '>', 0)->where('paid_amount', '<=', 0);
            } elseif ($status === 'partial') {
                $query->where('status', '!=', 'cancelled')->where('due_amount', '>', 0)->where('paid_amount', '>', 0);
            } elseif ($status === 'returned' || $status === 'cancelled') {
                $query->where(function ($q) {
                    $q->where('status', 'cancelled')
                      ->orWhereHas('returns');
                });
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        $sales = $query->orderBy('sale_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $branches = Branch::where('status', 'active')->orderBy('name', 'asc')->get();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'branch_id']),
        ]);
    }

    public function wholesale(Request $request)
    {
        $query = Sale::with(['customer', 'branch', 'items.product.purity', 'creator'])
            ->where('sale_type', 'wholesale');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        $sales = $query->orderBy('sale_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $branches = Branch::where('status', 'active')->orderBy('name', 'asc')->get();
        $customers = Customer::orderBy('name', 'asc')->get();
        $products = Product::with(['purity', 'category'])->where('status', 'active')->get();

        return Inertia::render('Sales/Wholesale', [
            'sales' => $sales,
            'branches' => $branches,
            'customers' => $customers,
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'branch_id']),
        ]);
    }

    public function wholesaleCreate()
    {
        $customers = Customer::orderBy('name', 'asc')->get();
        $products = Product::with(['purity', 'category'])->where('status', 'active')->get();
        $branches = Branch::where('status', 'active')->orderBy('name', 'asc')->get();

        $todayDateStr = date('Ymd');
        $todaysCount = Sale::whereDate('created_at', date('Y-m-d'))->count() + 1;
        $autoInvoiceNo = 'WS-' . $todayDateStr . '-' . str_pad($todaysCount, 4, '0', STR_PAD_LEFT);
        
        $latestMetalPrices = \App\Models\MetalPrice::orderBy('effective_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->unique('purity_id')
            ->mapWithKeys(function ($item) {
                return [$item->purity_id => $item->price_per_gram];
            });

        return Inertia::render('Sales/WholesaleCreate', [
            'customers' => $customers,
            'products' => $products,
            'branches' => $branches,
            'autoInvoiceNo' => $autoInvoiceNo,
            'latestMetalPrices' => $latestMetalPrices,
        ]);
    }

    public function wholesaleStore(Request $request)
    {
        $validated = $request->validate([
            'invoice_no' => 'required|string|unique:sales,invoice_no',
            'branch_id' => 'required|exists:branches,id',
            'customer_id' => 'required|exists:customers,id',
            'sale_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.gross_weight' => 'required|numeric|min:0',
            'items.*.stone_weight' => 'nullable|numeric|min:0',
            'items.*.net_weight' => 'required|numeric|min:0',
            'items.*.rate_per_gram' => 'required|numeric|min:0',
            'items.*.making_charge_type' => 'required|in:fixed,per_gram',
            'items.*.making_charge' => 'nullable|numeric|min:0',
            'items.*.stone_charge' => 'nullable|numeric|min:0',
            'items.*.hallmark_charge' => 'nullable|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.total_amount' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'vat_type' => 'required|in:percent,fixed_per_vori',
            'vat_rate' => 'required|numeric|min:0',
            'total_stone_charge' => 'required|numeric|min:0',
            'total_making_charge' => 'required|numeric|min:0',
            'total_hallmark_charge' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'old_gold_exchange_value' => 'nullable|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $sale = DB::transaction(function () use ($validated) {
            $dueAmount = max(0, $validated['grand_total'] - $validated['paid_amount']);
            $status = $dueAmount <= 0 ? 'completed' : 'pending';

            $sale = Sale::create([
                'invoice_no' => $validated['invoice_no'],
                'branch_id' => $validated['branch_id'],
                'customer_id' => $validated['customer_id'],
                'sale_date' => $validated['sale_date'],
                'sale_type' => 'wholesale',
                'subtotal' => $validated['subtotal'],
                'vat_type' => $validated['vat_type'],
                'vat_rate' => $validated['vat_rate'],
                'total_stone_charge' => $validated['total_stone_charge'],
                'total_making_charge' => $validated['total_making_charge'],
                'total_hallmark_charge' => $validated['total_hallmark_charge'],
                'discount' => $validated['discount'] ?? 0,
                'tax' => $validated['tax'] ?? 0,
                'old_gold_exchange_value' => $validated['old_gold_exchange_value'] ?? 0,
                'grand_total' => $validated['grand_total'],
                'paid_amount' => $validated['paid_amount'],
                'due_amount' => $dueAmount,
                'status' => $status,
                'notes' => $validated['notes'] ?? null,
                'secure_token' => Str::random(32),
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'gross_weight' => $item['gross_weight'],
                    'stone_weight' => $item['stone_weight'] ?? 0,
                    'net_weight' => $item['net_weight'],
                    'rate_per_gram' => $item['rate_per_gram'],
                    'making_charge_type' => $item['making_charge_type'] ?? 'fixed',
                    'making_charge' => $item['making_charge'] ?? 0,
                    'stone_charge' => $item['stone_charge'] ?? 0,
                    'hallmark_charge' => $item['hallmark_charge'] ?? 0,
                    'quantity' => $item['quantity'],
                    'total_amount' => $item['total_amount'],
                ]);
            }

            return $sale;
        });

        if ($request->wantsJson() || $request->header('X-Inertia-Partial-Component')) {
            return back()->with('success', "Wholesale Invoice #{$sale->invoice_no} created successfully.")->with('sale_id', $sale->id);
        }

        return redirect()->route('sales.wholesale')->with('success', "Wholesale Invoice #{$sale->invoice_no} created successfully.");
    }

    public function create()
    {
        $customers = Customer::orderBy('name', 'asc')->get();
        $products = Product::with(['category', 'purity'])->where('status', 'active')->get();
        $branches = Branch::where('status', 'active')->orderBy('name', 'asc')->get();
        
        $invoicePrefix = SystemSetting::getByKey('invoice_prefix', 'INV-');
        $nextInvoice = $invoicePrefix . date('Ymd') . '-' . str_pad((Sale::count() + 1), 4, '0', STR_PAD_LEFT);

        $latestMetalPrices = \App\Models\MetalPrice::orderBy('effective_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->unique('purity_id')
            ->mapWithKeys(function ($item) {
                return [$item->purity_id => $item->price_per_gram];
            });

        return Inertia::render('Sales/Create', [
            'customers' => $customers,
            'products' => $products,
            'branches' => $branches,
            'autoInvoiceNo' => $nextInvoice,
            'defaultVatRate' => (float) SystemSetting::getByKey('default_vat_rate', '5.00'),
            'latestMetalPrices' => $latestMetalPrices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'branch_id' => 'required|exists:branches,id',
            'invoice_no' => 'required|string|unique:sales,invoice_no',
            'sale_date' => 'required|date',
            'sale_type' => 'required|in:retail,wholesale',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.gross_weight' => 'required|numeric|min:0.001',
            'items.*.stone_weight' => 'nullable|numeric|min:0',
            'items.*.net_weight' => 'required|numeric|min:0.001',
            'items.*.rate_per_gram' => 'required|numeric|min:0',
            'items.*.making_charge_type' => 'required|in:fixed,per_gram',
            'items.*.making_charge' => 'nullable|numeric|min:0',
            'items.*.stone_charge' => 'nullable|numeric|min:0',
            'items.*.hallmark_charge' => 'nullable|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.total_amount' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'vat_type' => 'required|in:percent,fixed_per_vori',
            'vat_rate' => 'required|numeric|min:0',
            'total_stone_charge' => 'required|numeric|min:0',
            'total_making_charge' => 'required|numeric|min:0',
            'total_hallmark_charge' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'old_gold_exchange_value' => 'nullable|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
        ]);

        $paidAmount = (float) $validated['paid_amount'];
        $grandTotal = (float) $validated['grand_total'];
        $dueAmount = max(0, $grandTotal - $paidAmount);
        $status = $dueAmount <= 0 ? 'completed' : 'pending';

        $sale = DB::transaction(function () use ($validated, $paidAmount, $dueAmount, $status) {
            $sale = Sale::create([
                'branch_id' => $validated['branch_id'],
                'customer_id' => $validated['customer_id'],
                'invoice_no' => $validated['invoice_no'],
                'sale_date' => $validated['sale_date'],
                'sale_type' => $validated['sale_type'],
                'subtotal' => $validated['subtotal'],
                'vat_type' => $validated['vat_type'],
                'vat_rate' => $validated['vat_rate'],
                'total_stone_charge' => $validated['total_stone_charge'],
                'total_making_charge' => $validated['total_making_charge'],
                'total_hallmark_charge' => $validated['total_hallmark_charge'],
                'discount' => $validated['discount'] ?? 0,
                'tax' => $validated['tax'] ?? 0,
                'old_gold_exchange_value' => $validated['old_gold_exchange_value'] ?? 0,
                'grand_total' => $validated['grand_total'],
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'status' => $status,
                'secure_token' => Str::random(32),
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'gross_weight' => $item['gross_weight'],
                    'stone_weight' => $item['stone_weight'] ?? 0,
                    'net_weight' => $item['net_weight'],
                    'rate_per_gram' => $item['rate_per_gram'],
                    'making_charge_type' => $item['making_charge_type'] ?? 'fixed',
                    'making_charge' => $item['making_charge'] ?? 0,
                    'stone_charge' => $item['stone_charge'] ?? 0,
                    'hallmark_charge' => $item['hallmark_charge'] ?? 0,
                    'quantity' => $item['quantity'],
                    'total_amount' => $item['total_amount'],
                ]);
            }

            return $sale;
        });

        return redirect()->route('sales.show', $sale->id)
            ->with('success', "Sale Invoice #{$sale->invoice_no} created successfully.");
    }

    public function show(Sale $sale)
    {
        $sale->load(['customer', 'branch', 'creator', 'items.product.category', 'items.product.purity']);
        $settings = SystemSetting::where('group', 'invoice')->pluck('value', 'key')->toArray();

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
            'settings' => $settings,
        ]);
    }

    public function edit(Sale $sale)
    {
        $sale->load(['items.product.purity', 'items.product.category', 'customer', 'branch']);

        $branches = Branch::where('status', 'active')->orderBy('name', 'asc')->get();
        $customers = Customer::orderBy('name', 'asc')->get();
        $products = Product::with(['purity', 'category'])->where('status', 'active')->get();

        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'branches' => $branches,
            'customers' => $customers,
            'products' => $products,
            'defaultVatRate' => (float) SystemSetting::getByKey('default_vat_rate', '5.00'),
        ]);
    }

    public function update(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'branch_id' => 'required|exists:branches,id',
            'sale_date' => 'required|date',
            'sale_type' => 'required|in:retail,wholesale',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.gross_weight' => 'required|numeric|min:0.001',
            'items.*.stone_weight' => 'nullable|numeric|min:0',
            'items.*.net_weight' => 'required|numeric|min:0.001',
            'items.*.rate_per_gram' => 'required|numeric|min:0',
            'items.*.making_charge_type' => 'required|in:fixed,per_gram',
            'items.*.making_charge' => 'nullable|numeric|min:0',
            'items.*.stone_charge' => 'nullable|numeric|min:0',
            'items.*.hallmark_charge' => 'nullable|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.total_amount' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'vat_type' => 'required|in:percent,fixed_per_vori',
            'vat_rate' => 'required|numeric|min:0',
            'total_stone_charge' => 'required|numeric|min:0',
            'total_making_charge' => 'required|numeric|min:0',
            'total_hallmark_charge' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'old_gold_exchange_value' => 'nullable|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
        ]);

        $paidAmount = (float) $validated['paid_amount'];
        $grandTotal = (float) $validated['grand_total'];
        $dueAmount = max(0, $grandTotal - $paidAmount);
        $status = $dueAmount <= 0 ? 'completed' : 'pending';

        DB::transaction(function () use ($sale, $validated, $paidAmount, $dueAmount, $status) {
            $sale->update([
                'branch_id' => $validated['branch_id'],
                'customer_id' => $validated['customer_id'],
                'sale_date' => $validated['sale_date'],
                'sale_type' => $validated['sale_type'],
                'subtotal' => $validated['subtotal'],
                'vat_type' => $validated['vat_type'],
                'vat_rate' => $validated['vat_rate'],
                'total_stone_charge' => $validated['total_stone_charge'],
                'total_making_charge' => $validated['total_making_charge'],
                'total_hallmark_charge' => $validated['total_hallmark_charge'],
                'discount' => $validated['discount'] ?? 0,
                'tax' => $validated['tax'] ?? 0,
                'old_gold_exchange_value' => $validated['old_gold_exchange_value'] ?? 0,
                'grand_total' => $validated['grand_total'],
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'status' => $sale->status === 'cancelled' ? 'cancelled' : $status,
            ]);

            // Replace sale items
            $sale->items()->delete();

            foreach ($validated['items'] as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'gross_weight' => $item['gross_weight'],
                    'stone_weight' => $item['stone_weight'] ?? 0,
                    'net_weight' => $item['net_weight'],
                    'rate_per_gram' => $item['rate_per_gram'],
                    'making_charge_type' => $item['making_charge_type'] ?? 'fixed',
                    'making_charge' => $item['making_charge'] ?? 0,
                    'stone_charge' => $item['stone_charge'] ?? 0,
                    'hallmark_charge' => $item['hallmark_charge'] ?? 0,
                    'quantity' => $item['quantity'],
                    'total_amount' => $item['total_amount'],
                ]);
            }
        });

        return redirect()->route('sales.index')
            ->with('success', "Sale Invoice #{$sale->invoice_no} updated successfully.");
    }

    public function destroy(Sale $sale)
    {
        $invoiceNo = $sale->invoice_no;

        DB::transaction(function () use ($sale) {
            // Delete associated payments
            $sale->payments()->delete();

            // Delete associated returns and return items
            foreach ($sale->returns as $return) {
                $return->items()->delete();
                $return->delete();
            }

            // Delete sale items
            $sale->items()->delete();

            // Delete the sale invoice
            $sale->delete();
        });

        return redirect()->back()
            ->with('success', "Sale Invoice #{$invoiceNo} deleted successfully.");
    }

    public function print(Sale $sale)
    {
        $sale->load(['customer', 'branch', 'creator', 'items.product.category', 'items.product.purity']);
        $settings = SystemSetting::where('group', 'invoice')->pluck('value', 'key')->toArray();

        return Inertia::render('Sales/PrintA4', [
            'sale' => $sale,
            'settings' => $settings
        ]);
    }

    public function verifyInvoice($token)
    {
        $sale = Sale::with(['customer', 'branch', 'items.product.category', 'items.product.purity'])
            ->where('secure_token', $token)
            ->firstOrFail();

        $settings = SystemSetting::where('group', 'invoice')->pluck('value', 'key')->toArray();

        return Inertia::render('Public/VerifyInvoice', [
            'sale' => $sale,
            'settings' => $settings
        ]);
    }
}
