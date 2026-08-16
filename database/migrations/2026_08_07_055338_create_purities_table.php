<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purities', function (Blueprint $table) {
            $table->id();
            $table->enum('metal_type', ['gold', 'silver', 'platinum']);
            $table->string('name', 20);
            $table->decimal('percentage', 5, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purities');
    }
};
