<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->enum('transaction_type', ['opening', 'purchase', 'sale', 'sale_return', 'purchase_return', 'production_in', 'production_out', 'artisan_issue', 'artisan_return', 'adjustment']);
            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->integer('quantity_in')->default(0);
            $table->integer('quantity_out')->default(0);
            $table->decimal('weight_in', 10, 3)->default(0);
            $table->decimal('weight_out', 10, 3)->default(0);
            $table->integer('balance_quantity')->default(0);
            $table->decimal('balance_weight', 10, 3)->default(0);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_ledger');
    }
};