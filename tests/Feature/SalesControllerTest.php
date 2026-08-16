<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Customer $customer;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create([
            'name' => 'Main Showroom',
            'code' => 'MS01',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create([
            'branch_id' => $this->branch->id,
        ]);

        $this->customer = Customer::create([
            'branch_id' => $this->branch->id,
            'code' => 'CUST-0001',
            'name' => 'John Doe',
            'phone' => '01700000000',
            'created_by' => $this->user->id,
        ]);

        $category = ProductCategory::create([
            'name' => 'Rings',
            'code' => 'RNG',
            'metal_type' => 'gold',
        ]);

        $this->product = Product::create([
            'branch_id' => $this->branch->id,
            'category_id' => $category->id,
            'created_by' => $this->user->id,
            'metal_type' => 'gold',
            'unit' => 'pcs',
            'making_charge_type' => 'per_gram',
            'making_charge_value' => 500,
            'sku' => 'RING-001',
            'name' => 'Gold Ring 22K',
            'stock_qty' => 10,
            'weight' => 5.0,
            'gross_weight' => 5.0,
            'net_weight' => 5.0,
            'selling_price' => 10000,
        ]);
    }

    public function test_sales_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('sales.index'));

        $response->assertStatus(200);
    }

    public function test_create_sale_page_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('sales.create'));

        $response->assertStatus(200);
    }

    public function test_store_creates_sale()
    {
        $response = $this->actingAs($this->user)
            ->post(route('sales.store'), [
                'customer_id' => $this->customer->id,
                'branch_id' => $this->branch->id,
                'invoice_no' => 'INV-20260811-0001',
                'sale_date' => now()->toDateString(),
                'sale_type' => 'retail',
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'gross_weight' => 5.0,
                        'stone_weight' => 0,
                        'net_weight' => 5.0,
                        'rate_per_gram' => 10000,
                        'making_charge' => 500,
                        'stone_charge' => 0,
                        'quantity' => 1,
                        'total_amount' => 50500,
                    ]
                ],
                'subtotal' => 50500,
                'discount' => 500,
                'tax' => 2500,
                'old_gold_exchange_value' => 0,
                'grand_total' => 52500,
                'paid_amount' => 52500,
            ]);

        $response->assertRedirect(route('sales.show', 1));
        $this->assertDatabaseHas('sales', [
            'invoice_no' => 'INV-20260811-0001',
            'customer_id' => $this->customer->id,
        ]);
    }
}
