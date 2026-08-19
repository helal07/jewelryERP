<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stock_type' => ['nullable', 'string', 'max:50'],
            'date' => ['nullable', 'date'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'name' => ['required', 'string', 'max:150'],
            'barcode' => ['nullable', 'string', 'max:150'],
            'category_id' => ['required', 'exists:product_categories,id'],
            'metal_type' => ['sometimes', 'required', 'in:gold,silver,platinum,diamond,mixed'],
            'purity_id' => ['nullable', 'exists:purities,id'],
            'rate_per_vori' => ['nullable', 'numeric', 'min:0'],
            'gross_weight' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stone_weight' => ['nullable', 'numeric', 'min:0'],
            'making_charge_type' => ['required', 'in:fixed,per_gram,percentage'],
            'making_charge_value' => ['required', 'numeric', 'min:0'],
            'stone_charge' => ['nullable', 'numeric', 'min:0'],
            'vat_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'wastage_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'unit' => ['required', 'in:piece,gram,pair,set'],
            'image' => ['nullable', 'image', 'max:2048'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
