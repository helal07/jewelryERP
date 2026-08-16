<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLedger extends Model
{
    public $timestamps = false;

    protected $table = 'stock_ledger';

    protected $fillable = [
        'branch_id', 'product_id', 'transaction_type',
        'reference_type', 'reference_id',
        'quantity_in', 'quantity_out',
        'weight_in', 'weight_out',
        'balance_quantity', 'balance_weight',
        'created_by', 'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'weight_in' => 'decimal:3',
        'weight_out' => 'decimal:3',
        'balance_weight' => 'decimal:3',
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
}
