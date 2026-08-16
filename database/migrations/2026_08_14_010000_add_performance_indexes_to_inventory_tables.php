<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Stock Ledger indexes
        if (Schema::hasTable('stock_ledger')) {
            Schema::table('stock_ledger', function (Blueprint $table) {
                $table->index('transaction_type', 'idx_stock_ledger_type');
                $table->index('created_at', 'idx_stock_ledger_created');
                $table->index(['transaction_type', 'branch_id'], 'idx_stock_ledger_type_branch');
                $table->index(['reference_type', 'reference_id'], 'idx_stock_ledger_ref');
            });
        }

        // 2. Artisan Stock indexes
        if (Schema::hasTable('artisan_stock')) {
            Schema::table('artisan_stock', function (Blueprint $table) {
                $table->index('artisan_id', 'idx_artisan_stock_artisan');
                $table->index('branch_id', 'idx_artisan_stock_branch');
                $table->index('metal_type', 'idx_artisan_stock_metal');
                $table->index(['artisan_id', 'metal_type'], 'idx_artisan_stock_lookup');
                $table->index('created_at', 'idx_artisan_stock_created');
            });
        }

        // 3. Stock Adjustments indexes
        if (Schema::hasTable('stock_adjustments')) {
            Schema::table('stock_adjustments', function (Blueprint $table) {
                $table->index('adjustment_no', 'idx_adjustments_no');
                $table->index('adjustment_date', 'idx_adjustments_date');
                $table->index(['branch_id', 'product_id'], 'idx_adjustments_branch_prod');
            });
        }

        // 4. Artisans indexes
        if (Schema::hasTable('artisans')) {
            Schema::table('artisans', function (Blueprint $table) {
                $table->index('name', 'idx_artisans_name');
                $table->index('code', 'idx_artisans_code');
                $table->index('phone', 'idx_artisans_phone');
                $table->index('status', 'idx_artisans_status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('stock_ledger')) {
            Schema::table('stock_ledger', function (Blueprint $table) {
                $table->dropIndex('idx_stock_ledger_type');
                $table->dropIndex('idx_stock_ledger_created');
                $table->dropIndex('idx_stock_ledger_type_branch');
                $table->dropIndex('idx_stock_ledger_ref');
            });
        }

        if (Schema::hasTable('artisan_stock')) {
            Schema::table('artisan_stock', function (Blueprint $table) {
                $table->dropIndex('idx_artisan_stock_artisan');
                $table->dropIndex('idx_artisan_stock_branch');
                $table->dropIndex('idx_artisan_stock_metal');
                $table->dropIndex('idx_artisan_stock_lookup');
                $table->dropIndex('idx_artisan_stock_created');
            });
        }

        if (Schema::hasTable('stock_adjustments')) {
            Schema::table('stock_adjustments', function (Blueprint $table) {
                $table->dropIndex('idx_adjustments_no');
                $table->dropIndex('idx_adjustments_date');
                $table->dropIndex('idx_adjustments_branch_prod');
            });
        }

        if (Schema::hasTable('artisans')) {
            Schema::table('artisans', function (Blueprint $table) {
                $table->dropIndex('idx_artisans_name');
                $table->dropIndex('idx_artisans_code');
                $table->dropIndex('idx_artisans_phone');
                $table->dropIndex('idx_artisans_status');
            });
        }
    }
};
