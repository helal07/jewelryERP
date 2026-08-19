<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purity;
use App\Models\Supplier;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function __construct(private ProductService $productService)
    {
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Product::class);

        $query = Product::with(['category', 'purity', 'branch', 'supplier'])
            ->latest();

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by metal type
        if ($metalType = $request->input('metal_type')) {
            $query->where('metal_type', $metalType);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $products = $query->paginate(10)->withQueryString();
        $categories = ProductCategory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'metal_type', 'status']),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Product::class);

        $categories = ProductCategory::orderBy('name')->get(['id', 'name', 'metal_type']);
        $purities = Purity::where('is_active', true)->orderBy('name')->get(['id', 'name', 'metal_type', 'percentage']);
        $suppliers = Supplier::orderBy('name')->get(['id', 'name']);
        
        $latestMetalPrices = \App\Models\MetalPrice::orderBy('effective_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->unique('purity_id')
            ->mapWithKeys(function ($item) {
                return [$item->purity_id => $item->price_per_gram];
            });

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'purities' => $purities,
            'suppliers' => $suppliers,
            'latestMetalPrices' => $latestMetalPrices,
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        Gate::authorize('create', Product::class);

        $data = $request->validated();
        
        $productsData = $data['products'];
        $branchId = $request->user()->branch_id ?? 1;

        // Assign branch ID to all products
        foreach ($productsData as &$productData) {
            $productData['branch_id'] = $branchId;
        }

        $createdProducts = $this->productService->createProductsBatch($productsData);

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest')) {
            return response()->json(['success' => true, 'products' => $createdProducts, 'product' => $createdProducts->first()]);
        }

        if ($request->has('stay')) {
            return back()->with('success', count($productsData) . ' product(s) added successfully.');
        }

        return redirect()->route('products.index')->with('success', count($productsData) . ' products created successfully.');
    }

    public function show(Product $product)
    {
        Gate::authorize('view', $product);

        $product->load(['category', 'purity', 'branch', 'images']);

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product)
    {
        Gate::authorize('update', $product);

        $product->load(['category', 'purity', 'images']);
        $categories = ProductCategory::orderBy('name')->get(['id', 'name', 'metal_type']);
        $purities = Purity::where('is_active', true)->orderBy('name')->get(['id', 'name', 'metal_type', 'percentage']);
        $suppliers = Supplier::orderBy('name')->get(['id', 'name']);
        
        $latestMetalPrices = \App\Models\MetalPrice::orderBy('effective_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->unique('purity_id')
            ->mapWithKeys(function ($item) {
                return [$item->purity_id => $item->price_per_gram];
            });

        return Inertia::render('Products/Create', [
            'editProduct' => $product,
            'categories' => $categories,
            'purities' => $purities,
            'suppliers' => $suppliers,
            'latestMetalPrices' => $latestMetalPrices,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        Gate::authorize('update', $product);

        $data = $request->validated();
        $this->productService->updateProduct($product, $data, $request->file('image'));

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        Gate::authorize('delete', $product);

        $this->productService->deleteProduct($product);

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    /**
     * Print label for a single product.
     */
    public function printLabel(Product $product)
    {
        Gate::authorize('printLabel', Product::class);

        $product->load(['category', 'purity']);

        return Inertia::render('Products/PrintLabelPreview', [
            'products' => [$product],
        ]);
    }

    /**
     * Show the Print Labels selection page.
     */
    public function printLabelsIndex(Request $request)
    {
        Gate::authorize('printLabel', Product::class);

        $categories = ProductCategory::whereNull('parent_id')->with('children')->get();
        $initialProducts = Product::with(['category', 'purity'])->latest()->limit(30)->get();

        return Inertia::render('Products/PrintLabels', [
            'categories' => $categories,
            'initialProducts' => $initialProducts,
        ]);
    }

    /**
     * Search products for labels selection via AJAX.
     */
    public function searchForLabels(Request $request)
    {
        Gate::authorize('printLabel', Product::class);

        $query = Product::with(['category', 'purity']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('sku', 'like', '%' . $search . '%');
            });
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }
        if ($request->filled('sku')) {
            $query->where('sku', 'like', '%' . $request->sku . '%');
        }

        return response()->json($query->latest()->limit(50)->get());
    }

    /**
     * Batch print labels for selected products (Preview page).
     */
    public function printLabelsPreview(Request $request)
    {
        Gate::authorize('printLabel', Product::class);

        $productIds = $request->input('product_ids') ?? $request->input('ids');
        if (is_string($productIds)) {
            $productIds = array_filter(explode(',', $productIds));
        }

        if (empty($productIds) || !is_array($productIds)) {
            $products = Product::with(['category', 'purity'])->latest()->limit(50)->get();
        } else {
            $models = Product::with(['category', 'purity'])
                ->whereIn('id', array_unique($productIds))
                ->get()
                ->keyBy('id');

            $products = collect($productIds)->map(function ($id) use ($models) {
                return $models->get($id);
            })->filter()->values();
        }

        return Inertia::render('Products/PrintLabelPreview', [
            'products' => $products,
        ]);
    }
}
