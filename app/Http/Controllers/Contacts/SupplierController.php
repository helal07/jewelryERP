<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::with(['branch'])->latest()->paginate(10);
        return Inertia::render('Contacts/Suppliers/Index', [
            'suppliers' => $suppliers
        ]);
    }

    public function show(Supplier $supplier)
    {
        $supplier->load(['branch']);
        return Inertia::render('Contacts/Suppliers/Show', [
            'supplier' => $supplier
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/Suppliers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'company_name'    => 'nullable|string|max:255',
            'phone'           => 'nullable|string|max:255',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string',
            'nid_number'      => 'nullable|string|max:255',
            'opening_balance' => 'nullable|numeric|min:0',
            'credit_limit'    => 'nullable|numeric|min:0',
            'status'          => 'nullable|in:active,inactive',
            'photo'           => 'nullable|image|max:2048',
            'attachment'      => 'nullable|file|max:5120',
            'branch_id'       => 'nullable|exists:branches,id',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('suppliers/photos', 'public');
        }

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('suppliers/attachments', 'public');
        }

        $validated['branch_id'] = $validated['branch_id'] ?? $request->user()?->branch_id ?? 1;
        $validated['code'] = 'SUPP-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $validated['created_by'] = $request->user()?->id ?? auth()->id() ?? 1;
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['company_name'] = !empty($validated['company_name']) ? $validated['company_name'] : $validated['name'];
        $validated['phone'] = !empty($validated['phone']) ? $validated['phone'] : '01700000000';
        $validated['address'] = !empty($validated['address']) ? $validated['address'] : 'Main Store Address';

        $openingBal = (float)($validated['opening_balance'] ?? 0);
        $validated['opening_balance'] = $openingBal;
        $validated['due_balance'] = $openingBal;

        $supplier = Supplier::create($validated);

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest')) {
            return response()->json([
                'success'  => true,
                'message'  => 'Supplier created successfully.',
                'supplier' => $supplier,
            ]);
        }

        return redirect()->route('suppliers.index')->with('success', 'Supplier created successfully.');
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('Contacts/Suppliers/Edit', [
            'supplier' => $supplier
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'company_name'    => 'nullable|string|max:255',
            'phone'           => 'nullable|string|max:255',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string',
            'nid_number'      => 'nullable|string|max:255',
            'opening_balance' => 'nullable|numeric|min:0',
            'credit_limit'    => 'nullable|numeric|min:0',
            'status'          => 'nullable|in:active,inactive',
            'photo'           => 'nullable|image|max:2048',
            'attachment'      => 'nullable|file|max:5120',
            'branch_id'       => 'nullable|exists:branches,id',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('suppliers/photos', 'public');
        }

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('suppliers/attachments', 'public');
        }

        $supplier->update($validated);

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax())) {
            return response()->json([
                'success'  => true,
                'message'  => 'Supplier updated successfully.',
                'supplier' => $supplier,
            ]);
        }

        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }
}
