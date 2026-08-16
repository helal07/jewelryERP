<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'products' => ['required', 'array', 'min:1'],
            'products.*.stock_type' => ['nullable', 'string', 'max:50'],
            'products.*.date' => ['nullable', 'date'],
            'products.*.supplier_id' => ['nullable', 'exists:suppliers,id'],
            'products.*.name' => ['required', 'string', 'max:150'],
            'products.*.category_id' => ['required', 'exists:product_categories,id'],
            'products.*.metal_type' => ['required', 'in:gold,silver,platinum,diamond,mixed'],
            'products.*.purity_id' => ['nullable', 'exists:purities,id'],
            'products.*.gross_weight' => ['required', 'numeric', 'min:0'],
            'products.*.stone_weight' => ['nullable', 'numeric', 'min:0'],
            'products.*.rate_per_vori' => ['nullable', 'numeric', 'min:0'],
            'products.*.making_charge_type' => ['required', 'in:fixed,per_gram,percentage'],
            'products.*.making_charge_value' => ['required', 'numeric', 'min:0'],
            'products.*.stone_charge' => ['nullable', 'numeric', 'min:0'],
            'products.*.vat_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'products.*.wastage_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'products.*.unit' => ['required', 'in:piece,gram,pair,set'],
            'products.*.image' => ['nullable', 'image', 'max:2048'],
            'products.*.description' => ['nullable', 'string'],
            'products.*.status' => ['required', 'in:active,inactive'],
        ];
    }
}
