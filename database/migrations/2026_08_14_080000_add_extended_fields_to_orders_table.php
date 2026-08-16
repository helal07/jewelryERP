<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->after('customer_id')->constrained('products')->nullOnDelete();
            $table->string('product_name')->nullable()->after('product_description');
            $table->string('category')->nullable()->after('product_name');
            $table->decimal('rate_per_vori', 15, 2)->nullable()->after('purity_id');
            $table->decimal('vori', 8, 2)->default(0)->after('rate_per_vori');
            $table->decimal('ana', 8, 2)->default(0)->after('vori');
            $table->decimal('roti', 8, 2)->default(0)->after('ana');
            $table->decimal('point', 8, 2)->default(0)->after('roti');
            $table->decimal('making_charge', 15, 2)->default(0)->after('estimated_weight');
            $table->decimal('vat_amount', 15, 2)->default(0)->after('making_charge');
            $table->decimal('hallmark_charge', 15, 2)->default(0)->after('vat_amount');
            $table->decimal('stone_charge', 15, 2)->default(0)->after('hallmark_charge');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn([
                'product_id',
                'product_name',
                'category',
                'rate_per_vori',
                'vori',
                'ana',
                'roti',
                'point',
                'making_charge',
                'vat_amount',
                'hallmark_charge',
                'stone_charge',
            ]);
        });
    }
};
