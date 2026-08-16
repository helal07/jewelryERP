<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Purity;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesReturnAndPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $customer;
    protected $product;
    protected $sale;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $branch = Branch::create([
            'name' => 'Main Branch',
            'code' => 'MB01',
            'status' => 'active',
        ]);

        $this->customer = Customer::create([
            'code' => 'CUST-001',
            'name' => 'Rahim Customer',
            'phone' => '01700112233',
            'branch_id' => $branch->id,
            'created_by' => $this->user->id,
        ]);

        $purity = Purity::create([
            'name' => '22K',
            'metal_type' => 'gold',
            'percentage' => 91.60,
        ]);

        $category = \App\Models\ProductCategory::create([
            'name' => 'Chains',
            'code' => 'CHN-01',
            'metal_type' => 'gold',
        ]);

        $this->product = Product::create([
            'branch_id' => $branch->id,
            'purity_id' => $purity->id,
            'category_id' => $category->id,
            'name' => 'Gold Chain 22K',
            'sku' => 'GC-22K-001',
            'metal_type' => 'gold',
            'gross_weight' => 11.664,
            'net_weight' => 11.664,
            'making_charge_type' => 'per_gram',
            'making_charge_value' => 500.00,
            'unit' => 'pcs',
            'selling_price' => 100000.00,
            'status' => 'active',
        ]);

        $this->sale = Sale::create([
            'branch_id' => $branch->id,
            'customer_id' => $this->customer->id,
            'invoice_no' => 'INV-TEST-0001',
            'sale_date' => now()->toDateString(),
            'sale_type' => 'retail',
            'subtotal' => 100000.00,
            'grand_total' => 100000.00,
            'paid_amount' => 60000.00,
            'due_amount' => 40000.00,
            'status' => 'pending',
            'created_by' => $this->user->id,
        ]);

        SaleItem::create([
            'sale_id' => $this->sale->id,
            'product_id' => $this->product->id,
            'gross_weight' => 11.664,
            'net_weight' => 11.664,
            'rate_per_gram' => 8572.50,
            'quantity' => 1,
            'total_amount' => 100000.00,
        ]);
    }

    public function test_sale_returns_index_loads()
    {
        $response = $this->actingAs($this->user)->get(route('sales.returns.index'));
        $response->assertStatus(200);
    }

    public function test_can_process_sale_return()
    {
        $saleItem = $this->sale->items->first();

        $response = $this->actingAs($this->user)->post(route('sales.returns.store'), [
            'sale_id' => $this->sale->id,
            'return_date' => now()->toDateString(),
            'reason' => 'Defect return',
            'refund_amount' => 20000.00,
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 20000.00,
                ],
            ],
        ]);

        $response->assertRedirect(route('sales.returns.index'));
        $this->assertDatabaseHas('sale_returns', [
            'sale_id' => $this->sale->id,
            'refund_amount' => 20000.00,
        ]);

        // Due amount should decrease from 40,000 to 20,000
        $this->assertDatabaseHas('sales', [
            'id' => $this->sale->id,
            'due_amount' => 20000.00,
        ]);
    }

    public function test_sale_payments_index_loads()
    {
        $response = $this->actingAs($this->user)->get(route('sales.payments.index'));
        $response->assertStatus(200);
    }

    public function test_can_record_customer_sale_payment()
    {
        $response = $this->actingAs($this->user)->post(route('sales.payments.store'), [
            'sale_id' => $this->sale->id,
            'payment_date' => now()->toDateString(),
            'amount' => 40000.00,
            'payment_method' => 'cash',
            'reference_no' => 'PAY-REC-01',
            'notes' => 'Cleared due payment',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('sale_payments', [
            'sale_id' => $this->sale->id,
            'amount' => 40000.00,
        ]);

        // Due should be 0 and status completed
        $this->assertDatabaseHas('sales', [
            'id' => $this->sale->id,
            'paid_amount' => 100000.00,
            'due_amount' => 0.00,
            'status' => 'completed',
        ]);
    }
}
