<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
            $table->string('item_name')->nullable()->after('product_id');
            $table->string('stock_type', 50)->default('readymade')->after('item_name');
            $table->foreignId('category_id')->nullable()->after('stock_type')->constrained('product_categories')->onDelete('set null');
            $table->string('hallmark_no', 100)->nullable()->after('purity_id');
            $table->string('photo')->nullable()->after('hallmark_no');
            $table->decimal('wastage_percentage', 5, 2)->default(0)->after('stone_charge');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['item_name', 'stock_type', 'category_id', 'hallmark_no', 'photo', 'wastage_percentage']);
        });
    }
};
