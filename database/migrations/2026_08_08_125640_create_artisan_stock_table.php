<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artisan_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('artisan_id')->constrained('artisans')->onDelete('restrict');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('restrict');
            $table->string('metal_type', 30)->nullable();
            $table->foreignId('purity_id')->nullable()->constrained('purities')->onDelete('restrict');
            $table->decimal('weight_issued', 10, 3)->default(0);
            $table->decimal('weight_returned', 10, 3)->default(0);
            $table->decimal('balance_weight', 10, 3)->default(0);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artisan_stock');
    }
};