<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MortgageCustomer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'code',
        'name',
        'phone',
        'nid_number',
        'address',
        'photo',
        'attachment',
        'status',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
