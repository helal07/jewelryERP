<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->string('description')->nullable();
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('stone_weight', 10, 3)->default(0);
            $table->decimal('net_weight', 10, 3);
            $table->decimal('rate_per_gram', 15, 2);
            $table->decimal('making_charge', 15, 2)->default(0);
            $table->decimal('stone_charge', 15, 2)->default(0);
            $table->integer('quantity');
            $table->decimal('total_amount', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};