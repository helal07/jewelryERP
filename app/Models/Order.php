<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'customer_id',
        'product_id',
        'order_no',
        'order_date',
        'delivery_date',
        'product_name',
        'category',
        'product_description',
        'reference_image',
        'metal_type',
        'purity_id',
        'rate_per_vori',
        'vori',
        'ana',
        'roti',
        'point',
        'estimated_weight',
        'making_charge',
        'vat_amount',
        'hallmark_charge',
        'stone_charge',
        'estimated_amount',
        'advance_amount',
        'due_amount',
        'status',
        'created_by',
    ];

    protected $casts = [
        'order_date' => 'date:Y-m-d',
        'delivery_date' => 'date:Y-m-d',
        'estimated_weight' => 'decimal:3',
        'rate_per_vori' => 'decimal:2',
        'making_charge' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'hallmark_charge' => 'decimal:2',
        'stone_charge' => 'decimal:2',
        'estimated_amount' => 'decimal:2',
        'advance_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments()
    {
        return $this->hasMany(OrderAssignment::class);
    }

    public function currentAssignment()
    {
        return $this->hasOne(OrderAssignment::class)->latestOfMany();
    }

    public function payments()
    {
        return $this->hasMany(ArtisanPayment::class);
    }
}
