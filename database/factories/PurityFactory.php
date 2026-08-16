<?php

namespace Database\Factories;

use App\Models\Purity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Purity>
 */
class PurityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'metal_type' => fake()->randomElement(['gold', 'silver', 'platinum']),
            'name' => fake()->randomElement(['24K', '22K', '18K', '14K', '925', '950']),
            'percentage' => fake()->randomFloat(2, 50, 99.99),
            'is_active' => true,
        ];
    }
}
