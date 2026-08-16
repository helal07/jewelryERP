<?php

namespace App\Http\Controllers;

use App\Models\Mortgage;
use App\Models\MortgagePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MortgagePaymentController extends Controller
{
    public function store(Request $request, Mortgage $mortgage)
    {
        $validated = $request->validate([
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_type' => 'required|string|in:interest,principal,penalty,other',
            'notes' => 'nullable|string',
        ]);

        $mortgage->payments()->create([
            'payment_date' => $validated['payment_date'],
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Payment recorded successfully!');
    }

    public function destroy(Mortgage $mortgage, MortgagePayment $payment)
    {
        $payment->delete();
        return redirect()->back()->with('success', 'Payment deleted successfully!');
    }
}
