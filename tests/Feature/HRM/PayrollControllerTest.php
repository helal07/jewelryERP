<?php

namespace Tests\Feature\HRM;

use App\Models\User;
use App\Models\Branch;
use App\Models\Staff;
use App\Models\Payroll;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Staff $staff;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        $this->branch = Branch::create([
            'name' => 'Main Branch',
            'code' => 'MB-01',
            'status' => 'active',
            'is_head_office' => true,
        ]);

        $this->staff = Staff::create([
            'employee_code' => 'EMP-001',
            'name' => 'John Doe',
            'branch_id' => $this->branch->id,
            'salary_type' => 'fixed',
            'basic_salary' => 5000,
            'status' => 'active',
        ]);
    }

    public function test_index_loads_for_authenticated_user(): void
    {
        $response = $this->actingAs($this->user)->get(route('hrm.payroll.index'));
        $response->assertStatus(200);
    }

    public function test_store_creates_payroll(): void
    {
        $response = $this->actingAs($this->user)->post(route('hrm.payroll.store'), [
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'month' => 5,
            'year' => 2026,
            'basic_salary' => 5000,
            'allowances' => 500,
            'deductions' => 100,
            'status' => 'approved',
        ]);

        $response->assertRedirect(route('hrm.payroll.index'));
        $this->assertDatabaseHas('payrolls', [
            'staff_id' => $this->staff->id,
            'month' => 5,
            'year' => 2026,
            'net_salary' => 5400, // 5000 + 500 - 100
        ]);
    }

    public function test_update_modifies_payroll(): void
    {
        $payroll = Payroll::create([
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'month' => 6,
            'year' => 2026,
            'basic_salary' => 5000,
            'allowances' => 0,
            'deductions' => 0,
            'net_salary' => 5000,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->user)->put(route('hrm.payroll.update', $payroll->id), [
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'month' => 6,
            'year' => 2026,
            'basic_salary' => 5000,
            'allowances' => 1000, // modified
            'deductions' => 0,
            'status' => 'approved',
        ]);

        $response->assertRedirect(route('hrm.payroll.index'));
        $this->assertDatabaseHas('payrolls', [
            'id' => $payroll->id,
            'status' => 'approved',
            'net_salary' => 6000, // 5000 + 1000 - 0
        ]);
    }
}
