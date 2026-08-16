<?php

namespace App\Services;

use App\Models\ProductCategory;
use Illuminate\Support\Facades\DB;

class ProductCategoryService
{
    /**
     * Generate a unique code for a category.
     * Format: CAT-XXXX
     */
    public function generateCode(): string
    {
        $prefix = 'CAT-';
        $lastCategory = ProductCategory::withTrashed()
            ->where('code', 'like', $prefix . '%')
            ->orderByDesc('code')
            ->first();

        if ($lastCategory) {
            $lastNumber = (int) substr($lastCategory->code, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new product category.
     */
    public function createCategory(array $data): ProductCategory
    {
        if (empty($data['code'])) {
            $data['code'] = $this->generateCode();
        }

        return ProductCategory::create($data);
    }

    /**
     * Update an existing product category.
     */
    public function updateCategory(ProductCategory $category, array $data): ProductCategory
    {
        $category->update($data);
        return $category;
    }

    /**
     * Soft-delete a product category.
     */
    public function deleteCategory(ProductCategory $category): bool
    {
        return $category->delete();
    }
}
