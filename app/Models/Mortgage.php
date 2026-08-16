<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mortgage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'mortgage_customer_id',
        'mortgage_no',
        'mortgage_date',
        'due_date',
        'principal_amount',
        'interest_rate',
        'interest_type',
        'status',
        'created_by',
    ];

    protected $casts = [
        'mortgage_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
        'principal_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer()
    {
        return $this->belongsTo(MortgageCustomer::class, 'mortgage_customer_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(MortgageItem::class);
    }

    public function payments()
    {
        return $this->hasMany(MortgagePayment::class);
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($mortgage) {
            if (!$mortgage->mortgage_no) {
                $lastMortgage = self::latest('id')->first();
                $lastId = $lastMortgage ? $lastMortgage->id : 0;
                $mortgage->mortgage_no = 'MRT-' . str_pad($lastId + 1, 6, '0', STR_PAD_LEFT);
            }
        });
    }
}
