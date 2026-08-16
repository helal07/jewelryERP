<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contra_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('entry_no')->unique();
            $table->date('entry_date');
            $table->foreignId('from_account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->foreignId('to_account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->decimal('amount', 15, 2);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contra_entries');
    }
};