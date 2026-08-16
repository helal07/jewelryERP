<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArtisanController extends Controller
{
    public function index()
    {
        $artisans = Artisan::latest()->paginate(10);
        return Inertia::render('Contacts/Artisans/Index', [
            'artisans' => $artisans
        ]);
    }

    public function show(Artisan $artisan)
    {
        return Inertia::render('Contacts/Artisans/Show', [
            'artisan' => $artisan
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/Artisans/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string',
            'specialization' => 'nullable|string|max:255',
            'wage_type' => 'nullable|string|max:255',
            'rate' => 'nullable|numeric|min:0',
            'opening_balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'nid_number' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'attachment' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('artisans/photos', 'public');
        }

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('artisans/attachments', 'public');
        }

        $validated['branch_id'] = $request->input('branch_id') ?: 1;
        $validated['code'] = 'ART-' . strtoupper(uniqid());
        $validated['status'] = !empty($validated['status']) ? $validated['status'] : 'active';
        $validated['wage_type'] = !empty($validated['wage_type']) ? $validated['wage_type'] : 'fixed';
        $validated['rate'] = !empty($validated['rate']) ? $validated['rate'] : 0;

        if (!empty($validated['opening_balance'])) {
            $validated['due_balance'] = $validated['opening_balance'];
        } else {
            $validated['opening_balance'] = 0;
            $validated['due_balance'] = 0;
        }

        $artisan = Artisan::create($validated);

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest' || $request->expectsJson()) {
            return response()->json(['success' => true, 'artisan' => $artisan]);
        }

        return redirect()->route('artisans.index')->with('success', 'Artisan created successfully.');
    }

    public function edit(Artisan $artisan)
    {
        return Inertia::render('Contacts/Artisans/Edit', [
            'artisan' => $artisan
        ]);
    }

    public function update(Request $request, Artisan $artisan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'specialization' => 'nullable|string|max:255',
            'wage_type' => 'nullable|string|max:255',
            'rate' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive',
            'nid_number' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'attachment' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('artisans/photos', 'public');
        }

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('artisans/attachments', 'public');
        }

        $artisan->update($validated);

        return redirect()->route('artisans.index')->with('success', 'Artisan updated successfully.');
    }

    public function destroy(Artisan $artisan)
    {
        $artisan->delete();
        return redirect()->route('artisans.index')->with('success', 'Artisan deleted successfully.');
    }
}
