<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_id',
        'staff_id',
        'branch_id',
        'payment_no',
        'payment_date',
        'amount',
        'payment_method',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
