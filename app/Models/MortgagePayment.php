<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MortgagePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'mortgage_id',
        'payment_no',
        'payment_date',
        'amount',
        'payment_type',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function mortgage()
    {
        return $this->belongsTo(Mortgage::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->payment_no) {
                $lastPayment = self::latest('id')->first();
                $lastId = $lastPayment ? $lastPayment->id : 0;
                $payment->payment_no = 'MPAY-' . str_pad($lastId + 1, 6, '0', STR_PAD_LEFT);
            }
        });
    }
}
