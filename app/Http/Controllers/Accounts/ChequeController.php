<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Cheque;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChequeController extends Controller
{
    public function index(Request $request)
    {
        $query = Cheque::with(['account', 'branch', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('cheque_no', 'like', "%{$search}%")
                  ->orWhere('bank_name', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('direction')) {
            $query->where('direction', $request->input('direction'));
        }

        if ($request->filled('from_date')) {
            $query->whereDate('issue_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('issue_date', '<=', $request->input('to_date'));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        $cheques = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/Cheques/Index', [
            'cheques' => $cheques,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'direction', 'from_date', 'to_date', 'branch_id']),
        ]);
    }

    public function create()
    {
        $bankAccounts = ChartOfAccount::where('account_type', 'asset')
            ->orderBy('name', 'asc')
            ->get();

        $branches = Branch::where('status', 'active')->get();

        return Inertia::render('Accounts/Cheques/Create', [
            'accounts' => $bankAccounts,
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'cheque_no' => 'required|string|max:50',
            'bank_name' => 'nullable|string|max:255',
            'account_id' => 'required|exists:chart_of_accounts,id',
            'direction' => 'required|in:issued,received',
            'party_type' => 'nullable|string|max:50',
            'amount' => 'required|numeric|gt:0',
            'issue_date' => 'required|date',
            'due_date' => 'nullable|date',
            'status' => 'required|in:pending,cleared,bounced,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        $validated['created_by'] = auth()->id();

        Cheque::create($validated);

        return redirect()->route('accounts.cheques.index')
            ->with('success', 'Cheque record added to register.');
    }

    public function updateStatus(Request $request, Cheque $cheque)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,cleared,bounced,cancelled',
        ]);

        $cheque->update(['status' => $validated['status']]);

        return redirect()->back()
            ->with('success', 'Cheque status updated to ' . ucfirst($validated['status']));
    }

    public function destroy(Cheque $cheque)
    {
        $cheque->delete();

        return redirect()->route('accounts.cheques.index')
            ->with('success', 'Cheque deleted from register.');
    }
}
