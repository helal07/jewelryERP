<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $grossWeight = fake()->randomFloat(3, 1, 100);
        $stoneWeight = fake()->randomFloat(3, 0, $grossWeight * 0.3);

        return [
            'branch_id' => Branch::factory(),
            'category_id' => ProductCategory::factory(),
            'sku' => 'PRD-' . now()->format('Ym') . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'name' => fake()->words(3, true),
            'metal_type' => fake()->randomElement(['gold', 'silver', 'platinum', 'diamond', 'mixed']),
            'purity_id' => Purity::factory(),
            'gross_weight' => $grossWeight,
            'stone_weight' => $stoneWeight,
            'net_weight' => round($grossWeight - $stoneWeight, 3),
            'making_charge_type' => fake()->randomElement(['fixed', 'per_gram', 'percentage']),
            'making_charge_value' => fake()->randomFloat(2, 100, 10000),
            'stone_charge' => fake()->randomFloat(2, 0, 5000),
            'wastage_percentage' => fake()->randomFloat(2, 0, 10),
            'unit' => fake()->randomElement(['piece', 'gram', 'pair', 'set']),
            'status' => 'active',
        ];
    }
}
