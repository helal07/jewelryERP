<?php

namespace App\Services;

use App\Models\SalaryPayment;
use App\Models\Payroll;

class SalaryPaymentService
{
    public function createSalaryPayment(array $data)
    {
        // Auto-generate payment_no
        $data['payment_no'] = 'SP-' . date('Ymd') . '-' . strtoupper(uniqid());
        $data['created_by'] = auth()->id() ?? 1; // Fallback for tests if needed

        $payment = SalaryPayment::create($data);

        $this->updatePayrollStatus($payment->payroll_id);

        return $payment;
    }

    public function updatePayrollStatus($payroll_id)
    {
        $payroll = Payroll::find($payroll_id);
        if ($payroll) {
            $totalPaid = SalaryPayment::where('payroll_id', $payroll_id)->sum('amount');
            if ($totalPaid >= $payroll->net_salary) {
                $payroll->update(['status' => 'paid']);
            } else {
                // If it's not fully paid, revert to approved (if it was paid before)
                if ($payroll->status === 'paid') {
                    $payroll->update(['status' => 'approved']);
                } elseif ($payroll->status === 'draft' && $totalPaid > 0) {
                    $payroll->update(['status' => 'approved']);
                }
            }
        }
    }
}
