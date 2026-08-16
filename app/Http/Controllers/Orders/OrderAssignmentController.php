<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Models\Artisan;
use App\Models\Order;
use App\Models\OrderAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = OrderAssignment::with(['order.customer', 'order.purity', 'order.product', 'artisan'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('order', function ($oq) use ($search) {
                    $oq->where('order_no', 'like', "%{$search}%")
                      ->orWhere('product_name', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%")
                      ->orWhere('product_description', 'like', "%{$search}%")
                      ->orWhereHas('customer', function ($cq) use ($search) {
                          $cq->where('name', 'like', "%{$search}%")
                             ->orWhere('phone', 'like', "%{$search}%");
                      });
                })->orWhereHas('artisan', function ($aq) use ($search) {
                    $aq->where('name', 'like', "%{$search}%")
                       ->orWhere('code', 'like', "%{$search}%")
                       ->orWhere('specialization', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('artisan_id')) {
            $query->where('artisan_id', $request->artisan_id);
        }

        $assignments = $query->paginate(15)->withQueryString();

        // Orders that can be assigned (status: new or assigned)
        $unassignedOrders = Order::with(['customer', 'purity'])
            ->whereIn('status', ['new', 'assigned'])
            ->orderBy('id', 'desc')
            ->get();

        $artisans = Artisan::where('status', 'active')
            ->select('id', 'name', 'code', 'phone', 'specialization', 'rate')
            ->get();

        $stats = [
            'total_assignments' => OrderAssignment::count(),
            'assigned' => OrderAssignment::where('status', 'assigned')->count(),
            'in_progress' => OrderAssignment::where('status', 'in_progress')->count(),
            'completed' => OrderAssignment::where('status', 'completed')->count(),
        ];

        return Inertia::render('Orders/Assignments', [
            'assignments' => $assignments,
            'unassignedOrders' => $unassignedOrders,
            'artisans' => $artisans,
            'filters' => $request->only(['search', 'status', 'artisan_id']),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'artisan_id' => 'required|exists:artisans,id',
            'assigned_date' => 'required|date',
            'expected_completion_date' => 'nullable|date|after_or_equal:assigned_date',
            'instructions' => 'nullable|string',
        ]);

        $assignment = OrderAssignment::create([
            'order_id' => $validated['order_id'],
            'artisan_id' => $validated['artisan_id'],
            'assigned_date' => $validated['assigned_date'],
            'expected_completion_date' => $validated['expected_completion_date'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'status' => 'assigned',
        ]);

        // Update Order status
        $order = Order::findOrFail($validated['order_id']);
        if ($order->status === 'new') {
            $order->update(['status' => 'assigned']);
        }

        return redirect()->route('orders.assignments')->with('success', "Order {$order->order_no} assigned to artisan successfully!");
    }

    public function updateStatus(Request $request, OrderAssignment $assignment)
    {
        $validated = $request->validate([
            'status' => 'required|in:assigned,in_progress,completed,rejected',
        ]);

        $assignment->update(['status' => $validated['status']]);

        // Sync main order status
        $order = $assignment->order;
        if ($order) {
            if ($validated['status'] === 'in_progress') {
                $order->update(['status' => 'in_production']);
            } elseif ($validated['status'] === 'completed') {
                $order->update(['status' => 'ready']);
            }
        }

        return redirect()->route('orders.assignments')->with('success', 'Assignment status updated successfully!');
    }
}
