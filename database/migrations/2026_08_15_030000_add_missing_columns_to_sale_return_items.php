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
        if (Schema::hasTable('sale_return_items')) {
            Schema::table('sale_return_items', function (Blueprint $table) {
                if (!Schema::hasColumn('sale_return_items', 'product_id')) {
                    $table->foreignId('product_id')->nullable()->after('sale_item_id')->constrained('products')->onDelete('set null');
                }
                if (!Schema::hasColumn('sale_return_items', 'unit_price')) {
                    $table->decimal('unit_price', 15, 2)->default(0)->after('quantity');
                }
                if (!Schema::hasColumn('sale_return_items', 'total_amount')) {
                    $table->decimal('total_amount', 15, 2)->default(0)->after('unit_price');
                }
                if (!Schema::hasColumn('sale_return_items', 'weight')) {
                    $table->decimal('weight', 10, 3)->default(0)->after('quantity');
                }
                if (!Schema::hasColumn('sale_return_items', 'amount')) {
                    $table->decimal('amount', 15, 2)->default(0)->after('weight');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
