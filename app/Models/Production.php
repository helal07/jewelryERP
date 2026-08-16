<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Production extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'production_no',
        'artisan_id',
        'order_id',
        'product_category_id',
        'product_id',
        'purity_id',
        'metal_type',
        'stock_type',
        'order_date',
        'delivery_date',
        'start_date',
        'expected_end_date',
        'actual_end_date',
        'raw_metal_issued_weight',
        'vori',
        'ana',
        'roti',
        'point',
        'weight_gm',
        'artisan_charge',
        'wastage_percentage',
        'paid_amount',
        'due_amount',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'order_date' => 'date:Y-m-d',
        'delivery_date' => 'date:Y-m-d',
        'start_date' => 'date:Y-m-d',
        'expected_end_date' => 'date:Y-m-d',
        'actual_end_date' => 'date:Y-m-d',
        'raw_metal_issued_weight' => 'decimal:3',
        'vori' => 'decimal:2',
        'ana' => 'decimal:2',
        'roti' => 'decimal:2',
        'point' => 'decimal:2',
        'weight_gm' => 'decimal:3',
        'artisan_charge' => 'decimal:2',
        'wastage_percentage' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function artisan()
    {
        return $this->belongsTo(Artisan::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
