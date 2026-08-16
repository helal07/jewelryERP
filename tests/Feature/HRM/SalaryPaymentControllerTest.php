<?php

namespace Tests\Feature\HRM;

use App\Models\User;
use App\Models\Branch;
use App\Models\Staff;
use App\Models\Payroll;
use App\Models\SalaryPayment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalaryPaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Staff $staff;
    protected Payroll $payroll;

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

        $this->payroll = Payroll::create([
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'month' => 7,
            'year' => 2026,
            'basic_salary' => 5000,
            'allowances' => 0,
            'deductions' => 0,
            'net_salary' => 5000,
            'status' => 'approved',
        ]);
    }

    public function test_index_loads_for_authenticated_user(): void
    {
        $response = $this->actingAs($this->user)->get(route('hrm.salary.index'));
        $response->assertStatus(200);
    }

    public function test_store_creates_salary_payment_and_updates_payroll_status(): void
    {
        $response = $this->actingAs($this->user)->post(route('hrm.salary.store'), [
            'payroll_id' => $this->payroll->id,
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'payment_date' => date('Y-m-d'),
            'amount' => 5000,
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect(route('hrm.salary.index'));
        
        $this->assertDatabaseHas('salary_payments', [
            'payroll_id' => $this->payroll->id,
            'amount' => 5000,
            'payment_method' => 'cash',
        ]);

        // Verify payroll status was updated to 'paid'
        $this->assertDatabaseHas('payrolls', [
            'id' => $this->payroll->id,
            'status' => 'paid',
        ]);
    }

    public function test_destroy_deletes_payment_and_reverts_payroll_status(): void
    {
        $payment = SalaryPayment::create([
            'payroll_id' => $this->payroll->id,
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'payment_no' => 'SP-TEST-001',
            'payment_date' => date('Y-m-d'),
            'amount' => 5000,
            'payment_method' => 'cash',
            'created_by' => $this->user->id,
        ]);

        // Manually set payroll to paid as if the payment happened via store()
        $this->payroll->update(['status' => 'paid']);

        $response = $this->actingAs($this->user)->delete(route('hrm.salary.destroy', $payment->id));

        $response->assertRedirect(route('hrm.salary.index'));
        
        $this->assertDatabaseMissing('salary_payments', [
            'id' => $payment->id,
        ]);

        // Verify payroll status reverted to approved (since net_salary is 5000 and total paid is now 0)
        $this->assertDatabaseHas('payrolls', [
            'id' => $this->payroll->id,
            'status' => 'approved',
        ]);
    }
}
