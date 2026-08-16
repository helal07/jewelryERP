<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Purchases table indexes
        if (Schema::hasTable('purchases')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->index('invoice_no', 'idx_purchases_invoice_no');
                $table->index('purchase_date', 'idx_purchases_date');
                $table->index('status', 'idx_purchases_status');
                $table->index(['supplier_id', 'branch_id'], 'idx_purchases_supplier_branch');
            });
        }

        // 2. Purchase items table indexes
        if (Schema::hasTable('purchase_items')) {
            Schema::table('purchase_items', function (Blueprint $table) {
                $table->index('purchase_id', 'idx_purchase_items_purchase_id');
                $table->index('product_id', 'idx_purchase_items_product_id');
            });
        }

        // 3. Sales table indexes
        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->index('invoice_no', 'idx_sales_invoice_no');
                $table->index('sale_date', 'idx_sales_date');
                $table->index('status', 'idx_sales_status');
                $table->index(['customer_id', 'branch_id'], 'idx_sales_customer_branch');
            });
        }

        // 4. Sale items table indexes
        if (Schema::hasTable('sale_items')) {
            Schema::table('sale_items', function (Blueprint $table) {
                $table->index('sale_id', 'idx_sale_items_sale_id');
                $table->index('product_id', 'idx_sale_items_product_id');
            });
        }

        // 5. Products table indexes
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                $table->index('sku', 'idx_products_sku');
                $table->index('name', 'idx_products_name');
                $table->index('status', 'idx_products_status');
                $table->index(['category_id', 'purity_id'], 'idx_products_cat_purity');
            });
        }

        // 6. Suppliers table indexes
        if (Schema::hasTable('suppliers')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->index('name', 'idx_suppliers_name');
                $table->index('phone', 'idx_suppliers_phone');
                $table->index('status', 'idx_suppliers_status');
            });
        }

        // 7. Customers table indexes
        if (Schema::hasTable('customers')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->index('name', 'idx_customers_name');
                $table->index('phone', 'idx_customers_phone');
                $table->index('status', 'idx_customers_status');
            });
        }

        // 8. Metal Prices table indexes
        if (Schema::hasTable('metal_prices')) {
            Schema::table('metal_prices', function (Blueprint $table) {
                $table->index(['metal_type', 'purity_id', 'effective_date'], 'idx_metal_prices_lookup');
            });
        }

        // 9. Stock Ledger table indexes
        if (Schema::hasTable('stock_ledger')) {
            Schema::table('stock_ledger', function (Blueprint $table) {
                $table->index(['product_id', 'branch_id'], 'idx_stock_ledger_prod_branch');
            });
        }

        // 10. Account Transactions table indexes
        if (Schema::hasTable('account_transactions')) {
            Schema::table('account_transactions', function (Blueprint $table) {
                $table->index('transaction_date', 'idx_transactions_date');
                $table->index('account_id', 'idx_transactions_account');
            });
        }
    }

    public function down(): void
    {
        // Drop added indexes
        if (Schema::hasTable('purchases')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->dropIndex('idx_purchases_invoice_no');
                $table->dropIndex('idx_purchases_date');
                $table->dropIndex('idx_purchases_status');
                $table->dropIndex('idx_purchases_supplier_branch');
            });
        }

        if (Schema::hasTable('purchase_items')) {
            Schema::table('purchase_items', function (Blueprint $table) {
                $table->dropIndex('idx_purchase_items_purchase_id');
                $table->dropIndex('idx_purchase_items_product_id');
            });
        }

        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->dropIndex('idx_sales_invoice_no');
                $table->dropIndex('idx_sales_date');
                $table->dropIndex('idx_sales_status');
                $table->dropIndex('idx_sales_customer_branch');
            });
        }

        if (Schema::hasTable('sale_items')) {
            Schema::table('sale_items', function (Blueprint $table) {
                $table->dropIndex('idx_sale_items_sale_id');
                $table->dropIndex('idx_sale_items_product_id');
            });
        }

        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropIndex('idx_products_sku');
                $table->dropIndex('idx_products_name');
                $table->dropIndex('idx_products_status');
                $table->dropIndex('idx_products_cat_purity');
            });
        }

        if (Schema::hasTable('suppliers')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->dropIndex('idx_suppliers_name');
                $table->dropIndex('idx_suppliers_phone');
                $table->dropIndex('idx_suppliers_status');
            });
        }

        if (Schema::hasTable('customers')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropIndex('idx_customers_name');
                $table->dropIndex('idx_customers_phone');
                $table->dropIndex('idx_customers_status');
            });
        }

        if (Schema::hasTable('metal_prices')) {
            Schema::table('metal_prices', function (Blueprint $table) {
                $table->dropIndex('idx_metal_prices_lookup');
            });
        }

        if (Schema::hasTable('stock_ledger')) {
            Schema::table('stock_ledger', function (Blueprint $table) {
                $table->dropIndex('idx_stock_ledger_prod_branch');
            });
        }

        if (Schema::hasTable('account_transactions')) {
            Schema::table('account_transactions', function (Blueprint $table) {
                $table->dropIndex('idx_transactions_date');
                $table->dropIndex('idx_transactions_account');
            });
        }
    }
};
