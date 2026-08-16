<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetalPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'metal_type',
        'purity_id',
        'price_per_gram',
        'effective_date',
        'branch_id',
        'created_by',
    ];

    protected $casts = [
        'price_per_gram' => 'decimal:2',
        'effective_date' => 'date',
    ];

    public function purity()
    {
        return $this->belongsTo(Purity::class, 'purity_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
