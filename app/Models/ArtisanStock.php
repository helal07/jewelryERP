<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArtisanStock extends Model
{
    protected $table = 'artisan_stock';

    protected $fillable = [
        'branch_id', 'artisan_id', 'product_id',
        'metal_type', 'purity_id',
        'weight_issued', 'weight_returned', 'balance_weight',
        'reference_type', 'reference_id',
    ];

    protected $casts = [
        'weight_issued' => 'decimal:3',
        'weight_returned' => 'decimal:3',
        'balance_weight' => 'decimal:3',
    ];

    public function artisan()
    {
        return $this->belongsTo(Artisan::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purity()
    {
        return $this->belongsTo(Purity::class);
    }
}
