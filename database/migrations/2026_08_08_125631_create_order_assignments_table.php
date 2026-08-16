<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('restrict');
            $table->foreignId('artisan_id')->constrained('artisans')->onDelete('restrict');
            $table->date('assigned_date');
            $table->date('expected_completion_date')->nullable();
            $table->text('instructions')->nullable();
            $table->enum('status', ['assigned', 'in_progress', 'completed', 'rejected'])->default('assigned');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_assignments');
    }
};