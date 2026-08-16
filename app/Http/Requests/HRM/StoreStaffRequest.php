<?php

namespace App\Http\Requests\HRM;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
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
        return [
            'branch_id' => 'required|exists:branches,id',
            'employee_code' => 'required|string|max:255|unique:staff',
            'name' => 'required|string|max:255',
            'designation' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'nid_number' => 'nullable|string|max:255',
            'joining_date' => 'nullable|date',
            'salary_type' => 'required|in:fixed,commission',
            'basic_salary' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,resigned',
        ];
    }
}
