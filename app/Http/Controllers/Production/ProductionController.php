<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Production;
use App\Models\Purity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductionController extends Controller
{
    public function index(Request $request)
    {
        $query = Production::with(['branch', 'artisan', 'order.customer', 'category', 'product', 'purity', 'creator'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('production_no', 'like', "%{$search}%")
                  ->orWhereHas('artisan', function ($aq) use ($search) {
                      $aq->where('name', 'like', "%{$search}%")
                         ->orWhere('code', 'like', "%{$search}%");
                  })->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_no', 'like', "%{$search}%")
                         ->orWhere('product_name', 'like', "%{$search}%");
                  })->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('artisan_id')) {
            $query->where('artisan_id', $request->artisan_id);
        }

        $productions = $query->paginate(15)->withQueryString();
        $artisans = Artisan::where('status', 'active')->select('id', 'name', 'code', 'specialization')->get();

        $stats = [
            'total' => Production::count(),
            'pending' => Production::where('status', 'pending')->count(),
            'in_progress' => Production::where('status', 'in_progress')->count(),
            'completed' => Production::where('status', 'completed')->count(),
            'total_metal_weight' => (float) Production::sum('weight_gm'),
        ];

        return Inertia::render('Production/Index', [
            'productions' => $productions,
            'artisans' => $artisans,
            'filters' => $request->only(['search', 'status', 'artisan_id']),
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $branches = Branch::select('id', 'name')->get();
        $artisans = Artisan::where('status', 'active')->select('id', 'name', 'code', 'specialization')->get();
        $orders = Order::whereIn('status', ['new', 'assigned', 'in_production'])
            ->with('customer')
            ->select('id', 'order_no', 'product_name', 'estimated_weight')
            ->get();
        $categories = ProductCategory::select('id', 'name', 'code')->get();
        $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();
        $purities = Purity::where('is_active', true)->select('id', 'name', 'metal_type', 'percentage')->get();

        return Inertia::render('Production/Create', [
            'branches' => $branches,
            'artisans' => $artisans,
            'orders' => $orders,
            'categories' => $categories,
            'products' => $products,
            'purities' => $purities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'artisan_id' => 'required|exists:artisans,id',
            'order_id' => 'nullable|exists:orders,id',
            'product_category_id' => 'nullable|exists:product_categories,id',
            'product_id' => 'nullable|exists:products,id',
            'purity_id' => 'nullable|exists:purities,id',
            'metal_type' => 'required|string|max:50',
            'stock_type' => 'required|string|max:50',
            'order_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'start_date' => 'required|date',
            'expected_end_date' => 'nullable|date|after_or_equal:start_date',
            'vori' => 'nullable|numeric|min:0',
            'ana' => 'nullable|numeric|min:0',
            'roti' => 'nullable|numeric|min:0',
            'point' => 'nullable|numeric|min:0',
            'weight_gm' => 'required|numeric|min:0',
            'artisan_charge' => 'nullable|numeric|min:0',
            'wastage_percentage' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'due_amount' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $dateStr = date('Ymd');
        $count = Production::whereDate('created_at', now()->toDateString())->count() + 1;
        $productionNo = 'PRD-' . $dateStr . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $artisanCharge = (float)($validated['artisan_charge'] ?? 0);
        $paidAmount = (float)($validated['paid_amount'] ?? 0);
        $dueAmount = (float)($validated['due_amount'] ?? max(0, $artisanCharge - $paidAmount));

        $production = Production::create([
            'production_no' => $productionNo,
            'branch_id' => $validated['branch_id'],
            'artisan_id' => $validated['artisan_id'],
            'order_id' => $validated['order_id'] ?? null,
            'product_category_id' => $validated['product_category_id'] ?? null,
            'product_id' => $validated['product_id'] ?? null,
            'purity_id' => $validated['purity_id'] ?? null,
            'metal_type' => $validated['metal_type'],
            'stock_type' => $validated['stock_type'],
            'order_date' => $validated['order_date'] ?? null,
            'delivery_date' => $validated['delivery_date'] ?? null,
            'start_date' => $validated['start_date'],
            'expected_end_date' => $validated['expected_end_date'] ?? null,
            'raw_metal_issued_weight' => $validated['weight_gm'],
            'vori' => $validated['vori'] ?? 0,
            'ana' => $validated['ana'] ?? 0,
            'roti' => $validated['roti'] ?? 0,
            'point' => $validated['point'] ?? 0,
            'weight_gm' => $validated['weight_gm'],
            'artisan_charge' => $artisanCharge,
            'wastage_percentage' => $validated['wastage_percentage'] ?? 0,
            'paid_amount' => $paidAmount,
            'due_amount' => $dueAmount,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('production.index')->with('success', "Production job {$production->production_no} added successfully!");
    }

    public function status(Request $request)
    {
        $productions = Production::with(['branch', 'artisan', 'order', 'category', 'product', 'purity'])
            ->latest()
            ->get();

        $stats = [
            'pending' => $productions->where('status', 'pending')->values(),
            'in_progress' => $productions->where('status', 'in_progress')->values(),
            'completed' => $productions->where('status', 'completed')->values(),
            'cancelled' => $productions->where('status', 'cancelled')->values(),
        ];

        return Inertia::render('Production/Status', [
            'productions' => $productions,
            'statusGroups' => $stats,
        ]);
    }

    public function show(Production $production)
    {
        $production->load(['branch', 'artisan', 'order.customer', 'category', 'product', 'purity', 'creator']);

        return Inertia::render('Production/Show', [
            'production' => $production,
        ]);
    }

    public function updateStatus(Request $request, Production $production)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
        ]);

        $updateData = ['status' => $validated['status']];
        if ($validated['status'] === 'completed' && !$production->actual_end_date) {
            $updateData['actual_end_date'] = now()->toDateString();
        }

        $production->update($updateData);

        return redirect()->back()->with('success', "Production #{$production->production_no} status updated to " . ucfirst(str_replace('_', ' ', $validated['status'])));
    }
}
