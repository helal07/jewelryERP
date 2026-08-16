<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\OtherExpense;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OtherExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = OtherExpense::with(['account', 'branch', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('expense_no', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('account', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('account_id')) {
            $query->where('account_id', $request->input('account_id'));
        }

        if ($request->filled('from_date')) {
            $query->whereDate('expense_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('expense_date', '<=', $request->input('to_date'));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        $expenses = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $expenseAccounts = ChartOfAccount::where('account_type', 'expense')->orderBy('name', 'asc')->get();
        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/OtherExpenses/Index', [
            'expenses' => $expenses,
            'accounts' => $expenseAccounts,
            'branches' => $branches,
            'filters' => $request->only(['search', 'account_id', 'from_date', 'to_date', 'branch_id']),
        ]);
    }

    public function create()
    {
        $expenseAccounts = ChartOfAccount::where('account_type', 'expense')
            ->orderBy('name', 'asc')
            ->get();

        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/OtherExpenses/Create', [
            'accounts' => $expenseAccounts,
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'account_id' => 'required|exists:chart_of_accounts,id',
            'expense_date' => 'required|date',
            'category' => 'nullable|string|max:100',
            'amount' => 'required|numeric|gt:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $validated['expense_no'] = 'EXP-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $validated['created_by'] = auth()->id();

        OtherExpense::create($validated);

        return redirect()->route('accounts.other-expenses.index')
            ->with('success', 'Other Expense recorded successfully.');
    }

    public function destroy(OtherExpense $otherExpense)
    {
        $otherExpense->delete();

        return redirect()->route('accounts.other-expenses.index')
            ->with('success', 'Expense record deleted successfully.');
    }
}
