<?php

namespace App\Http\Controllers\Contacts;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::latest()->paginate(10);
        return Inertia::render('Contacts/Customers/Index', [
            'customers' => $customers
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/Customers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255|unique:customers,phone',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'nid_number' => 'nullable|string|max:255',
            'opening_balance' => 'nullable|numeric|min:0',
            'credit_limit' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'photo' => 'nullable|image|max:2048',
            'attachment' => 'nullable|file|max:5120',
        ]);

        // Handle File Uploads
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('customers/photos', 'public');
        }

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('customers/attachments', 'public');
        }

        // Additional necessary defaults for creation
        $validated['branch_id'] = $request->input('branch_id') ?: 1;
        $validated['code'] = 'CUST-' . strtoupper(uniqid());
        $validated['created_by'] = $request->user() ? $request->user()->id : 1;
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['opening_balance'] = isset($validated['opening_balance']) && $validated['opening_balance'] !== '' ? $validated['opening_balance'] : 0;
        $validated['due_balance'] = $validated['opening_balance'];
        $validated['credit_limit'] = isset($validated['credit_limit']) && $validated['credit_limit'] !== '' ? $validated['credit_limit'] : 0;

        $customer = Customer::create($validated);

        if (!$request->header('X-Inertia') && ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest' || $request->expectsJson())) {
            return response()->json(['success' => true, 'customer' => $customer]);
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function show(Customer $customer)
    {
        return Inertia::render('Contacts/Customers/Show', [
            'customer' => $customer
        ]);
    }
}
