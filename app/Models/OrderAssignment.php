<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'artisan_id',
        'assigned_date',
        'expected_completion_date',
        'instructions',
        'status',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'expected_completion_date' => 'date',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function artisan()
    {
        return $this->belongsTo(Artisan::class);
    }
}
