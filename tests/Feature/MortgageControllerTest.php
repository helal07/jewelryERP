<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Mortgage;
use App\Models\MortgageCustomer;
use App\Models\Purity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MortgageControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $branch;
    protected $customer;
    protected $purity;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        $this->branch = Branch::create([
            'name' => 'Test Branch',
            'code' => 'TEST01',
            'status' => 'active'
        ]);

        $this->customer = MortgageCustomer::create([
            'branch_id' => $this->branch->id,
            'code' => 'TESTCUST01',
            'name' => 'Test Customer',
            'phone' => '01700000000',
            'status' => 'active'
        ]);

        $this->purity = Purity::create([
            'name' => '22K',
            'metal_type' => 'gold',
            'percentage' => 91.6,
            'is_active' => true
        ]);
    }

    public function test_mortgage_index_loads_successfully()
    {
        Mortgage::create([
            'mortgage_no' => 'MRTG-TEST-001',
            'mortgage_customer_id' => $this->customer->id,
            'branch_id' => $this->branch->id,
            'mortgage_date' => now()->format('Y-m-d'),
            'principal_amount' => 50000,
            'interest_rate' => 2,
            'interest_type' => 'monthly',
            'status' => 'active',
            'created_by' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('mortgages.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mortgages/Index')
            ->has('mortgages.data', 1)
        );
    }

    public function test_mortgage_index_filtering()
    {
        Mortgage::create([
            'mortgage_no' => 'MRTG-ACTIVE',
            'mortgage_customer_id' => $this->customer->id,
            'branch_id' => $this->branch->id,
            'mortgage_date' => now()->format('Y-m-d'),
            'principal_amount' => 50000,
            'interest_rate' => 2,
            'interest_type' => 'monthly',
            'status' => 'active',
            'created_by' => $this->user->id
        ]);

        Mortgage::create([
            'mortgage_no' => 'MRTG-OVERDUE',
            'mortgage_customer_id' => $this->customer->id,
            'branch_id' => $this->branch->id,
            'mortgage_date' => now()->format('Y-m-d'),
            'principal_amount' => 50000,
            'interest_rate' => 2,
            'interest_type' => 'monthly',
            'status' => 'overdue',
            'created_by' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('mortgages.index', ['status' => 'overdue']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mortgages/Index')
            ->has('mortgages.data', 1)
        );
    }

    public function test_mortgage_details_search_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('mortgages.details'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Mortgages/DetailsSearch')
        );
    }

    public function test_can_add_mortgage_payment()
    {
        $mortgage = Mortgage::create([
            'mortgage_no' => 'MRTG-PAY-001',
            'mortgage_customer_id' => $this->customer->id,
            'branch_id' => $this->branch->id,
            'mortgage_date' => now()->format('Y-m-d'),
            'principal_amount' => 50000,
            'interest_rate' => 2,
            'interest_type' => 'monthly',
            'status' => 'active',
            'created_by' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('mortgages.payments.store', $mortgage->id), [
                'payment_date' => now()->format('Y-m-d'),
                'amount' => 5000,
                'payment_type' => 'interest',
                'notes' => 'First interest payment'
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('mortgage_payments', [
            'mortgage_id' => $mortgage->id,
            'amount' => 5000,
            'payment_type' => 'interest'
        ]);
    }

    public function test_can_update_mortgage_status()
    {
        $mortgage = Mortgage::create([
            'mortgage_no' => 'MRTG-STATUS-001',
            'mortgage_customer_id' => $this->customer->id,
            'branch_id' => $this->branch->id,
            'mortgage_date' => now()->format('Y-m-d'),
            'principal_amount' => 50000,
            'interest_rate' => 2,
            'interest_type' => 'monthly',
            'status' => 'active',
            'created_by' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->patch(route('mortgages.update-status', $mortgage->id), [
                'status' => 'redeemed'
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('mortgages', [
            'id' => $mortgage->id,
            'status' => 'redeemed'
        ]);
    }
}
