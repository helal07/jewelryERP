<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('category_id')->constrained('product_categories')->onDelete('restrict');
            $table->string('sku', 50)->unique();
            $table->string('barcode', 100)->unique()->nullable();
            $table->string('name', 150);
            $table->enum('metal_type', ['gold', 'silver', 'platinum', 'diamond', 'mixed']);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('stone_weight', 10, 3)->default(0);
            $table->decimal('net_weight', 10, 3);
            $table->enum('making_charge_type', ['fixed', 'per_gram', 'percentage']);
            $table->decimal('making_charge_value', 15, 2);
            $table->decimal('stone_charge', 15, 2)->default(0);
            $table->decimal('wastage_percentage', 5, 2)->default(0);
            $table->enum('unit', ['piece', 'gram', 'pair', 'set']);
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};