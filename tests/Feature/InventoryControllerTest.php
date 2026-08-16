<?php

namespace Tests\Feature;

use App\Models\Artisan;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purity;
use App\Models\StockAdjustment;
use App\Models\StockLedger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $branch;
    protected $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->branch = Branch::create([
            'name' => 'Test Branch',
            'code' => 'TEST01',
            'status' => 'active',
        ]);

        $category = ProductCategory::create([
            'name' => 'Ring',
            'code' => 'RNG',
            'metal_type' => 'gold',
        ]);

        $this->product = Product::create([
            'branch_id'          => $this->branch->id,
            'name'               => 'Test Gold Ring',
            'sku'                => 'TGR-001',
            'category_id'        => $category->id,
            'metal_type'         => 'gold',
            'gross_weight'       => 5.000,
            'net_weight'         => 4.800,
            'making_charge_type' => 'flat',
            'making_charge_value'=> 0,
            'unit'               => 'pcs',
            'status'             => 'active',
        ]);
    }

    /* ------ Opening Stock Tests ------ */

    public function test_opening_stock_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('inventory.opening.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Inventory/OpeningStock/Index'));
    }

    public function test_can_set_opening_stock()
    {
        $response = $this->actingAs($this->user)
            ->post(route('inventory.opening.store'), [
                'product_id'   => $this->product->id,
                'branch_id'    => $this->branch->id,
                'quantity'     => 10,
                'weight_in_gm' => 50.000,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('stock_ledger', [
            'product_id'       => $this->product->id,
            'branch_id'        => $this->branch->id,
            'transaction_type' => 'opening',
            'quantity_in'      => 10,
        ]);
    }

    public function test_can_issue_and_return_artisan_stock()
    {
        $artisan = Artisan::create([
            'branch_id' => $this->branch->id,
            'name'      => 'Karigar Rahim',
            'code'      => 'ART-001',
            'phone'     => '01711000000',
            'wage_type' => 'per_gram',
            'wage_rate' => 100,
            'status'    => 'active',
        ]);

        // Issue metal
        $response = $this->actingAs($this->user)
            ->post(route('inventory.artisan.store'), [
                'branch_id'        => $this->branch->id,
                'artisan_id'       => $artisan->id,
                'transaction_type' => 'issue',
                'metal_type'       => 'gold',
                'weight'           => 11.664,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('artisan_stock', [
            'artisan_id'    => $artisan->id,
            'weight_issued' => 11.664,
        ]);

        // Return metal
        $response2 = $this->actingAs($this->user)
            ->post(route('inventory.artisan.store'), [
                'branch_id'        => $this->branch->id,
                'artisan_id'       => $artisan->id,
                'transaction_type' => 'return',
                'metal_type'       => 'gold',
                'weight'           => 5.000,
            ]);

        $response2->assertRedirect();
        $this->assertDatabaseHas('artisan_stock', [
            'artisan_id'      => $artisan->id,
            'weight_returned' => 5.000,
        ]);
    }

    /* ------ Stock Adjustment Tests ------ */

    public function test_adjustments_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('inventory.adjustments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Inventory/StockAdjustments/Index'));
    }

    public function test_can_create_stock_adjustment()
    {
        $response = $this->actingAs($this->user)
            ->post(route('inventory.adjustments.store'), [
                'branch_id'       => $this->branch->id,
                'product_id'      => $this->product->id,
                'adjustment_date' => now()->format('Y-m-d'),
                'quantity_change' => -3,
                'weight_change'   => -14.400,
                'reason'          => 'Physical count discrepancy',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('stock_adjustments', [
            'product_id'      => $this->product->id,
            'quantity_change' => -3,
        ]);
        $this->assertDatabaseHas('stock_ledger', [
            'transaction_type' => 'adjustment',
            'quantity_out'     => 3,
        ]);
    }

    public function test_can_delete_stock_adjustment()
    {
        $adj = StockAdjustment::create([
            'branch_id'       => $this->branch->id,
            'product_id'      => $this->product->id,
            'adjustment_date' => now()->format('Y-m-d'),
            'quantity_change' => 5,
            'weight_change'   => 20.000,
            'reason'          => 'Test',
            'created_by'      => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('inventory.adjustments.destroy', $adj->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('stock_adjustments', ['id' => $adj->id]);
    }
}
