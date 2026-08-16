<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Purity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'purity', 'branch', 'currentAssignment.artisan'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_no', 'like', "%{$search}%")
                  ->orWhere('product_description', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('metal_type')) {
            $query->where('metal_type', $request->metal_type);
        }

        $orders = $query->paginate(15)->withQueryString();

        $stats = [
            'total_orders' => Order::count(),
            'new_orders' => Order::where('status', 'new')->count(),
            'in_production' => Order::whereIn('status', ['assigned', 'in_production'])->count(),
            'ready_delivered' => Order::whereIn('status', ['ready', 'delivered'])->count(),
        ];

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'metal_type']),
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $customers = Customer::where('status', 'active')->select('id', 'name', 'phone', 'code', 'address', 'due_balance')->get();
        $purities = Purity::select('id', 'name', 'percentage')->get();
        $branches = Branch::select('id', 'name')->get();
        $products = \App\Models\Product::where('status', 'active')->select('id', 'name', 'sku', 'metal_type', 'purity_id', 'gross_weight')->get();
        $categories = \App\Models\ProductCategory::orderBy('name')->get(['id', 'name']);
        $suppliers = \App\Models\Supplier::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Orders/Create', [
            'customers' => $customers,
            'purities' => $purities,
            'branches' => $branches,
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'customer_id' => 'required|exists:customers,id',
            'product_id' => 'nullable|exists:products,id',
            'order_date' => 'required|date',
            'delivery_date' => 'nullable|date|after_or_equal:order_date',
            'product_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'product_description' => 'required|string',
            'metal_type' => 'required|string|max:30',
            'purity_id' => 'required|exists:purities,id',
            'rate_per_vori' => 'nullable|numeric|min:0',
            'vori' => 'nullable|numeric|min:0',
            'ana' => 'nullable|numeric|min:0',
            'roti' => 'nullable|numeric|min:0',
            'point' => 'nullable|numeric|min:0',
            'estimated_weight' => 'required|numeric|min:0',
            'making_charge' => 'nullable|numeric|min:0',
            'vat_amount' => 'nullable|numeric|min:0',
            'hallmark_charge' => 'nullable|numeric|min:0',
            'stone_charge' => 'nullable|numeric|min:0',
            'estimated_amount' => 'required|numeric|min:0',
            'advance_amount' => 'nullable|numeric|min:0',
            'reference_image' => 'nullable|image|max:4096',
        ]);

        $advance = $validated['advance_amount'] ?? 0;
        $due = max(0, $validated['estimated_amount'] - $advance);

        $imagePath = null;
        if ($request->hasFile('reference_image')) {
            $imagePath = $request->file('reference_image')->store('orders', 'public');
        }

        // Auto generate order number
        $dateStr = date('Ymd');
        $count = Order::whereDate('created_at', now()->toDateString())->count() + 1;
        $orderNo = 'ORD-' . $dateStr . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $order = Order::create([
            'branch_id' => $validated['branch_id'],
            'customer_id' => $validated['customer_id'],
            'product_id' => $validated['product_id'] ?? null,
            'order_no' => $orderNo,
            'order_date' => $validated['order_date'],
            'delivery_date' => $validated['delivery_date'] ?? null,
            'product_name' => $validated['product_name'] ?? null,
            'category' => $validated['category'] ?? null,
            'product_description' => $validated['product_description'],
            'reference_image' => $imagePath,
            'metal_type' => $validated['metal_type'],
            'purity_id' => $validated['purity_id'],
            'rate_per_vori' => $validated['rate_per_vori'] ?? 0,
            'vori' => $validated['vori'] ?? 0,
            'ana' => $validated['ana'] ?? 0,
            'roti' => $validated['roti'] ?? 0,
            'point' => $validated['point'] ?? 0,
            'estimated_weight' => $validated['estimated_weight'],
            'making_charge' => $validated['making_charge'] ?? 0,
            'vat_amount' => $validated['vat_amount'] ?? 0,
            'hallmark_charge' => $validated['hallmark_charge'] ?? 0,
            'stone_charge' => $validated['stone_charge'] ?? 0,
            'estimated_amount' => $validated['estimated_amount'],
            'advance_amount' => $advance,
            'due_amount' => $due,
            'status' => 'new',
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('orders.index')->with('success', "Order {$order->order_no} created successfully!");
    }

    public function show(Order $order)
    {
        $order->load([
            'customer',
            'purity',
            'branch',
            'creator',
            'assignments.artisan',
            'payments.artisan',
            'payments.creator'
        ]);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    public function edit(Order $order)
    {
        $customers = Customer::where('status', 'active')->select('id', 'name', 'phone', 'code')->get();
        $purities = Purity::select('id', 'name', 'percentage')->get();
        $branches = Branch::select('id', 'name')->get();

        return Inertia::render('Orders/Edit', [
            'order' => $order->load(['customer', 'purity', 'branch']),
            'customers' => $customers,
            'purities' => $purities,
            'branches' => $branches,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'customer_id' => 'required|exists:customers,id',
            'order_date' => 'required|date',
            'delivery_date' => 'nullable|date|after_or_equal:order_date',
            'product_description' => 'required|string',
            'metal_type' => 'required|string|max:30',
            'purity_id' => 'required|exists:purities,id',
            'estimated_weight' => 'required|numeric|min:0',
            'estimated_amount' => 'required|numeric|min:0',
            'advance_amount' => 'nullable|numeric|min:0',
            'status' => 'required|in:new,assigned,in_production,ready,delivered,cancelled',
            'reference_image' => 'nullable|image|max:4096',
        ]);

        $advance = $validated['advance_amount'] ?? 0;
        $due = max(0, $validated['estimated_amount'] - $advance);

        if ($request->hasFile('reference_image')) {
            if ($order->reference_image) {
                Storage::disk('public')->delete($order->reference_image);
            }
            $order->reference_image = $request->file('reference_image')->store('orders', 'public');
        }

        $order->update([
            'branch_id' => $validated['branch_id'],
            'customer_id' => $validated['customer_id'],
            'order_date' => $validated['order_date'],
            'delivery_date' => $validated['delivery_date'] ?? null,
            'product_description' => $validated['product_description'],
            'metal_type' => $validated['metal_type'],
            'purity_id' => $validated['purity_id'],
            'estimated_weight' => $validated['estimated_weight'],
            'estimated_amount' => $validated['estimated_amount'],
            'advance_amount' => $advance,
            'due_amount' => $due,
            'status' => $validated['status'],
        ]);

        return redirect()->route('orders.index')->with('success', "Order {$order->order_no} updated successfully!");
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,assigned,in_production,ready,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', "Order {$order->order_no} status updated to {$validated['status']}.");
    }

    public function recordPayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $newAdvance = $order->advance_amount + $validated['amount'];
        $newDue = max(0, $order->estimated_amount - $newAdvance);

        $order->update([
            'advance_amount' => $newAdvance,
            'due_amount' => $newDue,
        ]);

        return redirect()->back()->with('success', "Payment of ৳{$validated['amount']} recorded for Order {$order->order_no}.");
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }
}
