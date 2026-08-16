<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Artisan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'code',
        'name',
        'phone',
        'address',
        'specialization',
        'wage_type',
        'rate',
        'opening_balance',
        'due_balance',
        'status',
        'nid_number',
        'photo',
        'attachment',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
