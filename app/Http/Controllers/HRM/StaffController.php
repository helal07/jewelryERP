<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Branch;
use App\Services\StaffService;
use App\Http\Requests\HRM\StoreStaffRequest;
use App\Http\Requests\HRM\UpdateStaffRequest;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function __construct(private StaffService $staffService)
    {
    }

    public function index()
    {
        $staff = Staff::with('branch')->latest()->paginate(10);
        return Inertia::render('HRM/Staff/Index', [
            'staff' => $staff
        ]);
    }

    public function create()
    {
        return Inertia::render('HRM/Staff/Create', [
            'branches' => Branch::all()
        ]);
    }

    public function store(StoreStaffRequest $request)
    {
        $this->staffService->createStaff($request->validated());
        return redirect()->route('hrm.staff.index')->with('success', 'Staff created successfully.');
    }

    public function edit(Staff $staff)
    {
        return Inertia::render('HRM/Staff/Edit', [
            'staff' => $staff,
            'branches' => Branch::all()
        ]);
    }

    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        $this->staffService->updateStaff($staff, $request->validated());
        return redirect()->route('hrm.staff.index')->with('success', 'Staff updated successfully.');
    }

    public function destroy(Staff $staff)
    {
        $this->staffService->deleteStaff($staff);
        return redirect()->route('hrm.staff.index')->with('success', 'Staff deleted successfully.');
    }
}
