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
        Schema::table('suppliers', function (Blueprint $table) {
            $table->decimal('credit_limit', 15, 2)->default(0)->after('due_balance');
            $table->string('nid_number')->nullable()->after('credit_limit');
            $table->string('photo')->nullable()->after('nid_number');
            $table->string('attachment')->nullable()->after('photo');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn([
                'credit_limit',
                'nid_number',
                'photo',
                'attachment',
                'created_by'
            ]);
        });
    }
};
