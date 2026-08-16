<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\OtherIncome;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OtherIncomeController extends Controller
{
    public function index(Request $request)
    {
        $query = OtherIncome::with(['account', 'branch', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('income_no', 'like', "%{$search}%")
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
            $query->whereDate('income_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('income_date', '<=', $request->input('to_date'));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        $incomes = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $incomeAccounts = ChartOfAccount::where('account_type', 'income')->orderBy('name', 'asc')->get();
        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/OtherIncomes/Index', [
            'incomes' => $incomes,
            'accounts' => $incomeAccounts,
            'branches' => $branches,
            'filters' => $request->only(['search', 'account_id', 'from_date', 'to_date', 'branch_id']),
        ]);
    }

    public function create()
    {
        $incomeAccounts = ChartOfAccount::where('account_type', 'income')
            ->orderBy('name', 'asc')
            ->get();

        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/OtherIncomes/Create', [
            'accounts' => $incomeAccounts,
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'account_id' => 'required|exists:chart_of_accounts,id',
            'income_date' => 'required|date',
            'category' => 'nullable|string|max:100',
            'amount' => 'required|numeric|gt:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $validated['income_no'] = 'INC-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $validated['created_by'] = auth()->id();

        OtherIncome::create($validated);

        return redirect()->route('accounts.other-incomes.index')
            ->with('success', 'Other Income recorded successfully.');
    }

    public function destroy(OtherIncome $otherIncome)
    {
        $otherIncome->delete();

        return redirect()->route('accounts.other-incomes.index')
            ->with('success', 'Income record deleted successfully.');
    }
}
