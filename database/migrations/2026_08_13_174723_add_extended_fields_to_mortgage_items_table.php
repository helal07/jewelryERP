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
        Schema::table('mortgage_items', function (Blueprint $table) {
            $table->string('stock_type')->nullable()->after('mortgage_id');
            $table->foreignId('category_id')->nullable()->after('stock_type')->constrained('product_categories')->nullOnDelete();
            $table->foreignId('product_id')->nullable()->after('category_id')->constrained('products')->nullOnDelete();
            
            $table->decimal('rate_per_vori', 15, 2)->nullable()->after('metal_type');
            $table->decimal('rate_per_gram', 15, 2)->nullable()->after('rate_per_vori');
            
            $table->string('weight_unit')->default('traditional')->after('purity_id');
            $table->integer('vori')->default(0)->after('weight_unit');
            $table->integer('ana')->default(0)->after('vori');
            $table->integer('roti')->default(0)->after('ana');
            $table->decimal('point', 8, 2)->default(0)->after('roti');
            $table->decimal('stone_weight', 10, 3)->default(0)->after('gross_weight');
        });
    }

    public function down(): void
    {
        Schema::table('mortgage_items', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['product_id']);
            $table->dropColumn([
                'stock_type', 'category_id', 'product_id', 
                'rate_per_vori', 'rate_per_gram',
                'weight_unit', 'vori', 'ana', 'roti', 'point', 'stone_weight'
            ]);
        });
    }
};
