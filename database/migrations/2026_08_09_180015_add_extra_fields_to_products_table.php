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
        Schema::table('products', function (Blueprint $table) {
            $table->string('stock_type')->nullable()->after('branch_id');
            $table->date('date')->nullable()->after('stock_type');
            $table->decimal('rate_per_vori', 15, 2)->nullable()->after('purity_id');
            $table->foreignId('supplier_id')->nullable()->after('category_id')->constrained('suppliers')->nullOnDelete();
            $table->decimal('vat_percentage', 5, 2)->default(0)->after('making_charge_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn(['stock_type', 'date', 'rate_per_vori', 'supplier_id', 'vat_percentage']);
        });
    }
};
