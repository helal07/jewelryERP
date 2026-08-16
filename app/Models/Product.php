<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected $fillable = [
        'branch_id',
        'stock_type',
        'date',
        'category_id',
        'supplier_id',
        'sku',
        'barcode',
        'name',
        'metal_type',
        'purity_id',
        'gross_weight',
        'stone_weight',
        'net_weight',
        'rate_per_vori',
        'making_charge_type',
        'making_charge_value',
        'stone_charge',
        'vat_percentage',
        'wastage_percentage',
        'unit',
        'image',
        'description',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'gross_weight' => 'decimal:3',
        'stone_weight' => 'decimal:3',
        'net_weight' => 'decimal:3',
        'rate_per_vori' => 'decimal:2',
        'making_charge_value' => 'decimal:2',
        'stone_charge' => 'decimal:2',
        'vat_percentage' => 'decimal:2',
        'wastage_percentage' => 'decimal:2',
    ];

    // Relationships

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }
}
