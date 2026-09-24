<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use App\Models\ArtisanStock;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Customer;
use App\Models\MetalPrice;
use App\Models\Mortgage;
use App\Models\MortgageCustomer;
use App\Models\MortgagePayment;
use App\Models\Order;
use App\Models\OtherExpense;
use App\Models\OtherIncome;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Production;
use App\Models\Purity;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\ArtisanPayment;
use App\Models\ChartOfAccount;
use App\Models\Cheque;
use App\Models\ContraEntry;
use App\Models\OpeningBalance;
use App\Models\PurchasePayment;
use App\Models\SalaryPayment;
use App\Models\SalePayment;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Classify payment method string into standard categories: cash, bank, mobile
     */
    protected function classifyPaymentCategory($method)
    {
        $m = strtolower(trim((string)$method));
        if (in_array($m, ['bank', 'card', 'cheque', 'pos', 'credit_card', 'debit_card'])) {
            return 'bank';
        }
        if (in_array($m, ['mobile_banking', 'mobile_money', 'bkash', 'nagad', 'rocket', 'upay'])) {
            return 'mobile';
        }
        return 'cash';
    }

    /**
     * Classify chart of account name into cash, bank, or mobile
     */
    protected function classifyAccountCategory($accountName)
    {
        $name = strtolower(trim((string)$accountName));
        if (str_contains($name, 'bkash') || str_contains($name, 'nagad') || str_contains($name, 'rocket') || str_contains($name, 'upay') || str_contains($name, 'mobile')) {
            return 'mobile';
        }
        if (str_contains($name, 'bank') || str_contains($name, 'card') || str_contains($name, 'standard chartered') || str_contains($name, 'city bank') || str_contains($name, 'islami bank') || str_contains($name, 'brac')) {
            return 'bank';
        }
        return 'cash';
    }

    /**
     * Get initial opening balance configured in system settings / chart of accounts / opening balances
     */
    protected function getInitialOpeningBalance($category = null, $branchId = null)
    {
        $query = ChartOfAccount::query()->where('is_active', true);

        if ($category === 'cash') {
            $query->where(function($q) {
                $q->where('code', '1010')
                  ->orWhere('name', 'like', '%cash%');
            });
        } elseif ($category === 'bank') {
            $query->where(function($q) {
                $q->where('code', '1020')
                  ->orWhere('name', 'like', '%bank%');
            });
        } elseif ($category === 'mobile') {
            $query->where(function($q) {
                $q->where('code', '1030')
                  ->orWhere('name', 'like', '%bkash%')
                  ->orWhere('name', 'like', '%nagad%')
                  ->orWhere('name', 'like', '%rocket%')
                  ->orWhere('name', 'like', '%mobile%');
            });
        } else {
            $query->where('account_type', 'asset');
        }

        return (float) $query->sum('opening_balance');
    }

    /**
     * Collect and normalize all ledger transactions across models
     */
    protected function getLedgerTransactions($startDate, $endDate, $branchId = null, $paymentCategory = null)
    {
        $items = collect();

        // 1. Sale Payments (Inflow)
        $salePaymentsQuery = SalePayment::with(['sale.customer', 'sale.branch'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($branchId) {
            $salePaymentsQuery->where(function($q) use ($branchId) {
                $q->where('branch_id', $branchId)
                  ->orWhereHas('sale', fn($sq) => $sq->where('branch_id', $branchId));
            });
        }
        foreach ($salePaymentsQuery->get() as $sp) {
            $mode = strtolower($sp->payment_method ?? 'cash');
            $cat = $this->classifyPaymentCategory($mode);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'sp_' . $sp->id,
                'date' => $sp->payment_date ? $sp->payment_date->format('Y-m-d') : '',
                'time' => $sp->created_at ? $sp->created_at->format('H:i') : '00:00',
                'type' => 'sale_payment',
                'type_label' => 'Sale Payment / Due Collection',
                'voucher_no' => $sp->payment_no ?? ($sp->sale ? $sp->sale->invoice_no : 'SPAY-' . $sp->id),
                'particulars' => $sp->sale && $sp->sale->customer ? 'Customer: ' . $sp->sale->customer->name : ($sp->customer ? 'Customer: ' . $sp->customer->name : 'Customer Sale Payment'),
                'payment_method' => $mode,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst(str_replace('_', ' ', $mode)),
                'debit' => (float)$sp->amount,
                'credit' => 0,
                'branch_name' => $sp->sale && $sp->sale->branch ? $sp->sale->branch->name : 'Main Branch',
                'notes' => $sp->notes ?? ($sp->reference_no ? 'Ref: ' . $sp->reference_no : ''),
            ]);
        }

        // 2. Direct Sales (Without separate SalePayment record)
        $directSalesQuery = Sale::with(['customer', 'branch'])
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->where('paid_amount', '>', 0)
            ->whereDoesntHave('payments');
        if ($branchId) {
            $directSalesQuery->where('branch_id', $branchId);
        }
        foreach ($directSalesQuery->get() as $sale) {
            $mode = strtolower($sale->payment_method ?? 'cash');
            $cat = $this->classifyPaymentCategory($mode);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'sale_' . $sale->id,
                'date' => $sale->sale_date ? (is_string($sale->sale_date) ? $sale->sale_date : $sale->sale_date->format('Y-m-d')) : '',
                'time' => $sale->created_at ? $sale->created_at->format('H:i') : '00:00',
                'type' => 'sale_direct',
                'type_label' => 'Direct Sale Receipt',
                'voucher_no' => $sale->invoice_no ?? 'INV-' . $sale->id,
                'particulars' => 'Customer: ' . ($sale->customer ? $sale->customer->name : 'Direct Customer'),
                'payment_method' => $mode,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst(str_replace('_', ' ', $mode)),
                'debit' => (float)$sale->paid_amount,
                'credit' => 0,
                'branch_name' => $sale->branch ? $sale->branch->name : 'Main Branch',
                'notes' => 'Invoice: ' . ($sale->invoice_no ?? ''),
            ]);
        }

        // 3. Purchase Payments (Outflow)
        $purchasePaymentsQuery = PurchasePayment::with(['purchase.supplier', 'purchase.branch'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($branchId) {
            $purchasePaymentsQuery->where(function($q) use ($branchId) {
                $q->where('branch_id', $branchId)
                  ->orWhereHas('purchase', fn($pq) => $pq->where('branch_id', $branchId));
            });
        }
        foreach ($purchasePaymentsQuery->get() as $pp) {
            $mode = strtolower($pp->payment_method ?? 'cash');
            $cat = $this->classifyPaymentCategory($mode);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'pp_' . $pp->id,
                'date' => $pp->payment_date ? (is_string($pp->payment_date) ? $pp->payment_date : $pp->payment_date->format('Y-m-d')) : '',
                'time' => $pp->created_at ? $pp->created_at->format('H:i') : '00:00',
                'type' => 'purchase_payment',
                'type_label' => 'Purchase Payment',
                'voucher_no' => $pp->payment_no ?? ($pp->purchase ? $pp->purchase->purchase_no : 'PPAY-' . $pp->id),
                'particulars' => $pp->purchase && $pp->purchase->supplier ? 'Supplier: ' . $pp->purchase->supplier->name : 'Supplier Payment',
                'payment_method' => $mode,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst(str_replace('_', ' ', $mode)),
                'debit' => 0,
                'credit' => (float)$pp->amount,
                'branch_name' => $pp->purchase && $pp->purchase->branch ? $pp->purchase->branch->name : 'Main Branch',
                'notes' => $pp->notes ?? ($pp->reference_no ? 'Ref: ' . $pp->reference_no : ''),
            ]);
        }

        // 4. Direct Purchases (Without separate PurchasePayment record)
        $directPurchasesQuery = Purchase::with(['supplier', 'branch'])
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->where('paid_amount', '>', 0)
            ->whereDoesntHave('payments');
        if ($branchId) {
            $directPurchasesQuery->where('branch_id', $branchId);
        }
        foreach ($directPurchasesQuery->get() as $purchase) {
            $mode = strtolower($purchase->payment_method ?? 'cash');
            $cat = $this->classifyPaymentCategory($mode);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'purchase_' . $purchase->id,
                'date' => $purchase->purchase_date ? (is_string($purchase->purchase_date) ? $purchase->purchase_date : $purchase->purchase_date->format('Y-m-d')) : '',
                'time' => $purchase->created_at ? $purchase->created_at->format('H:i') : '00:00',
                'type' => 'purchase_direct',
                'type_label' => 'Direct Purchase Payment',
                'voucher_no' => $purchase->purchase_no ?? 'PUR-' . $purchase->id,
                'particulars' => 'Supplier: ' . ($purchase->supplier ? $purchase->supplier->name : 'Supplier'),
                'payment_method' => $mode,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst(str_replace('_', ' ', $mode)),
                'debit' => 0,
                'credit' => (float)$purchase->paid_amount,
                'branch_name' => $purchase->branch ? $purchase->branch->name : 'Main Branch',
                'notes' => 'Purchase Bill: ' . ($purchase->purchase_no ?? ''),
            ]);
        }

        // 5. Other Incomes (Inflow)
        $otherIncomesQuery = OtherIncome::with(['branch', 'account'])
            ->whereBetween('income_date', [$startDate, $endDate]);
        if ($branchId) {
            $otherIncomesQuery->where('branch_id', $branchId);
        }
        foreach ($otherIncomesQuery->get() as $inc) {
            $accName = $inc->account ? strtolower($inc->account->name) : 'cash';
            $cat = $this->classifyAccountCategory($accName);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'inc_' . $inc->id,
                'date' => $inc->income_date ? (is_string($inc->income_date) ? $inc->income_date : $inc->income_date->format('Y-m-d')) : '',
                'time' => $inc->created_at ? $inc->created_at->format('H:i') : '00:00',
                'type' => 'other_income',
                'type_label' => 'Other Income (' . ($inc->category ?: 'General') . ')',
                'voucher_no' => $inc->income_no ?? 'INC-' . $inc->id,
                'particulars' => ($inc->account ? $inc->account->name : 'Income') . ($inc->category ? ' - ' . $inc->category : ''),
                'payment_method' => $cat,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst($cat),
                'debit' => (float)$inc->amount,
                'credit' => 0,
                'branch_name' => $inc->branch ? $inc->branch->name : 'Main Branch',
                'notes' => $inc->notes ?? '',
            ]);
        }

        // 6. Other Expenses (Outflow)
        $otherExpensesQuery = OtherExpense::with(['branch', 'account'])
            ->whereBetween('expense_date', [$startDate, $endDate]);
        if ($branchId) {
            $otherExpensesQuery->where('branch_id', $branchId);
        }
        foreach ($otherExpensesQuery->get() as $exp) {
            $accName = $exp->account ? strtolower($exp->account->name) : 'cash';
            $cat = $this->classifyAccountCategory($accName);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'exp_' . $exp->id,
                'date' => $exp->expense_date ? (is_string($exp->expense_date) ? $exp->expense_date : $exp->expense_date->format('Y-m-d')) : '',
                'time' => $exp->created_at ? $exp->created_at->format('H:i') : '00:00',
                'type' => 'other_expense',
                'type_label' => 'Other Expense (' . ($exp->category ?: 'General') . ')',
                'voucher_no' => $exp->expense_no ?? 'EXP-' . $exp->id,
                'particulars' => ($exp->account ? $exp->account->name : 'Expense') . ($exp->category ? ' - ' . $exp->category : ''),
                'payment_method' => $cat,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst($cat),
                'debit' => 0,
                'credit' => (float)$exp->amount,
                'branch_name' => $exp->branch ? $exp->branch->name : 'Main Branch',
                'notes' => $exp->notes ?? '',
            ]);
        }

        // 7. Contra Entries (Transfer between accounts)
        $contraQuery = ContraEntry::with(['fromAccount', 'toAccount', 'branch'])
            ->whereBetween('entry_date', [$startDate, $endDate]);
        if ($branchId) {
            $contraQuery->where('branch_id', $branchId);
        }
        foreach ($contraQuery->get() as $cnt) {
            $fromCat = $this->classifyAccountCategory($cnt->fromAccount?->name ?? '');
            $toCat = $this->classifyAccountCategory($cnt->toAccount?->name ?? '');

            if ($paymentCategory) {
                if ($fromCat === $paymentCategory) {
                    $items->push([
                        'id' => 'cnt_out_' . $cnt->id,
                        'date' => $cnt->entry_date ? (is_string($cnt->entry_date) ? $cnt->entry_date : $cnt->entry_date->format('Y-m-d')) : '',
                        'time' => $cnt->created_at ? $cnt->created_at->format('H:i') : '00:00',
                        'type' => 'contra_transfer_out',
                        'type_label' => 'Transfer Out (Contra)',
                        'voucher_no' => $cnt->entry_no ?? 'CNT-' . $cnt->id,
                        'particulars' => 'Transfer to: ' . ($cnt->toAccount ? $cnt->toAccount->name : 'Account'),
                        'payment_method' => $fromCat,
                        'payment_category' => $fromCat,
                        'payment_method_label' => ucfirst($fromCat),
                        'debit' => 0,
                        'credit' => (float)$cnt->amount,
                        'branch_name' => $cnt->branch ? $cnt->branch->name : 'Main Branch',
                        'notes' => $cnt->notes ?? '',
                    ]);
                }
                if ($toCat === $paymentCategory) {
                    $items->push([
                        'id' => 'cnt_in_' . $cnt->id,
                        'date' => $cnt->entry_date ? (is_string($cnt->entry_date) ? $cnt->entry_date : $cnt->entry_date->format('Y-m-d')) : '',
                        'time' => $cnt->created_at ? $cnt->created_at->format('H:i') : '00:00',
                        'type' => 'contra_transfer_in',
                        'type_label' => 'Transfer In (Contra)',
                        'voucher_no' => $cnt->entry_no ?? 'CNT-' . $cnt->id,
                        'particulars' => 'Transfer from: ' . ($cnt->fromAccount ? $cnt->fromAccount->name : 'Account'),
                        'payment_method' => $toCat,
                        'payment_category' => $toCat,
                        'payment_method_label' => ucfirst($toCat),
                        'debit' => (float)$cnt->amount,
                        'credit' => 0,
                        'branch_name' => $cnt->branch ? $cnt->branch->name : 'Main Branch',
                        'notes' => $cnt->notes ?? '',
                    ]);
                }
            } else {
                $items->push([
                    'id' => 'cnt_' . $cnt->id,
                    'date' => $cnt->entry_date ? (is_string($cnt->entry_date) ? $cnt->entry_date : $cnt->entry_date->format('Y-m-d')) : '',
                    'time' => $cnt->created_at ? $cnt->created_at->format('H:i') : '00:00',
                    'type' => 'contra',
                    'type_label' => 'Contra Transfer',
                    'voucher_no' => $cnt->entry_no ?? 'CNT-' . $cnt->id,
                    'particulars' => ($cnt->fromAccount?->name ?? 'From') . ' ➔ ' . ($cnt->toAccount?->name ?? 'To'),
                    'payment_method' => 'contra',
                    'payment_category' => 'contra',
                    'payment_method_label' => 'Contra',
                    'debit' => (float)$cnt->amount,
                    'credit' => (float)$cnt->amount,
                    'branch_name' => $cnt->branch ? $cnt->branch->name : 'Main Branch',
                    'notes' => $cnt->notes ?? '',
                ]);
            }
        }

        // 8. Salary Payments (Outflow)
        $salaryQuery = SalaryPayment::with(['staff', 'branch'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($branchId) {
            $salaryQuery->where('branch_id', $branchId);
        }
        foreach ($salaryQuery->get() as $sal) {
            $mode = strtolower($sal->payment_method ?? 'cash');
            $cat = $this->classifyPaymentCategory($mode);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'sal_' . $sal->id,
                'date' => $sal->payment_date ? (is_string($sal->payment_date) ? $sal->payment_date : $sal->payment_date->format('Y-m-d')) : '',
                'time' => $sal->created_at ? $sal->created_at->format('H:i') : '00:00',
                'type' => 'salary_payment',
                'type_label' => 'Staff Salary Payment',
                'voucher_no' => $sal->payment_no ?? 'SAL-' . $sal->id,
                'particulars' => 'Staff: ' . ($sal->staff ? $sal->staff->name : 'Employee') . ($sal->staff && $sal->staff->designation ? ' (' . $sal->staff->designation . ')' : ''),
                'payment_method' => $mode,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst(str_replace('_', ' ', $mode)),
                'debit' => 0,
                'credit' => (float)$sal->amount,
                'branch_name' => $sal->branch ? $sal->branch->name : 'Main Branch',
                'notes' => $sal->notes ?? '',
            ]);
        }

        // 9. Artisan Payments (Outflow)
        $artisanPaymentQuery = ArtisanPayment::with(['artisan', 'branch'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($branchId) {
            $artisanPaymentQuery->where('branch_id', $branchId);
        }
        foreach ($artisanPaymentQuery->get() as $ap) {
            $mode = strtolower($ap->payment_method ?? 'cash');
            $cat = $this->classifyPaymentCategory($mode);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'ap_' . $ap->id,
                'date' => $ap->payment_date ? (is_string($ap->payment_date) ? $ap->payment_date : $ap->payment_date->format('Y-m-d')) : '',
                'time' => $ap->created_at ? $ap->created_at->format('H:i') : '00:00',
                'type' => 'artisan_payment',
                'type_label' => 'Artisan Charge Payment',
                'voucher_no' => $ap->payment_no ?? 'ARTPAY-' . $ap->id,
                'particulars' => 'Artisan: ' . ($ap->artisan ? $ap->artisan->name : 'Artisan'),
                'payment_method' => $mode,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst(str_replace('_', ' ', $mode)),
                'debit' => 0,
                'credit' => (float)$ap->amount,
                'branch_name' => $ap->branch ? $ap->branch->name : 'Main Branch',
                'notes' => $ap->notes ?? ($ap->transaction_ref ? 'Ref: ' . $ap->transaction_ref : ''),
            ]);
        }

        // 10. Mortgage Payments (Inflow)
        $mortgagePaymentQuery = MortgagePayment::with(['mortgage.customer', 'mortgage.branch'])
            ->whereBetween('payment_date', [$startDate, $endDate]);
        if ($branchId) {
            $mortgagePaymentQuery->whereHas('mortgage', fn($mq) => $mq->where('branch_id', $branchId));
        }
        foreach ($mortgagePaymentQuery->get() as $mp) {
            $mode = strtolower($mp->payment_method ?? 'cash');
            $cat = $this->classifyPaymentCategory($mode);
            if ($paymentCategory && $cat !== $paymentCategory) continue;

            $items->push([
                'id' => 'mp_' . $mp->id,
                'date' => $mp->payment_date ? (is_string($mp->payment_date) ? $mp->payment_date : $mp->payment_date->format('Y-m-d')) : '',
                'time' => $mp->created_at ? $mp->created_at->format('H:i') : '00:00',
                'type' => 'mortgage_receipt',
                'type_label' => 'Mortgage ' . ucfirst($mp->payment_type ?? 'Payment') . ' Receipt',
                'voucher_no' => $mp->payment_no ?? ($mp->mortgage ? $mp->mortgage->mortgage_no : 'MPAY-' . $mp->id),
                'particulars' => 'Mortgage Customer: ' . ($mp->mortgage && $mp->mortgage->customer ? $mp->mortgage->customer->name : 'Customer'),
                'payment_method' => $mode,
                'payment_category' => $cat,
                'payment_method_label' => ucfirst(str_replace('_', ' ', $mode)),
                'debit' => (float)$mp->amount,
                'credit' => 0,
                'branch_name' => $mp->mortgage && $mp->mortgage->branch ? $mp->mortgage->branch->name : 'Main Branch',
                'notes' => $mp->notes ?? '',
            ]);
        }

        // Sort by date ascending, then time ascending
        return $items->sortBy(function($item) {
            return ($item['date'] ?? '') . ' ' . ($item['time'] ?? '');
        })->values();
    }

    /**
     * 1. Day Book Report
     */
    public function dayBookReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $paymentCategory = $request->input('payment_category'); // cash, bank, mobile, or null for all

        $transactions = $this->getLedgerTransactions($startDate, $endDate, $branchId, $paymentCategory);

        $initialOpening = $this->getInitialOpeningBalance($paymentCategory, $branchId);
        
        $runningBalance = $initialOpening;
        $ledgerWithRunningBalance = $transactions->map(function ($tx) use (&$runningBalance) {
            $runningBalance += ($tx['debit'] - $tx['credit']);
            $tx['balance'] = round($runningBalance, 2);
            return $tx;
        });

        $totalInflow = $transactions->sum('debit');
        $totalOutflow = $transactions->sum('credit');
        $netMovement = $totalInflow - $totalOutflow;
        $closingBalance = $initialOpening + $netMovement;

        // Breakdown by mode
        $cashInflow = $transactions->where('payment_category', 'cash')->sum('debit');
        $cashOutflow = $transactions->where('payment_category', 'cash')->sum('credit');
        $bankInflow = $transactions->where('payment_category', 'bank')->sum('debit');
        $bankOutflow = $transactions->where('payment_category', 'bank')->sum('credit');
        $mobileInflow = $transactions->where('payment_category', 'mobile')->sum('debit');
        $mobileOutflow = $transactions->where('payment_category', 'mobile')->sum('credit');

        $branches = Branch::where('status', 'active')->orderBy('name')->get();

        return Inertia::render('Reports/DayBook', [
            'transactions' => $ledgerWithRunningBalance,
            'summary' => [
                'opening_balance' => $initialOpening,
                'total_inflow' => $totalInflow,
                'total_outflow' => $totalOutflow,
                'net_movement' => $netMovement,
                'closing_balance' => $closingBalance,
                'cash_inflow' => $cashInflow,
                'cash_outflow' => $cashOutflow,
                'bank_inflow' => $bankInflow,
                'bank_outflow' => $bankOutflow,
                'mobile_inflow' => $mobileInflow,
                'mobile_outflow' => $mobileOutflow,
                'total_count' => $transactions->count(),
            ],
            'branches' => $branches,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'payment_category' => $paymentCategory,
            ],
        ]);
    }

    /**
     * 2. Cash Book Report
     */
    public function cashBookReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');

        $transactions = $this->getLedgerTransactions($startDate, $endDate, $branchId, 'cash');

        $initialOpening = $this->getInitialOpeningBalance('cash', $branchId);

        $runningBalance = $initialOpening;
        $ledgerWithBalance = $transactions->map(function ($tx) use (&$runningBalance) {
            $runningBalance += ($tx['debit'] - $tx['credit']);
            $tx['balance'] = round($runningBalance, 2);
            return $tx;
        });

        $totalCashIn = $transactions->sum('debit');
        $totalCashOut = $transactions->sum('credit');
        $netCashFlow = $totalCashIn - $totalCashOut;
        $closingCash = $initialOpening + $netCashFlow;

        $branches = Branch::where('status', 'active')->orderBy('name')->get();

        return Inertia::render('Reports/CashBook', [
            'transactions' => $ledgerWithBalance,
            'summary' => [
                'opening_cash' => $initialOpening,
                'total_cash_in' => $totalCashIn,
                'total_cash_out' => $totalCashOut,
                'net_cash_flow' => $netCashFlow,
                'closing_cash' => $closingCash,
                'total_count' => $transactions->count(),
            ],
            'branches' => $branches,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
            ],
        ]);
    }

    /**
     * 3. Consol Bank Book Report
     */
    public function consolBankBookReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $bankAccountId = $request->input('account_id');

        $transactions = $this->getLedgerTransactions($startDate, $endDate, $branchId, 'bank');
        $initialOpening = $this->getInitialOpeningBalance('bank', $branchId);

        if ($bankAccountId) {
            $selectedAccount = ChartOfAccount::find($bankAccountId);
            if ($selectedAccount) {
                $accName = strtolower($selectedAccount->name);
                $transactions = $transactions->filter(function($tx) use ($accName, $bankAccountId) {
                    return str_contains(strtolower($tx['particulars']), $accName) || 
                           (isset($tx['account_id']) && $tx['account_id'] == $bankAccountId);
                })->values();
                $initialOpening = (float) $selectedAccount->opening_balance;
            }
        }

        $runningBalance = $initialOpening;
        $ledgerWithBalance = $transactions->map(function ($tx) use (&$runningBalance) {
            $runningBalance += ($tx['debit'] - $tx['credit']);
            $tx['balance'] = round($runningBalance, 2);
            return $tx;
        });

        $totalDeposits = $transactions->sum('debit');
        $totalWithdrawals = $transactions->sum('credit');
        $netBankFlow = $totalDeposits - $totalWithdrawals;
        $closingBank = $initialOpening + $netBankFlow;

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $bankAccounts = ChartOfAccount::where(function($q) {
            $q->where('name', 'like', '%bank%')
              ->orWhere('code', '1020')
              ->orWhere('account_type', 'asset');
        })->where('name', 'not like', '%cash%')
          ->where('name', 'not like', '%bkash%')
          ->where('name', 'not like', '%nagad%')
          ->orderBy('name')
          ->get();

        return Inertia::render('Reports/ConsolBankBook', [
            'transactions' => $ledgerWithBalance,
            'summary' => [
                'opening_bank' => $initialOpening,
                'total_deposits' => $totalDeposits,
                'total_withdrawals' => $totalWithdrawals,
                'net_bank_flow' => $netBankFlow,
                'closing_bank' => $closingBank,
                'total_count' => $transactions->count(),
            ],
            'branches' => $branches,
            'bankAccounts' => $bankAccounts,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'account_id' => $bankAccountId,
            ],
        ]);
    }

    /**
     * 4. Mobile Bank Book Report
     */
    public function mobileBankBookReport(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $branchId = $request->input('branch_id');
        $provider = $request->input('provider'); // bkash, nagad, rocket, upay

        $transactions = $this->getLedgerTransactions($startDate, $endDate, $branchId, 'mobile');
        $initialOpening = $this->getInitialOpeningBalance('mobile', $branchId);

        if ($provider) {
            $transactions = $transactions->filter(function($tx) use ($provider) {
                return str_contains(strtolower($tx['particulars'] . ' ' . $tx['payment_method']), strtolower($provider));
            })->values();

            $matchingAcc = ChartOfAccount::where('name', 'like', "%{$provider}%")->first();
            if ($matchingAcc) {
                $initialOpening = (float) $matchingAcc->opening_balance;
            }
        }

        $runningBalance = $initialOpening;
        $ledgerWithBalance = $transactions->map(function ($tx) use (&$runningBalance) {
            $runningBalance += ($tx['debit'] - $tx['credit']);
            $tx['balance'] = round($runningBalance, 2);
            return $tx;
        });

        $totalMobileIn = $transactions->sum('debit');
        $totalMobileOut = $transactions->sum('credit');
        $netMobileFlow = $totalMobileIn - $totalMobileOut;
        $closingMobile = $initialOpening + $netMobileFlow;

        $branches = Branch::where('status', 'active')->orderBy('name')->get();
        $mobileAccounts = ChartOfAccount::where(function($q) {
            $q->where('name', 'like', '%bkash%')
              ->orWhere('name', 'like', '%nagad%')
              ->orWhere('name', 'like', '%rocket%')
              ->orWhere('name', 'like', '%upay%')
              ->orWhere('name', 'like', '%mobile%')
              ->orWhere('code', '1030');
        })->orderBy('name')->get();

        return Inertia::render('Reports/MobileBankBook', [
            'transactions' => $ledgerWithBalance,
            'summary' => [
                'opening_mobile' => $initialOpening,
                'total_mobile_in' => $totalMobileIn,
                'total_mobile_out' => $totalMobileOut,
                'net_mobile_flow' => $netMobileFlow,
                'closing_mobile' => $closingMobile,
                'total_count' => $transactions->count(),
            ],
            'branches' => $branches,
            'mobileAccounts' => $mobileAccounts,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'provider' => $provider,
            ],
        ]);
    }

    /**
     * 5. Profit & Loss (P&L) Report - Ready Product Stock Profit & Loss List
     */
    public function profitLossReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $branchId = $request->input('branch_id');
        $categoryId = $request->input('category_id');
        $purityId = $request->input('purity_id');
        $search = $request->input('search');

        $query = Product::with(['category', 'purity', 'branch'])
            ->where('status', 'active');

        if ($startDate && $endDate) {
            $query->where(function($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate])
                  ->orWhereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            });
        }
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }
        if ($purityId) {
            $query->where('purity_id', $purityId);
        }
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $latestPrices = MetalPrice::orderBy('effective_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->unique('purity_id')
            ->pluck('price_per_gram', 'purity_id');

        // Overall summary across all matching ready products
        $allMatching = (clone $query)->get();
        $totalCount = $allMatching->count();
        $totalWeightGm = 0;
        $totalCostValuation = 0;
        $totalSellingValuation = 0;
        $totalProfitLoss = 0;

        foreach ($allMatching as $p) {
            $netWeight = (float)$p->net_weight;
            $totalWeightGm += $netWeight;

            $marketPricePerGram = (float)($latestPrices[$p->purity_id] ?? 0);
            $baseRatePerGram = (float)$p->rate_per_vori > 0 ? ((float)$p->rate_per_vori / 11.664) : $marketPricePerGram;
            if ($marketPricePerGram <= 0) {
                $marketPricePerGram = $baseRatePerGram;
            }

            $makingVal = $p->making_charge_type === 'per_gram'
                ? ((float)$p->making_charge_value * $netWeight)
                : (float)$p->making_charge_value;
            $stoneVal = (float)($p->stone_charge ?? 0);

            $costPrice = ($netWeight * $baseRatePerGram) + $makingVal + $stoneVal;
            $sellingValue = ($netWeight * $marketPricePerGram) + $makingVal + $stoneVal;

            $diff = $sellingValue - $costPrice;
            $pAmount = $diff != 0 ? $diff : $makingVal;

            $totalCostValuation += $costPrice;
            $totalSellingValuation += $sellingValue;
            $totalProfitLoss += $pAmount;
        }

        $totalWeightVori = round($totalWeightGm / 11.664, 3);
        $overallMarginPercent = $totalCostValuation > 0 ? round(($totalProfitLoss / $totalCostValuation) * 100, 2) : 0;

        // Paginate 10 products per page
        $paginatedProducts = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        $paginatedProducts->getCollection()->transform(function ($p) use ($latestPrices) {
            $netWeight = (float)$p->net_weight;
            $netWeightVori = round($netWeight / 11.664, 3);

            $marketPricePerGram = (float)($latestPrices[$p->purity_id] ?? 0);
            $baseRatePerGram = (float)$p->rate_per_vori > 0 ? ((float)$p->rate_per_vori / 11.664) : $marketPricePerGram;
            if ($marketPricePerGram <= 0) {
                $marketPricePerGram = $baseRatePerGram;
            }

            $makingVal = $p->making_charge_type === 'per_gram'
                ? ((float)$p->making_charge_value * $netWeight)
                : (float)$p->making_charge_value;
            $stoneVal = (float)($p->stone_charge ?? 0);

            $costPrice = ($netWeight * $baseRatePerGram) + $makingVal + $stoneVal;
            $sellingValue = ($netWeight * $marketPricePerGram) + $makingVal + $stoneVal;

            $diff = $sellingValue - $costPrice;
            $profitAmount = $diff != 0 ? $diff : $makingVal;
            $marginPercent = $costPrice > 0 ? round(($profitAmount / $costPrice) * 100, 2) : 0;

            return [
                'id' => $p->id,
                'sku' => $p->sku,
                'barcode' => $p->barcode,
                'name' => $p->name,
                'category_name' => $p->category?->name ?? 'Jewelry',
                'purity_name' => $p->purity?->name ?? 'Standard',
                'metal_type' => $p->metal_type,
                'gross_weight' => (float)$p->gross_weight,
                'stone_weight' => (float)$p->stone_weight,
                'net_weight' => $netWeight,
                'net_weight_vori' => $netWeightVori,
                'base_rate_per_vori' => round($baseRatePerGram * 11.664, 2),
                'market_rate_per_vori' => round($marketPricePerGram * 11.664, 2),
                'making_charge' => round($makingVal, 2),
                'stone_charge' => round($stoneVal, 2),
                'cost_price' => round($costPrice, 2),
                'selling_value' => round($sellingValue, 2),
                'profit_loss_amount' => round($profitAmount, 2),
                'margin_percent' => $marginPercent,
                'branch_name' => $p->branch?->name ?? 'Main Branch',
                'status' => $p->status,
                'date' => $p->date ? $p->date->format('Y-m-d') : ($p->created_at ? $p->created_at->format('Y-m-d') : ''),
            ];
        });

        $categories = ProductCategory::orderBy('name')->get();
        $purities = Purity::orderBy('name')->get();
        $branches = Branch::where('status', 'active')->orderBy('name')->get();

        return Inertia::render('Reports/ProfitLoss', [
            'products' => $paginatedProducts,
            'summary' => [
                'total_products_count' => $totalCount,
                'total_weight_gm' => round($totalWeightGm, 3),
                'total_weight_vori' => $totalWeightVori,
                'total_cost_value' => round($totalCostValuation, 2),
                'total_selling_value' => round($totalSellingValuation, 2),
                'total_profit_loss' => round($totalProfitLoss, 2),
                'overall_margin_percent' => $overallMarginPercent,
            ],
            'categories' => $categories,
            'purities' => $purities,
            'branches' => $branches,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'category_id' => $categoryId,
                'purity_id' => $purityId,
                'search' => $search,
            ],
        ]);
    }


    /**
     * Backward-compatible Accounts Report (redirect or render ProfitLoss / Accounts)
     */
    public function accountsReport(Request $request)
    {
        return $this->profitLossReport($request);
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

        $latestPrices = MetalPrice::orderBy('effective_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->unique('purity_id')
            ->pluck('price_per_gram', 'purity_id');

        $products = $query->orderBy('name')->get()->map(function ($product) use ($latestPrices) {
            $metalPricePerGram = $latestPrices[$product->purity_id] ?? 0;
            $metalValue = $product->net_weight * $metalPricePerGram;
            $makingCharge = $product->making_charge_type === 'per_gram' 
                ? $product->making_charge_value * $product->net_weight 
                : $product->making_charge_value;
            $sellingPrice = $metalValue + $makingCharge + ($product->stone_charge ?? 0);

            $product->selling_price = round($sellingPrice, 2);
            $product->metal_price_per_gram = $metalPricePerGram;
            return $product;
        });

        $totalWeightGm = $products->sum('net_weight');
        $totalWeightVori = round($totalWeightGm / 11.664, 3);
        $totalValuation = $products->sum('selling_price');
        $artisanHoldingGm = ArtisanStock::sum('balance_weight');

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
            $stockHolding = ArtisanStock::where('artisan_id', $artisan->id)->sum('balance_weight');
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
            'total_holding_gm' => round(ArtisanStock::sum('balance_weight'), 3),
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

        $interestCollected = MortgagePayment::where('payment_type', 'interest')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');
        $principalReleased = MortgagePayment::whereIn('payment_type', ['principal', 'redemption'])
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');

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

