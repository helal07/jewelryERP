<?php

namespace App\Http\Requests\HRM;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePayrollRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $payrollId = $this->route('payroll')->id ?? $this->route('payroll');

        return [
            'staff_id' => [
                'required',
                'exists:staff,id',
                \Illuminate\Validation\Rule::unique('payrolls')->where(function ($query) {
                    return $query->where('month', $this->month)->where('year', $this->year);
                })->ignore($payrollId)
            ],
            'branch_id' => 'required|exists:branches,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,approved,paid',
        ];
    }
}
