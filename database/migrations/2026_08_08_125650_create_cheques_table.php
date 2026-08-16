<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('cheque_no', 50);
            $table->string('bank_name')->nullable();
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->enum('direction', ['issued', 'received']);
            $table->string('party_type', 50)->nullable();
            $table->unsignedBigInteger('party_id')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending', 'cleared', 'bounced', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheques');
    }
};