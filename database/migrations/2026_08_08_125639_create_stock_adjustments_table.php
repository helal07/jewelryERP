<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('adjustment_no')->unique();
            $table->date('adjustment_date');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->integer('quantity_change');
            $table->decimal('weight_change', 10, 3);
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};