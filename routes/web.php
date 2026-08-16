<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

use App\Http\Controllers\DashboardController;

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('branches', App\Http\Controllers\BranchController::class);
    Route::resource('users', App\Http\Controllers\Users\UserController::class);

    // Contacts
    Route::resource('customers', App\Http\Controllers\Contacts\CustomerController::class);
    Route::resource('suppliers', App\Http\Controllers\Contacts\SupplierController::class);
    Route::resource('artisans', App\Http\Controllers\Contacts\ArtisanController::class);
    Route::resource('mortgage-customers', App\Http\Controllers\Contacts\MortgageCustomerController::class);

    // Custom Jewelry Orders & Artisan Payments
    Route::get('orders/assignments', [App\Http\Controllers\Orders\OrderAssignmentController::class, 'index'])->name('orders.assignments');
    Route::post('orders/assignments', [App\Http\Controllers\Orders\OrderAssignmentController::class, 'store'])->name('orders.assignments.store');
    Route::patch('orders/assignments/{assignment}/status', [App\Http\Controllers\Orders\OrderAssignmentController::class, 'updateStatus'])->name('orders.assignments.update-status');
    Route::patch('orders/{order}/status', [App\Http\Controllers\Orders\OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('orders/{order}/payments', [App\Http\Controllers\Orders\OrderController::class, 'recordPayment'])->name('orders.record-payment');
    Route::resource('orders', App\Http\Controllers\Orders\OrderController::class);
    Route::resource('artisan-payments', App\Http\Controllers\Orders\ArtisanPaymentController::class)->only(['index', 'store', 'destroy']);

    // Mortgages
    Route::get('mortgages/details', [App\Http\Controllers\MortgageController::class, 'details'])->name('mortgages.details');
    Route::patch('mortgages/{mortgage}/status', [App\Http\Controllers\MortgageController::class, 'updateStatus'])->name('mortgages.update-status');
    Route::post('mortgages/{mortgage}/payments', [App\Http\Controllers\MortgagePaymentController::class, 'store'])->name('mortgages.payments.store');
    Route::delete('mortgages/{mortgage}/payments/{payment}', [App\Http\Controllers\MortgagePaymentController::class, 'destroy'])->name('mortgages.payments.destroy');
    Route::resource('mortgages', App\Http\Controllers\MortgageController::class);

    // Production Workflow (Monitor jewelry production workflow)
    Route::prefix('production')->name('production.')->group(function () {
        Route::get('/', [App\Http\Controllers\Production\ProductionController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Production\ProductionController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Production\ProductionController::class, 'store'])->name('store');
        Route::get('/status', [App\Http\Controllers\Production\ProductionController::class, 'status'])->name('status');
        Route::get('/{production}', [App\Http\Controllers\Production\ProductionController::class, 'show'])->name('show');
        Route::patch('/{production}/status', [App\Http\Controllers\Production\ProductionController::class, 'updateStatus'])->name('update-status');
    });

    // Inventory
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('opening', [App\Http\Controllers\Inventory\OpeningStockController::class, 'index'])->name('opening.index');
        Route::post('opening', [App\Http\Controllers\Inventory\OpeningStockController::class, 'store'])->name('opening.store');
        Route::put('opening/{openingStock}', [App\Http\Controllers\Inventory\OpeningStockController::class, 'update'])->name('opening.update');
        Route::delete('opening/{openingStock}', [App\Http\Controllers\Inventory\OpeningStockController::class, 'destroy'])->name('opening.destroy');
        Route::get('artisan', [App\Http\Controllers\Inventory\ArtisanStockController::class, 'index'])->name('artisan.index');
        Route::post('artisan', [App\Http\Controllers\Inventory\ArtisanStockController::class, 'store'])->name('artisan.store');
        Route::get('adjustments', [App\Http\Controllers\Inventory\StockAdjustmentController::class, 'index'])->name('adjustments.index');
        Route::post('adjustments', [App\Http\Controllers\Inventory\StockAdjustmentController::class, 'store'])->name('adjustments.store');
        Route::delete('adjustments/{adjustment}', [App\Http\Controllers\Inventory\StockAdjustmentController::class, 'destroy'])->name('adjustments.destroy');
    });

    // Products Print Labels
    Route::get('products/print-labels', [App\Http\Controllers\Product\ProductController::class, 'printLabelsIndex'])->name('products.print-labels');
    Route::get('products/print-labels/search', [App\Http\Controllers\Product\ProductController::class, 'searchForLabels'])->name('products.print-labels.search');
    Route::get('products/print-labels/preview', [App\Http\Controllers\Product\ProductController::class, 'printLabelsPreview'])->name('products.print-labels.preview');
    Route::get('products/{product}/print-label', [App\Http\Controllers\Product\ProductController::class, 'printLabel'])->name('products.print-label');
    
    // Products CRUD
    Route::resource('products', App\Http\Controllers\Product\ProductController::class);
    Route::resource('product-categories', App\Http\Controllers\Product\ProductCategoryController::class);

    // HRM
    Route::group(['prefix' => 'hrm', 'as' => 'hrm.'], function () {
        Route::resource('staff', App\Http\Controllers\HRM\StaffController::class);
        Route::resource('attendance', App\Http\Controllers\HRM\AttendanceController::class);
        Route::resource('payroll', App\Http\Controllers\HRM\PayrollController::class);
        Route::resource('salary', App\Http\Controllers\HRM\SalaryPaymentController::class);
    });

    // Accounts
    Route::group(['prefix' => 'accounts', 'as' => 'accounts.'], function () {
        Route::resource('chart-of-accounts', App\Http\Controllers\Accounts\ChartOfAccountController::class);
        Route::resource('contra', App\Http\Controllers\Accounts\ContraEntryController::class);
        Route::resource('other-incomes', App\Http\Controllers\Accounts\OtherIncomeController::class);
        Route::resource('other-expenses', App\Http\Controllers\Accounts\OtherExpenseController::class);
        Route::patch('cheques/{cheque}/status', [App\Http\Controllers\Accounts\ChequeController::class, 'updateStatus'])->name('cheques.update-status');
        Route::resource('cheques', App\Http\Controllers\Accounts\ChequeController::class);
    });

    // Purchases
    Route::group(['prefix' => 'purchases', 'as' => 'purchases.'], function () {
        Route::get('/', [App\Http\Controllers\PurchaseController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\PurchaseController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\PurchaseController::class, 'store'])->name('store');
        Route::get('/returns/list', [App\Http\Controllers\PurchaseController::class, 'returns'])->name('returns');
        Route::post('/returns', [App\Http\Controllers\PurchaseController::class, 'storeReturn'])->name('store-return');
        Route::get('/payments/list', [App\Http\Controllers\PurchaseController::class, 'payments'])->name('payments');
        Route::post('/payments', [App\Http\Controllers\PurchaseController::class, 'storePayment'])->name('store-payment');
        Route::get('/{purchase}', [App\Http\Controllers\PurchaseController::class, 'show'])->name('show');
        Route::get('/{purchase}/edit', [App\Http\Controllers\PurchaseController::class, 'edit'])->name('edit');
        Route::put('/{purchase}', [App\Http\Controllers\PurchaseController::class, 'update'])->name('update');
        Route::delete('/{purchase}', [App\Http\Controllers\PurchaseController::class, 'destroy'])->name('destroy');
    });

    // Sales & Sales Returns / Payments
    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('wholesale', [App\Http\Controllers\Sales\SaleController::class, 'wholesale'])->name('wholesale');
        Route::get('wholesale/create', [App\Http\Controllers\Sales\SaleController::class, 'wholesaleCreate'])->name('wholesale.create');
        Route::post('wholesale', [App\Http\Controllers\Sales\SaleController::class, 'wholesaleStore'])->name('wholesale.store');
        Route::get('returns', [App\Http\Controllers\Sales\SaleReturnController::class, 'index'])->name('returns.index');
        Route::post('returns', [App\Http\Controllers\Sales\SaleReturnController::class, 'store'])->name('returns.store');
        Route::delete('returns/{return}', [App\Http\Controllers\Sales\SaleReturnController::class, 'destroy'])->name('returns.destroy');
        Route::get('payments', [App\Http\Controllers\Sales\SalePaymentController::class, 'index'])->name('payments.index');
        Route::post('payments', [App\Http\Controllers\Sales\SalePaymentController::class, 'store'])->name('payments.store');
        Route::delete('payments/{payment}', [App\Http\Controllers\Sales\SalePaymentController::class, 'destroy'])->name('payments.destroy');
    });
    Route::resource('sales', App\Http\Controllers\Sales\SaleController::class);

    // Business & Financial Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('accounts', [App\Http\Controllers\Report\ReportController::class, 'accountsReport'])->name('accounts');
        Route::get('sales', [App\Http\Controllers\Report\ReportController::class, 'salesReport'])->name('sales');
        Route::get('wholesale', [App\Http\Controllers\Report\ReportController::class, 'wholesaleReport'])->name('wholesale');
        Route::get('purchase', [App\Http\Controllers\Report\ReportController::class, 'purchaseReport'])->name('purchase');
        Route::get('customer-orders', [App\Http\Controllers\Report\ReportController::class, 'customerOrdersReport'])->name('customer-orders');
        Route::get('inventory', [App\Http\Controllers\Report\ReportController::class, 'inventoryReport'])->name('inventory');
        Route::get('artisan', [App\Http\Controllers\Report\ReportController::class, 'artisanReport'])->name('artisan');
        Route::get('mortgage', [App\Http\Controllers\Report\ReportController::class, 'mortgageReport'])->name('mortgage');
    });

    // Settings
    Route::group(['prefix' => 'settings', 'as' => 'settings.'], function () {
        Route::get('roles', [App\Http\Controllers\Settings\RolePermissionController::class, 'index'])->name('roles.index');
        Route::post('roles', [App\Http\Controllers\Settings\RolePermissionController::class, 'store'])->name('roles.store');
        Route::put('roles/user/{user}', [App\Http\Controllers\Settings\RolePermissionController::class, 'updateUser'])->name('roles.update-user');
        Route::put('roles/{role}', [App\Http\Controllers\Settings\RolePermissionController::class, 'update'])->name('roles.update');
        Route::delete('roles/{role}', [App\Http\Controllers\Settings\RolePermissionController::class, 'destroy'])->name('roles.destroy');

        Route::resource('metal-prices', App\Http\Controllers\MetalPriceController::class);
        Route::resource('purities', App\Http\Controllers\PurityController::class);

        Route::get('notifications', [App\Http\Controllers\Settings\NotificationSettingController::class, 'index'])->name('notifications.index');
        Route::post('notifications', [App\Http\Controllers\Settings\NotificationSettingController::class, 'update'])->name('notifications.update');

        Route::get('opening-accounts', [App\Http\Controllers\Settings\OpeningAccountController::class, 'index'])->name('opening-accounts.index');
        Route::post('opening-accounts', [App\Http\Controllers\Settings\OpeningAccountController::class, 'update'])->name('opening-accounts.update');
        Route::post('opening-accounts/balances', [App\Http\Controllers\Settings\OpeningAccountController::class, 'storeBalance'])->name('opening-accounts.store-balance');
        Route::delete('opening-accounts/balances/{openingBalance}', [App\Http\Controllers\Settings\OpeningAccountController::class, 'destroyBalance'])->name('opening-accounts.destroy-balance');

        Route::get('account-config', [App\Http\Controllers\Settings\AccountConfigurationController::class, 'index'])->name('account-config.index');
        Route::post('account-config', [App\Http\Controllers\Settings\AccountConfigurationController::class, 'update'])->name('account-config.update');
    });
});

require __DIR__.'/auth.php';
