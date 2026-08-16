<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'user_id',
        'employee_code',
        'name',
        'designation',
        'department',
        'phone',
        'address',
        'nid_number',
        'joining_date',
        'salary_type',
        'basic_salary',
        'status',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'basic_salary' => 'decimal:2',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
