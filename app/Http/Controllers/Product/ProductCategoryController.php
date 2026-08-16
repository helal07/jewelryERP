<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductCategoryRequest;
use App\Http\Requests\UpdateProductCategoryRequest;
use App\Models\ProductCategory;
use App\Services\ProductCategoryService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    public function __construct(private ProductCategoryService $categoryService)
    {
    }

    public function index()
    {
        Gate::authorize('viewAny', ProductCategory::class);

        $categories = ProductCategory::with(['parent', 'children'])
            ->withCount('products')
            ->latest()
            ->paginate(10);

        $parentCategories = ProductCategory::whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ProductCategories/Index', [
            'categories' => $categories,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function create()
    {
        Gate::authorize('create', ProductCategory::class);

        $parentCategories = ProductCategory::whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ProductCategories/Create', [
            'parentCategories' => $parentCategories,
        ]);
    }

    public function store(StoreProductCategoryRequest $request)
    {
        Gate::authorize('create', ProductCategory::class);

        $this->categoryService->createCategory($request->validated());

        return redirect()->route('product-categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(ProductCategory $productCategory)
    {
        Gate::authorize('update', $productCategory);

        $parentCategories = ProductCategory::whereNull('parent_id')
            ->where('id', '!=', $productCategory->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ProductCategories/Edit', [
            'category' => $productCategory,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function update(UpdateProductCategoryRequest $request, ProductCategory $productCategory)
    {
        Gate::authorize('update', $productCategory);

        $this->categoryService->updateCategory($productCategory, $request->validated());

        return redirect()->route('product-categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(ProductCategory $productCategory)
    {
        Gate::authorize('delete', $productCategory);

        // Prevent deletion if category has products
        if ($productCategory->products()->exists()) {
            return redirect()->route('product-categories.index')
                ->with('error', 'Cannot delete category with existing products.');
        }

        $this->categoryService->deleteCategory($productCategory);

        return redirect()->route('product-categories.index')->with('success', 'Category deleted successfully.');
    }
}
