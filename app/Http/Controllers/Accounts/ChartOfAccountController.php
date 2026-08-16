<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChartOfAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = ChartOfAccount::with('parent');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('account_type')) {
            $query->where('account_type', $request->input('account_type'));
        }

        $allAccounts = ChartOfAccount::orderBy('code', 'asc')->get();
        $accounts = $query->orderBy('code', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Accounts/ChartOfAccounts/Index', [
            'accounts' => $accounts,
            'allAccounts' => $allAccounts,
            'filters' => $request->only(['search', 'account_type']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:chart_of_accounts,code',
            'name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'opening_balance' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        ChartOfAccount::create($validated);

        return redirect()->route('accounts.chart-of-accounts.index')
            ->with('success', 'Account created successfully.');
    }

    public function update(Request $request, ChartOfAccount $chartOfAccount)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:chart_of_accounts,code,' . $chartOfAccount->id,
            'name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'opening_balance' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $chartOfAccount->update($validated);

        return redirect()->route('accounts.chart-of-accounts.index')
            ->with('success', 'Account updated successfully.');
    }

    public function destroy(ChartOfAccount $chartOfAccount)
    {
        if ($chartOfAccount->is_system) {
            return redirect()->back()->with('error', 'System accounts cannot be deleted.');
        }

        $chartOfAccount->delete();

        return redirect()->route('accounts.chart-of-accounts.index')
            ->with('success', 'Account deleted successfully.');
    }
}
