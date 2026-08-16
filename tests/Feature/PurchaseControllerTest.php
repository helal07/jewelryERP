<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purity;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Supplier $supplier;
    protected Product $product;
    protected Purity $purity;

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

        $this->supplier = Supplier::create([
            'branch_id' => $this->branch->id,
            'code' => 'SUP-001',
            'name' => 'Royal Gold Refinery',
            'company_name' => 'Royal Gold Ltd',
            'phone' => '01700000000',
        ]);

        $category = ProductCategory::create([
            'name' => 'Bangles',
            'code' => 'BAN',
            'metal_type' => 'gold',
        ]);

        $this->purity = Purity::create([
            'metal_type' => 'gold',
            'name' => '22K (916)',
            'percentage' => 91.60,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'branch_id' => $this->branch->id,
            'category_id' => $category->id,
            'purity_id' => $this->purity->id,
            'name' => '22K Gold Bridal Bangle',
            'sku' => 'BAN-001',
            'barcode' => '8901001',
            'metal_type' => 'gold',
            'unit' => 'pcs',
            'gross_weight' => 11.664,
            'stone_weight' => 0,
            'net_weight' => 11.664,
            'making_charge_type' => 'fixed',
            'making_charge_value' => 5000,
            'making_charge' => 5000,
            'cost_price' => 125000,
            'selling_price' => 135000,
            'stock_quantity' => 10,
            'status' => 'active',
        ]);
    }

    public function test_purchase_list_page_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('purchases.index'));

        $response->assertStatus(200);
    }

    public function test_add_purchase_page_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('purchases.create'));

        $response->assertStatus(200);
    }

    public function test_purchase_can_be_created()
    {
        $response = $this->actingAs($this->user)
            ->post(route('purchases.store'), [
                'supplier_id'   => $this->supplier->id,
                'branch_id'     => $this->branch->id,
                'invoice_no'    => 'PUR-00001',
                'purchase_date' => '2026-08-12',
                'subtotal'      => 134136,
                'discount'      => 0,
                'tax'           => 0,
                'other_charges' => 0,
                'grand_total'   => 134136,
                'paid_amount'   => 100000,
                'due_amount'    => 34136,
                'payment_method'=> 'cash',
                'notes'         => 'Test purchase entry',
                'items' => [
                    [
                        'product_id'    => $this->product->id,
                        'metal_type'    => 'gold',
                        'purity_id'     => $this->purity->id,
                        'gross_weight'  => 11.664,
                        'stone_weight'  => 0,
                        'net_weight'    => 11.664,
                        'rate_per_gram' => 11500,
                        'making_charge' => 0,
                        'stone_charge'  => 0,
                        'quantity'      => 1,
                        'total_amount'  => 134136,
                    ]
                ]
            ]);

        $response->assertRedirect(route('purchases.index'));
        $this->assertDatabaseHas('purchases', [
            'invoice_no' => 'PUR-00001',
            'grand_total' => 134136,
            'paid_amount' => 100000,
            'due_amount' => 34136,
        ]);
        $this->assertDatabaseHas('purchase_items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);
    }

    public function test_purchase_edit_page_loads()
    {
        $purchase = Purchase::create([
            'branch_id' => $this->branch->id,
            'supplier_id' => $this->supplier->id,
            'invoice_no' => 'PUR-EDIT-01',
            'purchase_date' => '2026-08-12',
            'subtotal' => 50000,
            'grand_total' => 50000,
            'paid_amount' => 50000,
            'due_amount' => 0,
            'status' => 'completed',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('purchases.edit', $purchase));

        $response->assertStatus(200);
    }

    public function test_purchase_can_be_updated()
    {
        $purchase = Purchase::create([
            'branch_id' => $this->branch->id,
            'supplier_id' => $this->supplier->id,
            'invoice_no' => 'PUR-UPD-01',
            'purchase_date' => '2026-08-12',
            'subtotal' => 50000,
            'grand_total' => 50000,
            'paid_amount' => 50000,
            'due_amount' => 0,
            'status' => 'completed',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('purchases.update', $purchase), [
                'supplier_id'   => $this->supplier->id,
                'branch_id'     => $this->branch->id,
                'purchase_date' => '2026-08-15',
                'subtotal'      => 60000,
                'discount'      => 0,
                'tax'           => 0,
                'other_charges' => 0,
                'grand_total'   => 60000,
                'paid_amount'   => 60000,
                'due_amount'    => 0,
                'payment_method'=> 'cash',
                'notes'         => 'Updated note',
                'items' => [
                    [
                        'product_id'    => $this->product->id,
                        'metal_type'    => 'gold',
                        'purity_id'     => $this->purity->id,
                        'gross_weight'  => 5.0,
                        'net_weight'    => 5.0,
                        'rate_per_gram' => 12000,
                        'quantity'      => 1,
                        'total_amount'  => 60000,
                    ]
                ]
            ]);

        $response->assertRedirect(route('purchases.index'));
        $this->assertDatabaseHas('purchases', [
            'id' => $purchase->id,
            'grand_total' => 60000,
            'notes' => 'Updated note',
        ]);
    }

    public function test_purchase_can_be_deleted()
    {
        $purchase = Purchase::create([
            'branch_id' => $this->branch->id,
            'supplier_id' => $this->supplier->id,
            'invoice_no' => 'PUR-DEL-01',
            'purchase_date' => '2026-08-12',
            'subtotal' => 50000,
            'grand_total' => 50000,
            'paid_amount' => 50000,
            'due_amount' => 0,
            'status' => 'completed',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('purchases.destroy', $purchase));

        $response->assertRedirect(route('purchases.index'));
        $this->assertSoftDeleted('purchases', ['id' => $purchase->id]);
    }

    public function test_purchase_return_page_loads_and_stores()
    {
        $purchase = Purchase::create([
            'branch_id' => $this->branch->id,
            'supplier_id' => $this->supplier->id,
            'invoice_no' => 'PUR-00002',
            'purchase_date' => '2026-08-12',
            'subtotal' => 100000,
            'grand_total' => 100000,
            'paid_amount' => 50000,
            'due_amount' => 50000,
            'status' => 'completed',
            'created_by' => $this->user->id,
        ]);

        $purchaseItem = PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'product_id' => $this->product->id,
            'metal_type' => 'gold',
            'purity_id' => $this->purity->id,
            'gross_weight' => 11.664,
            'stone_weight' => 0,
            'net_weight' => 11.664,
            'rate_per_gram' => 10000,
            'quantity' => 1,
            'total_amount' => 100000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('purchases.returns'));

        $response->assertStatus(200);

        $storeReturn = $this->actingAs($this->user)
            ->post(route('purchases.store-return'), [
                'purchase_id' => $purchase->id,
                'return_date' => '2026-08-12',
                'reason' => 'Defective stone',
                'total_amount' => 10000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 1,
                        'amount' => 10000,
                    ]
                ]
            ]);

        $storeReturn->assertRedirect(route('purchases.returns'));
        $this->assertDatabaseHas('purchase_returns', [
            'purchase_id' => $purchase->id,
            'total_amount' => 10000,
        ]);
    }

    public function test_purchase_payment_page_loads_and_stores()
    {
        $purchase = Purchase::create([
            'branch_id' => $this->branch->id,
            'supplier_id' => $this->supplier->id,
            'invoice_no' => 'PUR-00003',
            'purchase_date' => '2026-08-12',
            'subtotal' => 100000,
            'grand_total' => 100000,
            'paid_amount' => 40000,
            'due_amount' => 60000,
            'status' => 'completed',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('purchases.payments'));

        $response->assertStatus(200);

        $storePayment = $this->actingAs($this->user)
            ->post(route('purchases.store-payment'), [
                'purchase_id' => $purchase->id,
                'payment_date' => '2026-08-12',
                'amount' => 20000,
                'payment_method' => 'cash',
                'reference_no' => 'PAY-001',
                'notes' => 'Partial due payment',
            ]);

        $storePayment->assertRedirect(route('purchases.payments'));
        $this->assertDatabaseHas('purchase_payments', [
            'purchase_id' => $purchase->id,
            'amount' => 20000,
        ]);

        $this->assertEquals(40000, $purchase->fresh()->due_amount);
    }
}
