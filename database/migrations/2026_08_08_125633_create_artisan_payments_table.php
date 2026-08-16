<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artisan_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artisan_id')->constrained('artisans')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('restrict');
            $table->foreignId('production_id')->nullable()->constrained('productions')->onDelete('restrict');
            $table->string('payment_no')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artisan_payments');
    }
};