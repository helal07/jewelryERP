<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    /**
     * Generate a unique SKU for a product.
     * Format: PRD-YYYYMM-XXXX
     */
    public function generateSku(): string
    {
        $prefix = 'PRD-' . now()->format('Ym') . '-';
        $lastProduct = Product::withTrashed()
            ->where('sku', 'like', $prefix . '%')
            ->orderByDesc('sku')
            ->first();

        if ($lastProduct) {
            $lastNumber = (int) substr($lastProduct->sku, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Compute net weight = gross_weight - stone_weight.
     * Server-side authoritative computation per best practices.
     */
    public function computeNetWeight(float $grossWeight, float $stoneWeight): float
    {
        return round($grossWeight - $stoneWeight, 3);
    }

    /**
     * Create a new product with image handling inside a DB transaction.
     */
    public function createProduct(array $data, $imageFile = null): Product
    {
        return DB::transaction(function () use ($data, $imageFile) {
            // Default numeric fields if null to prevent DB constraint errors
            $data['stone_weight'] = $data['stone_weight'] ?? 0;
            $data['stone_charge'] = $data['stone_charge'] ?? 0;
            $data['wastage_percentage'] = $data['wastage_percentage'] ?? 0;
            $data['vat_percentage'] = $data['vat_percentage'] ?? 0;

            // Server-side compute net_weight — never trust client
            $data['net_weight'] = $this->computeNetWeight(
                (float) $data['gross_weight'],
                (float) $data['stone_weight']
            );

            // Auto-generate SKU if not provided
            if (empty($data['sku'])) {
                $data['sku'] = $this->generateSku();
            }

            // Handle image upload
            if ($imageFile) {
                $data['image'] = $imageFile->store('products/images', 'public');
            }

            $product = Product::create($data);

            // If an image was uploaded, also create a ProductImage record
            if ($imageFile && !empty($data['image'])) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $data['image'],
                    'is_primary' => true,
                ]);
            }

            return $product;
        });
    }

    /**
     * Create multiple products at once inside a DB transaction.
     */
    public function createProductsBatch(array $productsData): \Illuminate\Support\Collection
    {
        return DB::transaction(function () use ($productsData) {
            $createdProducts = collect();

            foreach ($productsData as $data) {
                // Default numeric fields if null to prevent DB constraint errors
                $data['stone_weight'] = $data['stone_weight'] ?? 0;
                $data['stone_charge'] = $data['stone_charge'] ?? 0;
                $data['wastage_percentage'] = $data['wastage_percentage'] ?? 0;
                $data['vat_percentage'] = $data['vat_percentage'] ?? 0;

                // Determine if we have an image object directly in the data array
                $imageFile = $data['image'] ?? null;
                if ($imageFile && !is_string($imageFile)) {
                    $data['image'] = $imageFile->store('products/images', 'public');
                } else {
                    unset($data['image']); // If it's not a valid upload, don't store it
                }

                $data['net_weight'] = $this->computeNetWeight(
                    (float) ($data['gross_weight'] ?? 0),
                    (float) $data['stone_weight']
                );

                if (empty($data['sku'])) {
                    $data['sku'] = $this->generateSku();
                }

                $product = Product::create($data);

                if (isset($data['image'])) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'path' => $data['image'],
                        'is_primary' => true,
                    ]);
                }

                $createdProducts->push($product);
            }

            return $createdProducts;
        });
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(Product $product, array $data, $imageFile = null): Product
    {
        return DB::transaction(function () use ($product, $data, $imageFile) {
            // Default numeric fields if null
            if (array_key_exists('stone_weight', $data)) {
                $data['stone_weight'] = $data['stone_weight'] ?? 0;
            }
            if (array_key_exists('stone_charge', $data)) {
                $data['stone_charge'] = $data['stone_charge'] ?? 0;
            }
            if (array_key_exists('wastage_percentage', $data)) {
                $data['wastage_percentage'] = $data['wastage_percentage'] ?? 0;
            }
            if (array_key_exists('vat_percentage', $data)) {
                $data['vat_percentage'] = $data['vat_percentage'] ?? 0;
            }

            // Server-side recompute net_weight
            $data['net_weight'] = $this->computeNetWeight(
                (float) ($data['gross_weight'] ?? $product->gross_weight),
                (float) ($data['stone_weight'] ?? $product->stone_weight)
            );

            // Handle new image upload
            if ($imageFile) {
                // Delete old image if exists
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $data['image'] = $imageFile->store('products/images', 'public');

                // Update or create primary image record
                $product->images()->where('is_primary', true)->delete();
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $data['image'],
                    'is_primary' => true,
                ]);
            }

            $product->update($data);
            return $product;
        });
    }

    /**
     * Soft-delete a product.
     */
    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }
}
