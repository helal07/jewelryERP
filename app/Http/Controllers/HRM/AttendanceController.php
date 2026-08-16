<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Staff;
use App\Models\Branch;
use App\Services\AttendanceService;
use App\Http\Requests\HRM\StoreAttendanceRequest;
use App\Http\Requests\HRM\UpdateAttendanceRequest;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendanceService)
    {
    }

    public function index(\Illuminate\Http\Request $request)
    {
        $query = Attendance::with(['staff', 'branch'])->orderBy('attendance_date', 'desc');
        
        if ($request->has('date')) {
            $query->whereDate('attendance_date', $request->date);
        }

        return Inertia::render('HRM/Attendance/Index', [
            'attendances' => $query->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('HRM/Attendance/Create', [
            'staffs' => Staff::all(),
            'branches' => Branch::all()
        ]);
    }

    public function store(StoreAttendanceRequest $request)
    {
        $this->attendanceService->createAttendance($request->validated());
        return redirect()->route('hrm.attendance.index')->with('success', 'Attendance recorded successfully.');
    }

    public function edit(Attendance $attendance)
    {
        return Inertia::render('HRM/Attendance/Edit', [
            'attendance' => $attendance,
            'staffs' => Staff::all(),
            'branches' => Branch::all()
        ]);
    }

    public function update(UpdateAttendanceRequest $request, Attendance $attendance)
    {
        $this->attendanceService->updateAttendance($attendance, $request->validated());
        return redirect()->route('hrm.attendance.index')->with('success', 'Attendance updated successfully.');
    }

    public function destroy(Attendance $attendance)
    {
        $this->attendanceService->deleteAttendance($attendance);
        return redirect()->route('hrm.attendance.index')->with('success', 'Attendance deleted successfully.');
    }
}
