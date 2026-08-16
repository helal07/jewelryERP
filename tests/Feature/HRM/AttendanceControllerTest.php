<?php

namespace Tests\Feature\HRM;

use App\Models\User;
use App\Models\Branch;
use App\Models\Staff;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceControllerTest extends TestCase
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
        $response = $this->actingAs($this->user)->get(route('hrm.attendance.index'));
        $response->assertStatus(200);
    }

    public function test_store_creates_attendance(): void
    {
        $response = $this->actingAs($this->user)->post(route('hrm.attendance.store'), [
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'attendance_date' => date('Y-m-d'),
            'status' => 'present',
            'check_in' => '09:00',
        ]);

        $response->assertRedirect(route('hrm.attendance.index'));
        $this->assertDatabaseHas('attendances', [
            'staff_id' => $this->staff->id,
            'attendance_date' => date('Y-m-d 00:00:00'),
            'status' => 'present',
        ]);
    }

    public function test_update_modifies_attendance(): void
    {
        $attendance = Attendance::create([
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'attendance_date' => date('Y-m-d'),
            'status' => 'present',
            'check_in' => '09:00',
        ]);

        $response = $this->actingAs($this->user)->put(route('hrm.attendance.update', $attendance->id), [
            'staff_id' => $this->staff->id,
            'branch_id' => $this->branch->id,
            'attendance_date' => date('Y-m-d'),
            'status' => 'absent',
            'check_in' => null,
            'check_out' => null,
        ]);

        $response->assertRedirect(route('hrm.attendance.index'));
        $this->assertDatabaseHas('attendances', [
            'id' => $attendance->id,
            'status' => 'absent',
        ]);
    }
}
