<?php

namespace Tests\Feature;

use App\Models\Artisan;
use App\Models\Branch;
use App\Models\Production;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $branch;
    protected $artisan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->branch = Branch::create([
            'name' => 'Main Branch',
            'code' => 'MB01',
            'status' => 'active',
        ]);

        $this->artisan = Artisan::create([
            'branch_id' => $this->branch->id,
            'code' => 'ART-001',
            'name' => 'Kalam Master',
            'phone' => '01711223344',
            'specialization' => 'Goldsmith',
            'wage_type' => 'per_gram',
            'status' => 'active',
        ]);
    }

    public function test_production_index_loads_successfully()
    {
        $response = $this->actingAs($this->user)->get(route('production.index'));
        $response->assertStatus(200);
    }

    public function test_production_create_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('production.create'));
        $response->assertStatus(200);
    }

    public function test_can_create_production_job()
    {
        $response = $this->actingAs($this->user)->post(route('production.store'), [
            'branch_id' => $this->branch->id,
            'artisan_id' => $this->artisan->id,
            'metal_type' => 'gold',
            'stock_type' => 'ready_stock',
            'order_date' => now()->toDateString(),
            'delivery_date' => now()->addDays(7)->toDateString(),
            'start_date' => now()->toDateString(),
            'vori' => 2,
            'ana' => 4,
            'roti' => 0,
            'point' => 0,
            'weight_gm' => 26.244,
            'artisan_charge' => 3500.00,
            'wastage_percentage' => 2.50,
            'paid_amount' => 1000.00,
            'due_amount' => 2500.00,
            'status' => 'pending',
            'notes' => 'Test extended production job',
        ]);

        $response->assertRedirect(route('production.index'));
        $this->assertDatabaseHas('productions', [
            'artisan_id' => $this->artisan->id,
            'metal_type' => 'gold',
            'stock_type' => 'ready_stock',
            'weight_gm' => 26.244,
            'artisan_charge' => 3500.00,
            'due_amount' => 2500.00,
            'status' => 'pending',
        ]);
    }

    public function test_production_status_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('production.status'));
        $response->assertStatus(200);
    }

    public function test_can_update_production_status()
    {
        $production = Production::create([
            'production_no' => 'PRD-TEST-0001',
            'branch_id' => $this->branch->id,
            'artisan_id' => $this->artisan->id,
            'start_date' => now()->toDateString(),
            'raw_metal_issued_weight' => 15.000,
            'status' => 'pending',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->patch(route('production.update-status', $production->id), [
            'status' => 'in_progress',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('productions', [
            'id' => $production->id,
            'status' => 'in_progress',
        ]);
    }
}
