<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalePaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = SalePayment::with(['sale.customer', 'customer', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('payment_no', 'like', "%{$search}%")
                  ->orWhere('reference_no', 'like', "%{$search}%")
                  ->orWhereHas('sale', function ($sq) use ($search) {
                      $sq->where('invoice_no', 'like', "%{$search}%");
                  })
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('payment_date', $request->input('date'));
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Sales with due amount
        $dueSales = Sale::with('customer')
            ->where('due_amount', '>', 0)
            ->orderBy('id', 'desc')
            ->get();

        $totalCollected = (float) SalePayment::sum('amount');
        $totalOutstandingDue = (float) Sale::where('due_amount', '>', 0)->sum('due_amount');
        $dueCustomersCount = Sale::where('due_amount', '>', 0)->distinct('customer_id')->count('customer_id');

        return Inertia::render('Sales/Payments/Index', [
            'payments' => $payments,
            'dueSales' => $dueSales,
            'stats' => [
                'total_collected' => $totalCollected,
                'outstanding_due' => $totalOutstandingDue,
                'due_customers_count' => $dueCustomersCount,
            ],
            'filters' => $request->only(['search', 'date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sale_id' => 'required|exists:sales,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,bank,card,mobile_money',
            'reference_no' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:255',
        ]);

        $sale = Sale::findOrFail($validated['sale_id']);

        if ($validated['amount'] > $sale->due_amount) {
            return redirect()->back()->withErrors(['amount' => "Payment amount cannot exceed remaining due (৳{$sale->due_amount})."]);
        }

        DB::transaction(function () use ($validated, $sale) {
            $paymentNo = 'SPAY-' . date('Ymd') . '-' . str_pad(SalePayment::count() + 1, 4, '0', STR_PAD_LEFT);

            SalePayment::create([
                'payment_no' => $paymentNo,
                'sale_id' => $sale->id,
                'customer_id' => $sale->customer_id ?: 1,
                'branch_id' => $sale->branch_id ?: 1,
                'payment_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id() ?: 1,
            ]);

            $newPaid = $sale->paid_amount + $validated['amount'];
            $newDue = max(0, $sale->grand_total - $newPaid);
            $newStatus = $newDue <= 0 ? 'completed' : 'pending';

            $sale->update([
                'paid_amount' => $newPaid,
                'due_amount' => $newDue,
                'status' => $newStatus,
            ]);
        });

        return redirect()->back()->with('success', 'Customer payment recorded successfully.');
    }

    public function destroy(SalePayment $payment)
    {
        DB::transaction(function () use ($payment) {
            $sale = $payment->sale;
            if ($sale) {
                $newPaid = max(0, $sale->paid_amount - $payment->amount);
                $newDue = max(0, $sale->grand_total - $newPaid);
                $sale->update([
                    'paid_amount' => $newPaid,
                    'due_amount' => $newDue,
                    'status' => $newDue <= 0 ? 'completed' : 'pending',
                ]);
            }
            $payment->delete();
        });

        return redirect()->back()->with('success', 'Payment deleted and sale balance reverted.');
    }
}
