<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mortgage_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mortgage_id')->constrained('mortgages')->onDelete('cascade');
            $table->string('item_name');
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('net_weight', 10, 3);
            $table->decimal('estimated_value', 15, 2);
            $table->integer('quantity');
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mortgage_items');
    }
};