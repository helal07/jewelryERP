<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\ContraEntry;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContraEntryController extends Controller
{
    public function index(Request $request)
    {
        $query = ContraEntry::with(['fromAccount', 'toAccount', 'branch', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('entry_no', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('fromAccount', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('toAccount', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('entry_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('entry_date', '<=', $request->input('to_date'));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        $contraEntries = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/Contra/Index', [
            'entries' => $contraEntries,
            'branches' => $branches,
            'filters' => $request->only(['search', 'from_date', 'to_date', 'branch_id']),
        ]);
    }

    public function create()
    {
        $cashAndBankAccounts = ChartOfAccount::whereIn('account_type', ['asset'])
            ->orderBy('name', 'asc')
            ->get();

        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/Contra/Create', [
            'accounts' => $cashAndBankAccounts,
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'entry_date' => 'required|date',
            'from_account_id' => 'required|exists:chart_of_accounts,id|different:to_account_id',
            'to_account_id' => 'required|exists:chart_of_accounts,id',
            'amount' => 'required|numeric|gt:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $validated['entry_no'] = 'CE-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $validated['created_by'] = auth()->id();

        ContraEntry::create($validated);

        return redirect()->route('accounts.contra.index')
            ->with('success', 'Contra Entry recorded successfully.');
    }

    public function destroy(ContraEntry $contra)
    {
        $contra->delete();

        return redirect()->route('accounts.contra.index')
            ->with('success', 'Contra Entry deleted successfully.');
    }
}
