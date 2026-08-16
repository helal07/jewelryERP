<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'product_id',
        'gross_weight',
        'stone_weight',
        'net_weight',
        'rate_per_gram',
        'making_charge',
        'stone_charge',
        'quantity',
        'total_amount',
    ];

    protected $casts = [
        'gross_weight' => 'decimal:3',
        'stone_weight' => 'decimal:3',
        'net_weight' => 'decimal:3',
        'rate_per_gram' => 'decimal:2',
        'making_charge' => 'decimal:2',
        'stone_charge' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sale_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
