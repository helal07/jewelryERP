<?php

namespace App\Http\Controllers;

use App\Models\Purity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurityController extends Controller
{
    public function index(Request $request)
    {
        $query = Purity::query();

        if ($request->filled('metal_type')) {
            $query->where('metal_type', $request->input('metal_type'));
        }

        $purities = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Settings/Purities/Index', [
            'purities' => $purities,
            'filters' => $request->only(['metal_type']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'metal_type' => 'required|string|in:gold,silver,platinum',
            'name' => 'required|string|max:50',
            'percentage' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        Purity::create($validated);

        return redirect()->route('settings.purities.index')
            ->with('success', 'Purity added successfully.');
    }

    public function update(Request $request, Purity $purity)
    {
        $validated = $request->validate([
            'metal_type' => 'required|string|in:gold,silver,platinum',
            'name' => 'required|string|max:50',
            'percentage' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $purity->update($validated);

        return redirect()->route('settings.purities.index')
            ->with('success', 'Purity updated successfully.');
    }

    public function destroy(Purity $purity)
    {
        $purity->delete();

        return redirect()->route('settings.purities.index')
            ->with('success', 'Purity deleted successfully.');
    }
}
