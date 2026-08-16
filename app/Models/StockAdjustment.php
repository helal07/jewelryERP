<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockAdjustment extends Model
{
    protected $table = 'stock_adjustments';

    protected $fillable = [
        'branch_id', 'adjustment_no', 'adjustment_date',
        'product_id', 'quantity_change', 'weight_change',
        'reason', 'approved_by', 'created_by',
    ];

    protected $casts = [
        'adjustment_date' => 'date',
        'weight_change' => 'decimal:3',
        'quantity_change' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($adj) {
            if (!$adj->adjustment_no) {
                $last = self::latest('id')->first();
                $adj->adjustment_no = 'ADJ-' . str_pad(($last ? $last->id : 0) + 1, 6, '0', STR_PAD_LEFT);
            }
        });
    }
}
