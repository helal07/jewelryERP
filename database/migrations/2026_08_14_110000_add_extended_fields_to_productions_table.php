<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productions', function (Blueprint $table) {
            $table->date('order_date')->nullable()->after('start_date');
            $table->date('delivery_date')->nullable()->after('expected_end_date');
            $table->string('stock_type')->default('ready_stock')->after('status');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null')->after('product_category_id');
            $table->string('metal_type')->default('gold')->after('product_id');
            $table->foreignId('purity_id')->nullable()->constrained('purities')->onDelete('set null')->after('metal_type');
            $table->decimal('vori', 10, 2)->default(0)->after('raw_metal_issued_weight');
            $table->decimal('ana', 10, 2)->default(0)->after('vori');
            $table->decimal('roti', 10, 2)->default(0)->after('ana');
            $table->decimal('point', 10, 2)->default(0)->after('roti');
            $table->decimal('weight_gm', 10, 3)->default(0)->after('point');
            $table->decimal('artisan_charge', 12, 2)->default(0)->after('weight_gm');
            $table->decimal('wastage_percentage', 8, 2)->default(0)->after('artisan_charge');
            $table->decimal('paid_amount', 12, 2)->default(0)->after('wastage_percentage');
            $table->decimal('due_amount', 12, 2)->default(0)->after('paid_amount');
        });
    }

    public function down(): void
    {
        Schema::table('productions', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['purity_id']);
            $table->dropColumn([
                'order_date',
                'delivery_date',
                'stock_type',
                'product_id',
                'metal_type',
                'purity_id',
                'vori',
                'ana',
                'roti',
                'point',
                'weight_gm',
                'artisan_charge',
                'wastage_percentage',
                'paid_amount',
                'due_amount',
            ]);
        });
    }
};
