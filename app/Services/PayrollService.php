<?php

namespace App\Services;

use App\Models\Payroll;

class PayrollService
{
    public function createPayroll(array $data)
    {
        // Calculate Net Salary if not provided, though the frontend might send it, it's safer to calc server-side.
        // Assuming basic_salary, allowances, deductions are provided.
        $net_salary = floatval($data['basic_salary']) + floatval($data['allowances'] ?? 0) - floatval($data['deductions'] ?? 0);
        $data['net_salary'] = $net_salary;

        return Payroll::create($data);
    }

    public function updatePayroll(Payroll $payroll, array $data)
    {
        $net_salary = floatval($data['basic_salary']) + floatval($data['allowances'] ?? 0) - floatval($data['deductions'] ?? 0);
        $data['net_salary'] = $net_salary;

        $payroll->update($data);
        return $payroll;
    }

    public function deletePayroll(Payroll $payroll)
    {
        $payroll->delete();
    }
}
