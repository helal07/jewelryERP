<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Mortgage;
use App\Models\MortgageCustomer;
use App\Models\MortgageItem;
use App\Models\Purity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MortgageController extends Controller
{
    public function details(Request $request)
    {
        $mortgages = collect();
        if ($request->filled('search')) {
            $searchTerm = trim($request->search);
            $query = Mortgage::with(['customer', 'branch', 'items.purity']);

            $query->where(function ($q) use ($searchTerm) {
                $q->where('mortgage_no', 'like', "%{$searchTerm}%")
                  ->orWhereHas('customer', function ($cq) use ($searchTerm) {
                      $cq->where('name', 'like', "%{$searchTerm}%")
                         ->orWhere('phone', 'like', "%{$searchTerm}%");
                  });

                if (is_numeric($searchTerm)) {
                    $q->orWhere('principal_amount', 'like', "%{$searchTerm}%");
                }
            });

            $mortgages = $query->latest()->get();
        }

        return Inertia::render('Mortgages/DetailsSearch', [
            'mortgages' => $mortgages,
            'searchQuery' => $request->search,
        ]);
    }

    public function index(Request $request)
    {
        $query = Mortgage::with(['customer', 'branch']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('mortgage_no', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $mortgages = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Mortgages/Index', [
            'mortgages' => $mortgages,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $branches = Branch::where('status', 'active')->get();
        $customers = MortgageCustomer::where('status', 'active')->get();
        $purities = Purity::where('is_active', true)->get();
        $categories = \App\Models\ProductCategory::all();
        $products = \App\Models\Product::where('status', 'active')->get();

        return Inertia::render('Mortgages/Create', [
            'branches' => $branches,
            'customers' => $customers,
            'purities' => $purities,
            'categories' => $categories,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'mortgage_customer_id' => 'required|exists:mortgage_customers,id',
            'mortgage_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:mortgage_date',
            'principal_amount' => 'required|numeric|min:0',
            'interest_rate' => 'required|numeric|min:0',
            'interest_type' => 'required|in:flat,monthly',
            
            'items' => 'required|array|min:1',
            'items.*.stock_type' => 'nullable|string|in:readymade,custom,raw_gold,scrap',
            'items.*.category_id' => 'nullable|exists:categories,id',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.metal_type' => 'required|string|max:30',
            'items.*.purity_id' => 'required|exists:purities,id',
            'items.*.rate_per_vori' => 'nullable|numeric|min:0',
            'items.*.rate_per_gram' => 'nullable|numeric|min:0',
            'items.*.weight_unit' => 'required|in:traditional,gram',
            'items.*.vori' => 'nullable|integer|min:0',
            'items.*.ana' => 'nullable|integer|min:0',
            'items.*.roti' => 'nullable|integer|min:0',
            'items.*.point' => 'nullable|numeric|min:0',
            'items.*.gross_weight' => 'required|numeric|min:0',
            'items.*.stone_weight' => 'nullable|numeric|min:0',
            'items.*.net_weight' => 'required|numeric|min:0|lte:items.*.gross_weight',
            'items.*.estimated_value' => 'nullable|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.image' => 'nullable|image|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $mortgage = Mortgage::create([
                'branch_id' => $validated['branch_id'],
                'mortgage_customer_id' => $validated['mortgage_customer_id'],
                'mortgage_date' => $validated['mortgage_date'],
                'due_date' => $validated['due_date'],
                'principal_amount' => $validated['principal_amount'],
                'interest_rate' => $validated['interest_rate'],
                'interest_type' => $validated['interest_type'],
                'status' => 'active',
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $index => $itemData) {
                $imagePath = null;
                if ($request->hasFile("items.{$index}.image")) {
                    $imagePath = $request->file("items.{$index}.image")->store('mortgages/items', 'public');
                }

                MortgageItem::create([
                    'mortgage_id' => $mortgage->id,
                    'stock_type' => $itemData['stock_type'] ?? null,
                    'category_id' => $itemData['category_id'] ?? null,
                    'product_id' => $itemData['product_id'] ?? null,
                    'item_name' => $itemData['item_name'],
                    'metal_type' => $itemData['metal_type'],
                    'purity_id' => $itemData['purity_id'],
                    'rate_per_vori' => $itemData['rate_per_vori'] ?? null,
                    'rate_per_gram' => $itemData['rate_per_gram'] ?? null,
                    'weight_unit' => $itemData['weight_unit'] ?? 'traditional',
                    'vori' => $itemData['vori'] ?? 0,
                    'ana' => $itemData['ana'] ?? 0,
                    'roti' => $itemData['roti'] ?? 0,
                    'point' => $itemData['point'] ?? 0,
                    'gross_weight' => $itemData['gross_weight'],
                    'stone_weight' => $itemData['stone_weight'] ?? 0,
                    'net_weight' => $itemData['net_weight'],
                    'estimated_value' => $itemData['estimated_value'] ?? 0,
                    'quantity' => $itemData['quantity'],
                    'image' => $imagePath,
                ]);
            }

            DB::commit();

            return redirect()->route('mortgages.index')->with('success', 'Mortgage created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error creating mortgage: ' . $e->getMessage());
        }
    }

    public function show(Mortgage $mortgage)
    {
        $mortgage->load(['customer', 'branch', 'items.purity', 'creator', 'payments']);

        return Inertia::render('Mortgages/Show', [
            'mortgage' => $mortgage,
        ]);
    }

    public function updateStatus(Request $request, Mortgage $mortgage)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:active,redeemed,overdue,forfeited',
        ]);

        $mortgage->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Mortgage status updated to ' . ucfirst($validated['status']) . '!');
    }

    public function update(Request $request, Mortgage $mortgage)
    {
        $validated = $request->validate([
            'due_date' => 'nullable|date',
            'interest_rate' => 'nullable|numeric|min:0',
            'interest_type' => 'nullable|string|in:monthly,yearly,flat',
            'notes' => 'nullable|string',
        ]);

        $mortgage->update(array_filter($validated, fn($val) => $val !== null));

        return redirect()->back()->with('success', 'Mortgage details updated successfully!');
    }
}
