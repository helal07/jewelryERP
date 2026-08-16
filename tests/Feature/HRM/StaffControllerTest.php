<?php

namespace Tests\Feature\HRM;

use App\Models\User;
use App\Models\Branch;
use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;

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
    }

    public function test_index_loads_for_authenticated_user(): void
    {
        $response = $this->actingAs($this->user)->get(route('hrm.staff.index'));
        $response->assertStatus(200);
    }

    public function test_store_creates_staff(): void
    {
        $response = $this->actingAs($this->user)->post(route('hrm.staff.store'), [
            'employee_code' => 'EMP-001',
            'name' => 'John Doe',
            'branch_id' => $this->branch->id,
            'salary_type' => 'fixed',
            'basic_salary' => 5000,
            'status' => 'active',
        ]);

        $response->assertRedirect(route('hrm.staff.index'));
        $this->assertDatabaseHas('staff', [
            'employee_code' => 'EMP-001',
            'name' => 'John Doe',
        ]);
    }

    public function test_update_modifies_staff(): void
    {
        $staff = Staff::create([
            'employee_code' => 'EMP-002',
            'name' => 'Jane Doe',
            'branch_id' => $this->branch->id,
            'salary_type' => 'fixed',
            'basic_salary' => 6000,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)->put(route('hrm.staff.update', $staff->id), [
            'employee_code' => 'EMP-002',
            'name' => 'Jane Smith',
            'branch_id' => $this->branch->id,
            'salary_type' => 'fixed',
            'basic_salary' => 7000,
            'status' => 'active',
        ]);

        $response->assertRedirect(route('hrm.staff.index'));
        $this->assertDatabaseHas('staff', [
            'id' => $staff->id,
            'name' => 'Jane Smith',
            'basic_salary' => 7000,
        ]);
    }
}
