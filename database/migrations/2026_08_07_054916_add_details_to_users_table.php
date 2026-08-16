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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->constrained('branches')->onDelete('restrict');
            $table->string('phone')->nullable()->unique()->after('email');
            $table->string('avatar')->nullable()->after('password');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('avatar');
            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropUnique(['phone']);
            $table->dropColumn(['branch_id', 'phone', 'avatar', 'status', 'last_login_at', 'deleted_at']);
        });
    }
};
