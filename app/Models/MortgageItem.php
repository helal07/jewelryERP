<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MortgageItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'mortgage_id',
        'stock_type',
        'category_id',
        'product_id',
        'item_name',
        'metal_type',
        'purity_id',
        'rate_per_vori',
        'rate_per_gram',
        'weight_unit',
        'vori',
        'ana',
        'roti',
        'point',
        'gross_weight',
        'stone_weight',
        'net_weight',
        'estimated_value',
        'quantity',
        'image',
    ];

    protected $casts = [
        'gross_weight' => 'decimal:3',
        'net_weight' => 'decimal:3',
        'estimated_value' => 'decimal:2',
    ];

    public function mortgage()
    {
        return $this->belongsTo(Mortgage::class);
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }
}
