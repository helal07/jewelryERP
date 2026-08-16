<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use App\Models\ArtisanStock;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Mortgage;
use App\Models\MortgageCustomer;
use App\Models\MortgagePayment;
use App\Models\Order;
use App\Models\OtherExpense;
use App\Models\OtherIncome;
use App\Models\Product;
use App\Models\Production;
use App\Models\Purity;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * 1. Accounts Report
     */
    public function accountsReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $salesRevenue = Sale::whereBetween('sale_date', [$startDate, $endDate])->sum('grand_total');
        $otherIncome = OtherIncome::whereBetween('income_date', [$startDate, $endDate])->sum('amount');
        $mortgageInterest = MortgagePayment::whereBetween('payment_date', [$startDate, $endDate])->sum('interest_amount');
        $totalIncome = $salesRevenue + $otherIncome + $mortgageInterest;

        $purchasesCost = Purchase::whereBetween('purchase_date', [$startDate, $endDate])->sum('grand_total');
        $otherExpenses = OtherExpense::whereBetween('expense_date', [$startDate, $endDate])->sum('amount');
        $totalExpenses = $purchasesCost + $otherExpenses;

        $netProfit = $totalIncome - $totalExpenses;

        $incomesList = OtherIncome::whereBetween('income_date', [$startDate, $endDate])->orderBy('income_date', 'desc')->get();
        $expensesList = OtherExpense::whereBetween('expense_date', [$startDate, $endDate])->orderBy('expense_date', 'desc')->get();

        return Inertia::render('Reports/Accounts', [
            'summary' => [
                'sales_revenue' => $salesRevenue,
                'other_income' => $otherIncome,
                'mortgage_interest' => $mortgageInterest,
                'total_income' => $totalIncome,
                'purchases_cost' => $purchasesCost,
                'other_expenses' => $otherExpenses,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
            ],
            'incomes' => $incomesList,
            'expenses' => $expensesList,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * 2. Sales Report (Retail)
     */
    public function salesReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $customerId = $request->input('customer_id');

        $query = Sale::with(['customer', 'branch', 'items.product'])
            ->where(function ($q) {
                $q->whereNull('sale_type')->orWhere('sale_type', '!=', 'wholesale');
            })
            ->whereBetween('sale_date', [$startDate, $endDate]);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        $sales = $query->orderBy('sale_date', 'desc')->get();

        $summary = [
            'total_sales' => $sales->count(),
            'total_grand' => $sales->sum('grand_total'),
            'total_paid' => $sales->sum('paid_amount'),
            'total_due' => $sales->sum('due_amount'),
            'total_discount' => $sales->sum('discount'),
            'total_tax' => $sales->sum('tax'),
        ];

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $customers = Customer::orderBy('name')->get();

        return Inertia::render('Reports/Sales', [
            'sales' => $sales,
            'summary' => $summary,
            'branches' => $branches,
            'customers' => $customers,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'customer_id' => $customerId,
            ],
        ]);
    }

    /**
     * 3. Wholesale Report
     */
    public function wholesaleReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $customerId = $request->input('customer_id');

        $query = Sale::with(['customer', 'branch', 'items.product'])
            ->where('sale_type', 'wholesale')
            ->whereBetween('sale_date', [$startDate, $endDate]);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        $sales = $query->orderBy('sale_date', 'desc')->get();

        $summary = [
            'total_sales' => $sales->count(),
            'total_grand' => $sales->sum('grand_total'),
            'total_paid' => $sales->sum('paid_amount'),
            'total_due' => $sales->sum('due_amount'),
            'total_discount' => $sales->sum('discount'),
        ];

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $customers = Customer::orderBy('name')->get();

        return Inertia::render('Reports/Wholesale', [
            'sales' => $sales,
            'summary' => $summary,
            'branches' => $branches,
            'customers' => $customers,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'customer_id' => $customerId,
            ],
        ]);
    }

    /**
     * 4. Purchase Report
     */
    public function purchaseReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $supplierId = $request->input('supplier_id');

        $query = Purchase::with(['supplier', 'branch', 'items.product'])
            ->whereBetween('purchase_date', [$startDate, $endDate]);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($supplierId) {
            $query->where('supplier_id', $supplierId);
        }

        $purchases = $query->orderBy('purchase_date', 'desc')->get();

        $summary = [
            'total_purchases' => $purchases->count(),
            'total_grand' => $purchases->sum('grand_total'),
            'total_paid' => $purchases->sum('paid_amount'),
            'total_due' => $purchases->sum('due_amount'),
        ];

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $suppliers = Supplier::orderBy('name')->get();

        return Inertia::render('Reports/Purchase', [
            'purchases' => $purchases,
            'summary' => $summary,
            'branches' => $branches,
            'suppliers' => $suppliers,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'supplier_id' => $supplierId,
            ],
        ]);
    }

    /**
     * 5. Customer Order Report
     */
    public function customerOrdersReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $customerId = $request->input('customer_id');
        $status = $request->input('status');

        $query = Order::with(['customer', 'branch'])
            ->whereBetween('order_date', [$startDate, $endDate]);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($customerId) {
            $query->where('customer_id', $customerId);
        }
        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('order_date', 'desc')->get();

        $summary = [
            'total_orders' => $orders->count(),
            'total_bill' => $orders->sum('estimated_amount'),
            'total_advance' => $orders->sum('advance_amount'),
            'total_due' => $orders->sum('due_amount'),
            'pending_count' => $orders->whereIn('status', ['pending', 'in_production'])->count(),
            'completed_count' => $orders->where('status', 'completed')->count(),
        ];

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $customers = Customer::orderBy('name')->get();

        return Inertia::render('Reports/CustomerOrders', [
            'orders' => $orders,
            'summary' => $summary,
            'branches' => $branches,
            'customers' => $customers,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'customer_id' => $customerId,
                'status' => $status,
            ],
        ]);
    }

    /**
     * 6. Inventory Report
     */
    public function inventoryReport(Request $request)
    {
        $branchId = $request->input('branch_id');
        $metalType = $request->input('metal_type');
        $purityId = $request->input('purity_id');

        $query = Product::with(['category', 'purity', 'branch'])->where('status', 'active');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($metalType) {
            $query->where('metal_type', $metalType);
        }
        if ($purityId) {
            $query->where('purity_id', $purityId);
        }

        $products = $query->orderBy('name')->get();

        $totalWeightGm = $products->sum('net_weight');
        $totalWeightVori = round($totalWeightGm / 11.664, 3);
        $totalValuation = $products->sum('selling_price');
        $artisanHoldingGm = ArtisanStock::sum('weight');

        $summary = [
            'total_items' => $products->count(),
            'total_weight_gm' => round($totalWeightGm, 3),
            'total_weight_vori' => $totalWeightVori,
            'total_valuation' => $totalValuation,
            'artisan_holding_gm' => round($artisanHoldingGm, 3),
        ];

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $purities = Purity::orderBy('name')->get();

        return Inertia::render('Reports/Inventory', [
            'products' => $products,
            'summary' => $summary,
            'branches' => $branches,
            'purities' => $purities,
            'filters' => [
                'branch_id' => $branchId,
                'metal_type' => $metalType,
                'purity_id' => $purityId,
            ],
        ]);
    }

    /**
     * 7. Artisan Report
     */
    public function artisanReport(Request $request)
    {
        $branchId = $request->input('branch_id');
        $artisanId = $request->input('artisan_id');

        $query = Artisan::with(['branch']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($artisanId) {
            $query->where('id', $artisanId);
        }

        $artisans = $query->orderBy('name')->get();

        // Attach statistics for each artisan
        $artisanData = $artisans->map(function ($artisan) {
            $productions = Production::where('artisan_id', $artisan->id)->get();
            $stockHolding = ArtisanStock::where('artisan_id', $artisan->id)->sum('weight');
            $totalCharges = $productions->sum('artisan_charge');
            $totalPaid = $productions->sum('paid_amount');
            $totalDue = $productions->sum('due_amount');
            $activeJobs = $productions->whereIn('status', ['pending', 'in_progress'])->count();
            $completedJobs = $productions->where('status', 'completed')->count();

            return [
                'id' => $artisan->id,
                'code' => $artisan->code,
                'name' => $artisan->name,
                'phone' => $artisan->phone,
                'specialization' => $artisan->specialization,
                'branch' => $artisan->branch?->name ?? '—',
                'active_jobs' => $activeJobs,
                'completed_jobs' => $completedJobs,
                'holding_weight_gm' => round($stockHolding, 3),
                'total_charges' => $totalCharges,
                'total_paid' => $totalPaid,
                'total_due' => $totalDue,
                'status' => $artisan->status,
            ];
        });

        $summary = [
            'total_artisans' => $artisans->count(),
            'active_jobs_count' => Production::whereIn('status', ['pending', 'in_progress'])->count(),
            'total_holding_gm' => round(ArtisanStock::sum('weight'), 3),
            'total_payable_due' => Production::sum('due_amount'),
        ];

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $artisanList = Artisan::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Reports/Artisan', [
            'artisans' => $artisanData,
            'summary' => $summary,
            'branches' => $branches,
            'artisanList' => $artisanList,
            'filters' => [
                'branch_id' => $branchId,
                'artisan_id' => $artisanId,
            ],
        ]);
    }

    /**
     * 8. Mortgage Report
     */
    public function mortgageReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $status = $request->input('status');

        $query = Mortgage::with(['customer', 'branch', 'items'])
            ->whereBetween('mortgage_date', [$startDate, $endDate]);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($status) {
            $query->where('status', $status);
        }

        $mortgages = $query->orderBy('mortgage_date', 'desc')->get();

        $interestCollected = MortgagePayment::whereBetween('payment_date', [$startDate, $endDate])->sum('interest_amount');
        $principalReleased = MortgagePayment::whereBetween('payment_date', [$startDate, $endDate])->sum('principal_amount');

        $summary = [
            'total_mortgages' => $mortgages->count(),
            'total_principal' => $mortgages->sum('principal_amount'),
            'interest_collected' => $interestCollected,
            'principal_released' => $principalReleased,
            'active_count' => $mortgages->where('status', 'active')->count(),
            'released_count' => $mortgages->where('status', 'released')->count(),
        ];

        $branches = Branch::where('status', 'active')->orderBy('name')->get();

        return Inertia::render('Reports/Mortgage', [
            'mortgages' => $mortgages,
            'summary' => $summary,
            'branches' => $branches,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'status' => $status,
            ],
        ]);
    }
}
