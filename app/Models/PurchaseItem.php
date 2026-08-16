<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'product_id',
        'item_name',
        'stock_type',
        'category_id',
        'description',
        'metal_type',
        'purity_id',
        'hallmark_no',
        'photo',
        'gross_weight',
        'stone_weight',
        'net_weight',
        'rate_per_gram',
        'making_charge',
        'stone_charge',
        'wastage_percentage',
        'quantity',
        'total_amount',
    ];

    protected $casts = [
        'gross_weight' => 'decimal:3',
        'stone_weight' => 'decimal:3',
        'net_weight'   => 'decimal:3',
        'rate_per_gram'=> 'decimal:2',
        'making_charge'=> 'decimal:2',
        'stone_charge' => 'decimal:2',
        'wastage_percentage' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }
}
