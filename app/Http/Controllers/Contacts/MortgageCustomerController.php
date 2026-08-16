<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use App\Models\MortgageCustomer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MortgageCustomerController extends Controller
{
    public function index()
    {
        $mortgageCustomers = MortgageCustomer::latest()->paginate(10);
        return Inertia::render('Contacts/MortgageCustomers/Index', [
            'mortgageCustomers' => $mortgageCustomers
        ]);
    }

    public function show(MortgageCustomer $mortgageCustomer)
    {
        return Inertia::render('Contacts/MortgageCustomers/Show', [
            'mortgageCustomer' => $mortgageCustomer
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/MortgageCustomers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'status' => 'required|in:active,inactive',
            'nid_number' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'attachment' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('mortgage_customers/photos', 'public');
        }

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('mortgage_customers/attachments', 'public');
        }

        $validated['branch_id'] = 1; // Default branch
        $validated['code'] = 'MC-' . time();

        $mortgageCustomer = MortgageCustomer::create($validated);

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest')) {
            return response()->json([
                'success'  => true,
                'message'  => 'Mortgage Customer created successfully.',
                'mortgageCustomer' => $mortgageCustomer,
            ]);
        }

        return redirect()->route('mortgage-customers.index')->with('success', 'Mortgage Customer created successfully.');
    }

    public function edit(MortgageCustomer $mortgageCustomer)
    {
        return Inertia::render('Contacts/MortgageCustomers/Edit', [
            'mortgageCustomer' => $mortgageCustomer
        ]);
    }

    public function update(Request $request, MortgageCustomer $mortgageCustomer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'status' => 'required|in:active,inactive',
            'nid_number' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'attachment' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('mortgage_customers/photos', 'public');
        }

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('mortgage_customers/attachments', 'public');
        }

        $mortgageCustomer->update($validated);

        return redirect()->route('mortgage-customers.index')->with('success', 'Mortgage Customer updated successfully.');
    }

    public function destroy(MortgageCustomer $mortgageCustomer)
    {
        $mortgageCustomer->delete();
        return redirect()->route('mortgage-customers.index')->with('success', 'Mortgage Customer deleted successfully.');
    }
}
