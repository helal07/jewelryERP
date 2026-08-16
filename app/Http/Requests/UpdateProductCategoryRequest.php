<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'parent_id' => ['nullable', 'exists:product_categories,id'],
            'metal_type' => ['required', 'in:gold,silver,platinum,diamond,mixed'],
        ];
    }
}
