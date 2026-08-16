<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        Branch::create([
            'name' => 'Main Branch',
            'code' => 'BR-MAIN',
            'phone' => '01700000000',
            'address' => 'Dhaka',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create();
    }

    public function test_suppliers_index_loads()
    {
        $response = $this->actingAs($this->user)->get(route('suppliers.index'));

        $response->assertStatus(200);
    }

    public function test_supplier_can_be_created_via_web_form()
    {
        $response = $this->actingAs($this->user)->post(route('suppliers.store'), [
            'name' => 'Al-Razi Gold Supplier',
            'company_name' => 'Al-Razi Traders',
            'phone' => '01711223344',
            'address' => 'Baitul Mukarram, Dhaka',
            'status' => 'active',
        ]);

        $response->assertRedirect(route('suppliers.index'));
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Al-Razi Gold Supplier',
            'phone' => '01711223344',
        ]);
    }

    public function test_supplier_can_be_created_with_minimal_info()
    {
        $response = $this->actingAs($this->user)->post(route('suppliers.store'), [
            'name' => 'Simple Supplier',
        ]);

        $response->assertRedirect(route('suppliers.index'));
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Simple Supplier',
        ]);
    }

    public function test_supplier_can_be_created_via_json_ajax()
    {
        $response = $this->actingAs($this->user)
            ->postJson(route('suppliers.store'), [
                'name' => 'Quick AJAX Supplier',
                'phone' => '01800998877',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Quick AJAX Supplier',
        ]);
    }
}
