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
        Schema::table('sales', function (Blueprint $table) {
            $table->enum('vat_type', ['percent', 'fixed_per_vori'])->default('percent')->after('subtotal');
            $table->decimal('vat_rate', 15, 2)->default(0)->after('vat_type');
            $table->decimal('total_stone_charge', 15, 2)->default(0)->after('vat_rate');
            $table->decimal('total_making_charge', 15, 2)->default(0)->after('total_stone_charge');
            $table->decimal('total_hallmark_charge', 15, 2)->default(0)->after('total_making_charge');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->enum('making_charge_type', ['fixed', 'per_gram'])->default('fixed')->after('making_charge');
            $table->decimal('hallmark_charge', 15, 2)->default(0)->after('stone_charge');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_tables', function (Blueprint $table) {
            //
        });
    }
};
