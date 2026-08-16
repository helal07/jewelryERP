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
        if (Schema::hasTable('sale_returns')) {
            Schema::table('sale_returns', function (Blueprint $table) {
                if (!Schema::hasColumn('sale_returns', 'customer_id')) {
                    $table->foreignId('customer_id')->nullable()->after('sale_id')->constrained('customers')->onDelete('cascade');
                }
                if (!Schema::hasColumn('sale_returns', 'subtotal')) {
                    $table->decimal('subtotal', 15, 2)->default(0)->after('return_date');
                }
                if (!Schema::hasColumn('sale_returns', 'tax')) {
                    $table->decimal('tax', 15, 2)->default(0)->after('subtotal');
                }
                if (!Schema::hasColumn('sale_returns', 'total_amount')) {
                    $table->decimal('total_amount', 15, 2)->default(0)->after('tax');
                }
                if (!Schema::hasColumn('sale_returns', 'refund_amount')) {
                    $table->decimal('refund_amount', 15, 2)->default(0)->after('total_amount');
                }
                if (!Schema::hasColumn('sale_returns', 'status')) {
                    $table->string('status')->default('completed')->after('reason');
                }
            });
        }

        if (Schema::hasTable('sale_payments')) {
            Schema::table('sale_payments', function (Blueprint $table) {
                if (!Schema::hasColumn('sale_payments', 'customer_id')) {
                    $table->foreignId('customer_id')->nullable()->after('sale_id')->constrained('customers')->onDelete('cascade');
                }
                if (!Schema::hasColumn('sale_payments', 'branch_id')) {
                    $table->foreignId('branch_id')->nullable()->after('customer_id')->constrained('branches')->onDelete('set null');
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
