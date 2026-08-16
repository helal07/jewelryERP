<?php

$migrationsPath = __DIR__ . '/database/migrations/';
$timestamp = time();

$migrations = [
    'notifications' => <<<'EOD'
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
EOD,
    'system_settings' => <<<'EOD'
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('group', 50)->nullable();
            $table->timestamps();
EOD,
    'customers' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->string('phone')->unique();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('nid_number')->nullable();
            $table->string('photo')->nullable();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('due_balance', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
EOD,
    'suppliers' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('due_balance', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
EOD,
    'artisans' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('specialization', 100)->nullable();
            $table->enum('wage_type', ['per_item', 'per_gram', 'fixed', 'commission']);
            $table->decimal('rate', 15, 2)->default(0);
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('due_balance', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
EOD,
    'mortgage_customers' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('nid_number')->nullable();
            $table->string('address')->nullable();
            $table->string('photo')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
EOD,
    'product_categories' => <<<'EOD'
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('product_categories')->onDelete('restrict');
            $table->string('name');
            $table->string('code')->nullable();
            $table->enum('metal_type', ['gold', 'silver', 'platinum', 'diamond', 'mixed']);
            $table->timestamps();
            $table->softDeletes();
EOD,
    'products' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('category_id')->constrained('product_categories')->onDelete('restrict');
            $table->string('sku', 50)->unique();
            $table->string('barcode', 100)->unique()->nullable();
            $table->string('name', 150);
            $table->enum('metal_type', ['gold', 'silver', 'platinum', 'diamond', 'mixed']);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('stone_weight', 10, 3)->default(0);
            $table->decimal('net_weight', 10, 3);
            $table->enum('making_charge_type', ['fixed', 'per_gram', 'percentage']);
            $table->decimal('making_charge_value', 15, 2);
            $table->decimal('stone_charge', 15, 2)->default(0);
            $table->decimal('wastage_percentage', 5, 2)->default(0);
            $table->enum('unit', ['piece', 'gram', 'pair', 'set']);
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
EOD,
    'product_images' => <<<'EOD'
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->string('path');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
EOD,
    'purchases' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('restrict');
            $table->string('invoice_no', 30)->unique();
            $table->date('purchase_date');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('other_charges', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['branch_id', 'status']);
EOD,
    'purchase_items' => <<<'EOD'
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->string('description')->nullable();
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('stone_weight', 10, 3)->default(0);
            $table->decimal('net_weight', 10, 3);
            $table->decimal('rate_per_gram', 15, 2);
            $table->decimal('making_charge', 15, 2)->default(0);
            $table->decimal('stone_charge', 15, 2)->default(0);
            $table->integer('quantity');
            $table->decimal('total_amount', 15, 2);
            $table->timestamps();
EOD,
    'purchase_returns' => <<<'EOD'
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('return_no')->unique();
            $table->date('return_date');
            $table->text('reason')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'purchase_return_items' => <<<'EOD'
            $table->id();
            $table->foreignId('purchase_return_id')->constrained('purchase_returns')->onDelete('cascade');
            $table->foreignId('purchase_item_id')->constrained('purchase_items')->onDelete('restrict');
            $table->integer('quantity');
            $table->decimal('weight', 10, 3);
            $table->decimal('amount', 15, 2);
            $table->timestamps();
EOD,
    'purchase_payments' => <<<'EOD'
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('payment_no')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_method', ['cash', 'bank', 'cheque', 'mobile_banking']);
            $table->string('reference_no')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'sales' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->string('invoice_no')->unique();
            $table->date('sale_date');
            $table->enum('sale_type', ['retail', 'wholesale']);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('old_gold_exchange_value', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['branch_id', 'status']);
EOD,
    'sale_items' => <<<'EOD'
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('stone_weight', 10, 3)->default(0);
            $table->decimal('net_weight', 10, 3);
            $table->decimal('rate_per_gram', 15, 2);
            $table->decimal('making_charge', 15, 2)->default(0);
            $table->decimal('stone_charge', 15, 2)->default(0);
            $table->integer('quantity');
            $table->decimal('total_amount', 15, 2);
            $table->timestamps();
EOD,
    'sale_returns' => <<<'EOD'
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('return_no')->unique();
            $table->date('return_date');
            $table->text('reason')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'sale_return_items' => <<<'EOD'
            $table->id();
            $table->foreignId('sale_return_id')->constrained('sale_returns')->onDelete('cascade');
            $table->foreignId('sale_item_id')->constrained('sale_items')->onDelete('restrict');
            $table->integer('quantity');
            $table->decimal('weight', 10, 3);
            $table->decimal('amount', 15, 2);
            $table->timestamps();
EOD,
    'sale_payments' => <<<'EOD'
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('payment_no')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_method', ['cash', 'bank', 'cheque', 'mobile_banking']);
            $table->string('reference_no')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'orders' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->string('order_no')->unique();
            $table->date('order_date');
            $table->date('delivery_date')->nullable();
            $table->text('product_description');
            $table->string('reference_image')->nullable();
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('estimated_weight', 10, 3);
            $table->decimal('estimated_amount', 15, 2);
            $table->decimal('advance_amount', 15, 2)->default(0);
            $table->decimal('due_amount', 15, 2)->default(0);
            $table->enum('status', ['new', 'assigned', 'in_production', 'ready', 'delivered', 'cancelled'])->default('new');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['branch_id', 'status']);
EOD,
    'order_assignments' => <<<'EOD'
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('restrict');
            $table->foreignId('artisan_id')->constrained('artisans')->onDelete('restrict');
            $table->date('assigned_date');
            $table->date('expected_completion_date')->nullable();
            $table->text('instructions')->nullable();
            $table->enum('status', ['assigned', 'in_progress', 'completed', 'rejected'])->default('assigned');
            $table->timestamps();
EOD,
    'productions' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('production_no')->unique();
            $table->foreignId('artisan_id')->constrained('artisans')->onDelete('restrict');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('restrict');
            $table->foreignId('product_category_id')->nullable()->constrained('product_categories')->onDelete('restrict');
            $table->date('start_date');
            $table->date('expected_end_date')->nullable();
            $table->date('actual_end_date')->nullable();
            $table->decimal('raw_metal_issued_weight', 10, 3)->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['branch_id', 'status']);
EOD,
    'artisan_payments' => <<<'EOD'
            $table->id();
            $table->foreignId('artisan_id')->constrained('artisans')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('restrict');
            $table->foreignId('production_id')->nullable()->constrained('productions')->onDelete('restrict');
            $table->string('payment_no')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'production_items' => <<<'EOD'
            $table->id();
            $table->foreignId('production_id')->constrained('productions')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('restrict');
            $table->string('item_name')->nullable();
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('issued_weight', 10, 3)->default(0);
            $table->decimal('returned_weight', 10, 3)->default(0);
            $table->decimal('finished_weight', 10, 3)->default(0);
            $table->decimal('wastage_weight', 10, 3)->default(0);
            $table->integer('quantity')->default(1);
            $table->string('status', 50)->nullable();
            $table->timestamps();
EOD,
    'mortgages' => <<<'EOD'
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
EOD,
    'mortgage_items' => <<<'EOD'
            $table->id();
            $table->foreignId('mortgage_id')->constrained('mortgages')->onDelete('cascade');
            $table->string('item_name');
            $table->string('metal_type', 30);
            $table->foreignId('purity_id')->constrained('purities')->onDelete('restrict');
            $table->decimal('gross_weight', 10, 3);
            $table->decimal('net_weight', 10, 3);
            $table->decimal('estimated_value', 15, 2);
            $table->integer('quantity');
            $table->string('image')->nullable();
            $table->timestamps();
EOD,
    'mortgage_payments' => <<<'EOD'
            $table->id();
            $table->foreignId('mortgage_id')->constrained('mortgages')->onDelete('restrict');
            $table->string('payment_no')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_type', ['interest', 'principal', 'redemption']);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'stock_ledger' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->enum('transaction_type', ['opening', 'purchase', 'sale', 'sale_return', 'purchase_return', 'production_in', 'production_out', 'artisan_issue', 'artisan_return', 'adjustment']);
            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->integer('quantity_in')->default(0);
            $table->integer('quantity_out')->default(0);
            $table->decimal('weight_in', 10, 3)->default(0);
            $table->decimal('weight_out', 10, 3)->default(0);
            $table->integer('balance_quantity')->default(0);
            $table->decimal('balance_weight', 10, 3)->default(0);
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('created_at');
EOD,
    'stock_adjustments' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('adjustment_no')->unique();
            $table->date('adjustment_date');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->integer('quantity_change');
            $table->decimal('weight_change', 10, 3);
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'artisan_stock' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('artisan_id')->constrained('artisans')->onDelete('restrict');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('restrict');
            $table->string('metal_type', 30)->nullable();
            $table->foreignId('purity_id')->nullable()->constrained('purities')->onDelete('restrict');
            $table->decimal('weight_issued', 10, 3)->default(0);
            $table->decimal('weight_returned', 10, 3)->default(0);
            $table->decimal('balance_weight', 10, 3)->default(0);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
EOD,
    'staff' => <<<'EOD'
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
EOD,
    'attendances' => <<<'EOD'
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->date('attendance_date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->enum('status', ['present', 'absent', 'half_day', 'leave', 'holiday']);
            $table->string('remarks')->nullable();
            $table->timestamps();
            
            $table->unique(['staff_id', 'attendance_date']);
EOD,
    'payrolls' => <<<'EOD'
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->tinyInteger('month');
            $table->smallInteger('year');
            $table->decimal('basic_salary', 15, 2);
            $table->decimal('allowances', 15, 2)->default(0);
            $table->decimal('deductions', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2);
            $table->enum('status', ['draft', 'approved', 'paid'])->default('draft');
            $table->timestamps();
            
            $table->unique(['staff_id', 'month', 'year']);
EOD,
    'salary_payments' => <<<'EOD'
            $table->id();
            $table->foreignId('payroll_id')->constrained('payrolls')->onDelete('restrict');
            $table->foreignId('staff_id')->constrained('staff')->onDelete('restrict');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->string('payment_no')->unique();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'chart_of_accounts' => <<<'EOD'
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('chart_of_accounts')->onDelete('restrict');
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->enum('account_type', ['asset', 'liability', 'equity', 'income', 'expense']);
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
EOD,
    'account_transactions' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->date('transaction_date');
            $table->enum('type', ['debit', 'credit']);
            $table->decimal('amount', 15, 2);
            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('created_at')->useCurrent();
EOD,
    'contra_entries' => <<<'EOD'
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
EOD,
    'other_incomes' => <<<'EOD'
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('restrict');
            $table->foreignId('account_id')->constrained('chart_of_accounts')->onDelete('restrict');
            $table->string('income_no')->unique();
            $table->date('income_date');
            $table->string('category', 100)->nullable();
            $table->decimal('amount', 15, 2);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
EOD,
    'other_expenses' => <<<'EOD'
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
EOD,
    'cheques' => <<<'EOD'
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
EOD,
];

$index = 1;
foreach ($migrations as $tableName => $schema) {
    $fileName = date('Y_m_d_His', $timestamp + $index) . '_create_' . $tableName . '_table.php';
    $className = 'Create' . str_replace(' ', '', ucwords(str_replace('_', ' ', $tableName))) . 'Table';
    
    $content = <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('{$tableName}', function (Blueprint \$table) {
{$schema}
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('{$tableName}');
    }
};
PHP;

    file_put_contents($migrationsPath . $fileName, $content);
    echo "Created: " . $fileName . "\n";
    $index++;
}

echo "Done.\n";
