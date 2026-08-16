<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('users.edit');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $this->user->id],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone,' . $this->user->id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'branch_id' => ['nullable', 'exists:branches,id'],
            'role' => ['required', 'exists:roles,name'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
