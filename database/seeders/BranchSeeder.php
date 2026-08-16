<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Branch::updateOrCreate(
            ['code' => 'B001'],
            [
                'name' => 'Main Branch',
                'address' => '123 Main Street',
                'phone' => '01700000000',
                'email' => 'main@example.com',
                'is_head_office' => true,
                'status' => 'active',
            ]
        );
    }
}
