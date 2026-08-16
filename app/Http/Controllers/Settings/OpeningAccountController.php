<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\OpeningBalance;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OpeningAccountController extends Controller
{
    public function index()
    {
        $accounts = ChartOfAccount::orderBy('code', 'asc')->get();

        $openingAccounts = [
            'default_cash_account_id' => SystemSetting::getByKey('default_cash_account_id', ''),
            'default_bank_account_id' => SystemSetting::getByKey('default_bank_account_id', ''),
            'default_capital_account_id' => SystemSetting::getByKey('default_capital_account_id', ''),
            'default_sales_income_account_id' => SystemSetting::getByKey('default_sales_income_account_id', ''),
            'default_purchase_expense_account_id' => SystemSetting::getByKey('default_purchase_expense_account_id', ''),
            'default_mortgage_account_id' => SystemSetting::getByKey('default_mortgage_account_id', ''),
        ];

        $openingBalances = OpeningBalance::with(['chartOfAccount', 'creator'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Settings/OpeningAccounts/Index', [
            'accounts' => $accounts,
            'openingAccounts' => $openingAccounts,
            'openingBalances' => $openingBalances,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'default_cash_account_id' => 'nullable|exists:chart_of_accounts,id',
            'default_bank_account_id' => 'nullable|exists:chart_of_accounts,id',
            'default_capital_account_id' => 'nullable|exists:chart_of_accounts,id',
            'default_sales_income_account_id' => 'nullable|exists:chart_of_accounts,id',
            'default_purchase_expense_account_id' => 'nullable|exists:chart_of_accounts,id',
            'default_mortgage_account_id' => 'nullable|exists:chart_of_accounts,id',
        ]);

        foreach ($validated as $key => $value) {
            SystemSetting::setByKey($key, (string) ($value ?? ''), 'opening_accounts');
        }

        return redirect()->route('settings.opening-accounts.index')
            ->with('success', 'Opening accounts configuration saved.');
    }

    public function storeBalance(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'account_type' => 'required|in:asset,liability,equity,income,expense',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = auth()->id();

        OpeningBalance::create($validated);

        return redirect()->route('settings.opening-accounts.index')
            ->with('success', 'Opening balance record created successfully.');
    }

    public function destroyBalance(OpeningBalance $openingBalance)
    {
        $openingBalance->delete();

        return redirect()->route('settings.opening-accounts.index')
            ->with('success', 'Opening balance record deleted successfully.');
    }
}
