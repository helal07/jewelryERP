<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use App\Models\ArtisanStock;
use App\Models\Branch;
use App\Models\Purity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ArtisanStockController extends Controller
{
    public function index(Request $request)
    {
        $artisans = Artisan::with('branch')->where('status', 'active')->get();
        $branches = Branch::all();
        $purities = Purity::where('is_active', true)->get();

        // Build history query
        $query = ArtisanStock::with(['artisan', 'branch', 'purity'])
            ->latest();

        if ($request->filled('artisan_id')) {
            $query->where('artisan_id', $request->artisan_id);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $transactions = $query->paginate(10)->withQueryString();

        // Artisan balance summary
        $balanceSummary = ArtisanStock::with('artisan')
            ->selectRaw('artisan_id, metal_type, SUM(weight_issued) as total_issued, SUM(weight_returned) as total_returned, SUM(balance_weight) as total_balance')
            ->groupBy('artisan_id', 'metal_type')
            ->get();

        return Inertia::render('Inventory/ArtisanStock/Index', [
            'artisans'       => $artisans,
            'branches'       => $branches,
            'purities'       => $purities,
            'transactions'   => $transactions,
            'balanceSummary' => $balanceSummary,
            'filters'        => $request->only(['artisan_id', 'branch_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id'        => 'required|exists:branches,id',
            'artisan_id'       => 'required|exists:artisans,id',
            'transaction_type' => 'required|in:issue,return',
            'metal_type'       => 'required|string',
            'purity_id'        => 'nullable|exists:purities,id',
            'weight'           => 'required|numeric|min:0.001',
            'notes'            => 'nullable|string',
        ]);

        $isIssue = $validated['transaction_type'] === 'issue';

        ArtisanStock::create([
            'branch_id'       => $validated['branch_id'],
            'artisan_id'      => $validated['artisan_id'],
            'metal_type'      => $validated['metal_type'],
            'purity_id'       => $validated['purity_id'] ?? null,
            'weight_issued'   => $isIssue ? $validated['weight'] : 0,
            'weight_returned' => $isIssue ? 0 : $validated['weight'],
            'balance_weight'  => $isIssue ? $validated['weight'] : -$validated['weight'],
            'reference_type'  => 'manual',
            'reference_id'    => null,
        ]);

        $label = $isIssue ? 'issued to' : 'received from';
        return redirect()->back()->with('success', "Metal {$label} artisan recorded successfully!");
    }
}
