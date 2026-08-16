<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Staff;
use App\Models\Branch;
use App\Services\PayrollService;
use App\Http\Requests\HRM\StorePayrollRequest;
use App\Http\Requests\HRM\UpdatePayrollRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function __construct(private PayrollService $payrollService)
    {
    }

    public function index(Request $request)
    {
        $query = Payroll::with(['staff', 'branch'])->latest();

        if ($request->has('month') && $request->has('year')) {
            $query->where('month', $request->month)->where('year', $request->year);
        }

        return Inertia::render('HRM/Payroll/Index', [
            'payrolls' => $query->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('HRM/Payroll/Create', [
            'staffs' => Staff::all(),
            'branches' => Branch::all()
        ]);
    }

    public function store(StorePayrollRequest $request)
    {
        $this->payrollService->createPayroll($request->validated());
        return redirect()->route('hrm.payroll.index')->with('success', 'Payroll created successfully.');
    }

    public function edit(Payroll $payroll)
    {
        return Inertia::render('HRM/Payroll/Edit', [
            'payroll' => $payroll,
            'staffs' => Staff::all(),
            'branches' => Branch::all()
        ]);
    }

    public function update(UpdatePayrollRequest $request, Payroll $payroll)
    {
        $this->payrollService->updatePayroll($payroll, $request->validated());
        return redirect()->route('hrm.payroll.index')->with('success', 'Payroll updated successfully.');
    }

    public function destroy(Payroll $payroll)
    {
        if ($payroll->payments()->exists()) {
            return back()->with('error', 'Cannot delete payroll with existing payments.');
        }
        $this->payrollService->deletePayroll($payroll);
        return redirect()->route('hrm.payroll.index')->with('success', 'Payroll deleted successfully.');
    }
}
