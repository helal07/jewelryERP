<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PuritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $purities = [
            ['metal_type' => 'gold', 'name' => '24K', 'percentage' => 99.99],
            ['metal_type' => 'gold', 'name' => '22K', 'percentage' => 91.67],
            ['metal_type' => 'gold', 'name' => '21K', 'percentage' => 87.50],
            ['metal_type' => 'gold', 'name' => '18K', 'percentage' => 75.00],
            ['metal_type' => 'silver', 'name' => '999', 'percentage' => 99.90],
            ['metal_type' => 'silver', 'name' => '925', 'percentage' => 92.50],
            ['metal_type' => 'platinum', 'name' => 'Pt950', 'percentage' => 95.00],
        ];

        foreach ($purities as $purity) {
            \App\Models\Purity::updateOrCreate(
                ['name' => $purity['name']],
                $purity
            );
        }
    }
}
