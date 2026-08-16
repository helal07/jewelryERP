<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Purity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Customer $customer;
    protected Purity $purity;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'admin']);
        Permission::create(['name' => 'orders.view']);
        Permission::create(['name' => 'orders.create']);
        Permission::create(['name' => 'orders.edit']);
        Permission::create(['name' => 'orders.delete']);
        $role->givePermissionTo(Permission::all());

        $this->branch = Branch::create([
            'name' => 'Main Branch',
            'code' => 'MAIN',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create([
            'branch_id' => $this->branch->id,
        ]);
        $this->user->assignRole($role);

        $this->customer = Customer::create([
            'branch_id' => $this->branch->id,
            'name' => 'John Doe',
            'phone' => '01700000000',
            'code' => 'CUST-001',
            'status' => 'active',
            'created_by' => $this->user->id,
        ]);

        $this->purity = Purity::create([
            'name' => '22K',
            'metal_type' => 'gold',
            'percentage' => 91.60,
            'is_active' => true,
        ]);
    }

    public function test_order_index_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('orders.index'));
        $response->assertStatus(200);
    }

    public function test_order_create_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('orders.create'));
        $response->assertStatus(200);
    }

    public function test_order_can_be_stored()
    {
        $response = $this->actingAs($this->user)->post(route('orders.store'), [
            'branch_id' => $this->branch->id,
            'customer_id' => $this->customer->id,
            'order_date' => '2026-08-15',
            'delivery_date' => '2026-08-20',
            'product_description' => 'Gold Ring Custom Design',
            'metal_type' => 'gold',
            'purity_id' => $this->purity->id,
            'estimated_weight' => 5.0,
            'estimated_amount' => 50000,
            'advance_amount' => 10000,
        ]);

        $response->assertRedirect(route('orders.index'));
        $this->assertDatabaseHas('orders', [
            'customer_id' => $this->customer->id,
            'estimated_amount' => 50000,
            'advance_amount' => 10000,
            'due_amount' => 40000,
        ]);
    }

    public function test_order_show_page_loads()
    {
        $order = Order::create([
            'branch_id' => $this->branch->id,
            'customer_id' => $this->customer->id,
            'order_no' => 'ORD-20260815-0001',
            'order_date' => '2026-08-15',
            'product_description' => 'Gold Chain',
            'metal_type' => 'gold',
            'purity_id' => $this->purity->id,
            'estimated_weight' => 10.0,
            'estimated_amount' => 100000,
            'advance_amount' => 50000,
            'due_amount' => 50000,
            'status' => 'new',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->get(route('orders.show', $order));
        $response->assertStatus(200);
    }

    public function test_order_edit_page_loads()
    {
        $order = Order::create([
            'branch_id' => $this->branch->id,
            'customer_id' => $this->customer->id,
            'order_no' => 'ORD-20260815-0002',
            'order_date' => '2026-08-15',
            'product_description' => 'Gold Bangle',
            'metal_type' => 'gold',
            'purity_id' => $this->purity->id,
            'estimated_weight' => 10.0,
            'estimated_amount' => 100000,
            'advance_amount' => 50000,
            'due_amount' => 50000,
            'status' => 'new',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->get(route('orders.edit', $order));
        $response->assertStatus(200);
    }

    public function test_order_status_can_be_updated()
    {
        $order = Order::create([
            'branch_id' => $this->branch->id,
            'customer_id' => $this->customer->id,
            'order_no' => 'ORD-20260815-0003',
            'order_date' => '2026-08-15',
            'product_description' => 'Gold Ring',
            'metal_type' => 'gold',
            'purity_id' => $this->purity->id,
            'estimated_weight' => 5.0,
            'estimated_amount' => 50000,
            'advance_amount' => 50000,
            'due_amount' => 0,
            'status' => 'new',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->patch(route('orders.update-status', $order), [
            'status' => 'cancelled',
        ]);

        $this->assertEquals('cancelled', $order->fresh()->status);
    }

    public function test_order_payment_can_be_recorded()
    {
        $order = Order::create([
            'branch_id' => $this->branch->id,
            'customer_id' => $this->customer->id,
            'order_no' => 'ORD-20260815-0004',
            'order_date' => '2026-08-15',
            'product_description' => 'Gold Ring',
            'metal_type' => 'gold',
            'purity_id' => $this->purity->id,
            'estimated_weight' => 5.0,
            'estimated_amount' => 50000,
            'advance_amount' => 20000,
            'due_amount' => 30000,
            'status' => 'new',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->post(route('orders.record-payment', $order), [
            'amount' => 15000,
        ]);

        $fresh = $order->fresh();
        $this->assertEquals(35000, $fresh->advance_amount);
        $this->assertEquals(15000, $fresh->due_amount);
    }

    public function test_order_can_be_deleted()
    {
        $order = Order::create([
            'branch_id' => $this->branch->id,
            'customer_id' => $this->customer->id,
            'order_no' => 'ORD-20260815-0005',
            'order_date' => '2026-08-15',
            'product_description' => 'Gold Ring',
            'metal_type' => 'gold',
            'purity_id' => $this->purity->id,
            'estimated_weight' => 5.0,
            'estimated_amount' => 50000,
            'advance_amount' => 50000,
            'due_amount' => 0,
            'status' => 'new',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->delete(route('orders.destroy', $order));

        $response->assertRedirect(route('orders.index'));
        $this->assertSoftDeleted('orders', ['id' => $order->id]);
    }
}
