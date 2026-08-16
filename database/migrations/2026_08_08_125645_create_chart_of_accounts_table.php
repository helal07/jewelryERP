<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('chart_of_accounts')->onDelete('restrict');
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->enum('account_type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};