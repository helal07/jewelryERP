<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->string('order_no')->unique();
            $table->date('order_date');
            $table->date('delivery_date')->nullable();
            $table->text('product_description');
            $table->string('reference_image')->nullable();
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('estimated_weight', 10, 3);
            $table->decimal('estimated_amount', 15, 2);
            $table->decimal('advance_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            $table->enum('status', ['new', 'assigned', 'in_production', 'ready', 'delivered', 'cancelled'])->default('new');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['branch_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};