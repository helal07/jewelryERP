<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_id')->constrained('productions')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('restrict');
            $table->string('item_name')->nullable();
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('issued_weight', 10, 3)->default(0);
            $table->decimal('returned_weight', 10, 3)->default(0);
            $table->decimal('finished_weight', 10, 3)->default(0);
            $table->decimal('wastage_weight', 10, 3)->default(0);
            $table->integer('quantity')->default(1);
            $table->string('status', 50)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_items');
    }
};