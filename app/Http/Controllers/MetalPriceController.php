<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\MetalPrice;
use App\Models\Purity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MetalPriceController extends Controller
{
    public function index(Request $request)
    {
        $query = MetalPrice::with(['purity', 'branch', 'creator']);

        if ($request->filled('metal_type')) {
            $query->where('metal_type', $request->input('metal_type'));
        }

        if ($request->filled('purity_id')) {
            $query->where('purity_id', $request->input('purity_id'));
        }

        $metalPrices = $query->orderBy('effective_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $purities = Purity::where('is_active', true)->orderBy('name', 'asc')->get();
        $branches = Branch::where('status', 'active')->orderBy('name', 'asc')->get();

        return Inertia::render('Settings/MetalPrices/Index', [
            'metalPrices' => $metalPrices,
            'purities' => $purities,
            'branches' => $branches,
            'filters' => $request->only(['metal_type', 'purity_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'metal_type' => 'required|string|in:gold,silver,platinum',
            'purity_id' => 'required|exists:purities,id',
            'price_per_gram' => 'required|numeric|min:0',
            'effective_date' => 'required|date',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $validated['created_by'] = auth()->id();

        MetalPrice::create($validated);

        return redirect()->route('settings.metal-prices.index')
            ->with('success', 'Metal price configured successfully.');
    }

    public function destroy(MetalPrice $metalPrice)
    {
        $metalPrice->delete();

        return redirect()->route('settings.metal-prices.index')
            ->with('success', 'Metal price record deleted.');
    }
}
