<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('other_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->string('expense_no')->unique();
            $table->date('expense_date');
            $table->string('category', 100)->nullable();
            $table->decimal('amount', 15, 2);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('other_expenses');
    }
};