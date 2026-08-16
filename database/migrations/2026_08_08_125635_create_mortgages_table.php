<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mortgages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('mortgage_customer_id')->constrained('mortgage_customers')->onDelete('restrict');
            $table->string('mortgage_no')->unique();
            $table->date('mortgage_date');
            $table->date('due_date')->nullable();
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->enum('interest_type', ['flat', 'monthly']);
            $table->enum('status', ['active', 'redeemed', 'overdue', 'forfeited'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['branch_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mortgages');
    }
};