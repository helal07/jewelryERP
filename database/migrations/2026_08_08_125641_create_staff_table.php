<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->string('employee_code')->unique();
            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('department')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('nid_number')->nullable();
            $table->date('joining_date')->nullable();
            $table->enum('salary_type', ['fixed', 'commission']);
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'resigned'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};