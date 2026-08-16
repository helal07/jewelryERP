<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mortgages indexes
        if (Schema::hasTable('mortgages')) {
            Schema::table('mortgages', function (Blueprint $table) {
                $table->index('mortgage_no', 'idx_mortgages_no');
                $table->index('status', 'idx_mortgages_status');
                $table->index('mortgage_date', 'idx_mortgages_date');
                $table->index('principal_amount', 'idx_mortgages_amount');
                $table->index(['mortgage_customer_id', 'branch_id'], 'idx_mortgages_cust_branch');
            });
        }

        // 2. Mortgage Customers indexes
        if (Schema::hasTable('mortgage_customers')) {
            Schema::table('mortgage_customers', function (Blueprint $table) {
                $table->index('name', 'idx_m_cust_name');
                $table->index('phone', 'idx_m_cust_phone');
                $table->index('status', 'idx_m_cust_status');
            });
        }

        // 3. Mortgage Items indexes
        if (Schema::hasTable('mortgage_items')) {
            Schema::table('mortgage_items', function (Blueprint $table) {
                $table->index('mortgage_id', 'idx_m_items_mortgage_id');
                $table->index(['category_id', 'product_id'], 'idx_m_items_cat_prod');
            });
        }

        // 4. Mortgage Payments indexes
        if (Schema::hasTable('mortgage_payments')) {
            Schema::table('mortgage_payments', function (Blueprint $table) {
                $table->index('mortgage_id', 'idx_m_payments_mortgage_id');
                $table->index('payment_date', 'idx_m_payments_date');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('mortgages')) {
            Schema::table('mortgages', function (Blueprint $table) {
                $table->dropIndex('idx_mortgages_no');
                $table->dropIndex('idx_mortgages_status');
                $table->dropIndex('idx_mortgages_date');
                $table->dropIndex('idx_mortgages_amount');
                $table->dropIndex('idx_mortgages_cust_branch');
            });
        }

        if (Schema::hasTable('mortgage_customers')) {
            Schema::table('mortgage_customers', function (Blueprint $table) {
                $table->dropIndex('idx_m_cust_name');
                $table->dropIndex('idx_m_cust_phone');
                $table->dropIndex('idx_m_cust_status');
            });
        }

        if (Schema::hasTable('mortgage_items')) {
            Schema::table('mortgage_items', function (Blueprint $table) {
                $table->dropIndex('idx_m_items_mortgage_id');
                $table->dropIndex('idx_m_items_cat_prod');
            });
        }

        if (Schema::hasTable('mortgage_payments')) {
            Schema::table('mortgage_payments', function (Blueprint $table) {
                $table->dropIndex('idx_m_payments_mortgage_id');
                $table->dropIndex('idx_m_payments_date');
            });
        }
    }
};
