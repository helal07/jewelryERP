<?php

namespace App\Http\Requests\HRM;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRequest extends FormRequest
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
        $attendanceId = $this->route('attendance')->id ?? $this->route('attendance');

        return [
            'staff_id' => [
                'required',
                'exists:staff,id',
                \Illuminate\Validation\Rule::unique('attendances')->where(function ($query) {
                    return $query->where('attendance_date', $this->attendance_date);
                })->ignore($attendanceId)
            ],
            'branch_id' => 'required|exists:branches,id',
            'attendance_date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after_or_equal:check_in',
            'status' => 'required|in:present,absent,half_day,leave,holiday',
            'remarks' => 'nullable|string|max:255',
        ];
    }
}
