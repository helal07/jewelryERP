<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\SalaryPayment;
use App\Models\Payroll;
use App\Models\Staff;
use App\Models\Branch;
use App\Services\SalaryPaymentService;
use App\Http\Requests\HRM\StoreSalaryPaymentRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SalaryPaymentController extends Controller
{
    public function __construct(private SalaryPaymentService $paymentService)
    {
    }

    public function index(Request $request)
    {
        $query = SalaryPayment::with(['payroll', 'staff', 'branch', 'creator'])->latest('payment_date');

        return Inertia::render('HRM/SalaryPayment/Index', [
            'payments' => $query->paginate(10)
        ]);
    }

    public function create(Request $request)
    {
        // Optionally pass a pre-selected payroll
        $payroll = null;
        if ($request->has('payroll_id')) {
            $payroll = Payroll::with('staff')->find($request->payroll_id);
        }

        return Inertia::render('HRM/SalaryPayment/Create', [
            'payrolls' => Payroll::with('staff')->whereIn('status', ['approved', 'draft'])->get(),
            'staffs' => Staff::all(),
            'branches' => Branch::all(),
            'selectedPayroll' => $payroll
        ]);
    }

    public function store(StoreSalaryPaymentRequest $request)
    {
        $this->paymentService->createSalaryPayment($request->validated());
        return redirect()->route('hrm.salary.index')->with('success', 'Salary payment recorded successfully.');
    }

    // Usually, we might not allow editing/deleting payments once recorded for audit reasons, 
    // but we can add destroy if needed. Let's stick to basic recording for now.
    public function destroy(SalaryPayment $salary)
    {
        $salary->delete();
        $this->paymentService->updatePayrollStatus($salary->payroll_id);
        return redirect()->route('hrm.salary.index')->with('success', 'Salary payment deleted successfully.');
    }
}
