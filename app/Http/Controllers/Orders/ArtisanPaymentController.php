<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use App\Models\ArtisanPayment;
use App\Models\Branch;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ArtisanPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = ArtisanPayment::with(['artisan', 'branch', 'order', 'creator'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('payment_no', 'like', "%{$search}%")
                  ->orWhereHas('artisan', function ($aq) use ($search) {
                      $aq->where('name', 'like', "%{$search}%")
                         ->orWhere('code', 'like', "%{$search}%");
                  });
        }

        if ($request->filled('artisan_id')) {
            $query->where('artisan_id', $request->artisan_id);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $payments = $query->paginate(15)->withQueryString();

        $artisans = Artisan::where('status', 'active')->select('id', 'name', 'code', 'phone', 'specialization', 'due_balance', 'opening_balance', 'branch_id')->get();
        $branches = Branch::select('id', 'name')->get();
        $orders = Order::select('id', 'order_no', 'product_description', 'making_charge', 'estimated_amount')->get();

        // Calculate Due Payment List for Artisans
        $duePaymentsList = Artisan::where('status', 'active')
            ->with(['branch'])
            ->get()
            ->map(function ($artisan) {
                $assignments = \App\Models\OrderAssignment::where('artisan_id', $artisan->id)->with('order')->get();
                $totalOrders = $assignments->count();

                $totalPayable = $assignments->sum(function ($asgn) {
                    return $asgn->order ? ($asgn->order->making_charge ?? $asgn->order->estimated_amount ?? 0) : 0;
                }) + ((float)$artisan->opening_balance ?? 0);

                $totalPaid = (float) ArtisanPayment::where('artisan_id', $artisan->id)->sum('amount');
                $calcDue = max(0, $totalPayable - $totalPaid);
                $dueAmount = ($artisan->due_balance > 0) ? (float)$artisan->due_balance : $calcDue;

                return [
                    'id' => $artisan->id,
                    'name' => $artisan->name,
                    'code' => $artisan->code,
                    'phone' => $artisan->phone,
                    'specialization' => $artisan->specialization,
                    'branch_id' => $artisan->branch_id,
                    'total_orders' => $totalOrders,
                    'total_payable' => (float)$totalPayable,
                    'total_paid' => (float)$totalPaid,
                    'due_amount' => (float)$dueAmount,
                ];
            });

        $stats = [
            'total_payments' => ArtisanPayment::count(),
            'total_amount' => (float) ArtisanPayment::sum('amount'),
            'today_amount' => (float) ArtisanPayment::whereDate('payment_date', now()->toDateString())->sum('amount'),
            'total_artisan_due' => (float) $duePaymentsList->sum('due_amount'),
        ];

        return Inertia::render('Orders/ArtisanPayments', [
            'payments' => $payments,
            'duePaymentsList' => $duePaymentsList,
            'artisans' => $artisans,
            'branches' => $branches,
            'orders' => $orders,
            'filters' => $request->only(['search', 'artisan_id', 'payment_method']),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'artisan_id' => 'required|exists:artisans,id',
            'branch_id' => 'required|exists:branches,id',
            'order_id' => 'nullable|exists:orders,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $dateStr = date('Ymd');
        $count = ArtisanPayment::whereDate('created_at', now()->toDateString())->count() + 1;
        $paymentNo = 'APM-' . $dateStr . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $payment = ArtisanPayment::create([
            'artisan_id' => $validated['artisan_id'],
            'branch_id' => $validated['branch_id'],
            'order_id' => $validated['order_id'] ?? null,
            'payment_no' => $paymentNo,
            'payment_date' => $validated['payment_date'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        // Deduct paid amount from artisan due balance if artisan due balance is tracked
        $artisan = Artisan::find($validated['artisan_id']);
        if ($artisan && $artisan->due_balance > 0) {
            $newDue = max(0, $artisan->due_balance - $validated['amount']);
            $artisan->update(['due_balance' => $newDue]);
        }

        return redirect()->back()->with('success', "Artisan payment {$payment->payment_no} recorded successfully!");
    }

    public function destroy(ArtisanPayment $artisanPayment)
    {
        $artisanPayment->delete();
        return redirect()->route('artisan-payments.index')->with('success', 'Payment record deleted successfully.');
    }
}
