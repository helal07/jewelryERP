<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Branch;
use App\Models\Sale;
use App\Models\SystemSetting;

class DashboardController extends Controller
{
    /**
     * Display the real-time business performance ERP dashboard.
     */
    public function __invoke(Request $request): Response
    {
        // 1. Business Summary
        $businessSummary = [
            'totalRevenue' => 4850200,
            'netProfit' => 920400,
            'vaultValue' => 18450000,
            'cashInHand' => 645800,
            'revenueTrend' => '+14.2%',
            'profitTrend' => '+8.5%',
        ];

        // 2. Daily Sales Overview
        $dailySales = [
            'todayTotal' => 478000,
            'goldSales' => 345000,
            'diamondSales' => 95000,
            'silverSales' => 38000,
            'paymentMethods' => [
                'cash' => 262900,
                'digitalCard' => 143400,
                'due' => 71700,
            ],
        ];

        // 3. Purchase Overview
        $purchaseOverview = [
            'totalAmount' => 860000,
            'rawMetalPurchases' => 650000,
            'finishedJewelryPurchases' => 210000,
            'recentPurchases' => [
                ['po' => 'PO-9982', 'supplier' => 'Standard Gold Bullion Ltd', 'amount' => '৳450,000', 'status' => 'Received'],
                ['po' => 'PO-9983', 'supplier' => 'Royal Artisan Gems', 'amount' => '৳210,000', 'status' => 'In Transit'],
                ['po' => 'PO-9984', 'supplier' => 'Chittagong Silver Mart', 'amount' => '৳200,000', 'status' => 'Payment Pending'],
            ],
        ];

        // 4. Customer Statistics
        $customerStats = [
            'totalCustomers' => 1420,
            'newToday' => 6,
            'duesReceivable' => 385000,
            'repeatRate' => '68%',
        ];

        // 5. Supplier Statistics
        $supplierStats = [
            'totalSuppliers' => 24,
            'payablesDue' => 540000,
            'pendingDeliveries' => 5,
        ];

        // 6. Inventory & Vault Status
        $inventoryStatus = [
            'goldStockBhori' => 142.5,
            'goldStockGrams' => 1661.5,
            'silverStockBhori' => 320.0,
            'silverStockGrams' => 3731.2,
            'artisanHoldingBhori' => 45.2,
            'lowStockAlerts' => [
                ['name' => '22K Gold Chain (10g)', 'stock' => '2 items', 'threshold' => '5 items'],
                ['name' => 'Diamond Ring (Solitaire)', 'stock' => '1 item', 'threshold' => '3 items'],
                ['name' => 'Silver Anklet Set', 'stock' => '4 items', 'threshold' => '10 items'],
            ],
        ];

        // 7. Recent Activities
        $recentActivities = [
            ['title' => 'New Sale Completed', 'desc' => 'Invoice #INV-202608-001 created by John Doe.', 'time' => '10 mins ago', 'badge' => '৳125,000'],
            ['title' => 'Stock Adjusted', 'desc' => 'Added 50g of 22K Gold to Artisan Stock (Babul Karigar).', 'time' => '1 hour ago', 'badge' => '+50g Gold'],
            ['title' => 'Purchase Order Received', 'desc' => 'Supplier Standard Gold Bullion delivered PO-9982.', 'time' => '2 hours ago', 'badge' => '৳450,000'],
            ['title' => 'Mortgage Payment Received', 'desc' => 'Customer XYZ paid interest for Mortgage #M-102.', 'time' => '4 hours ago', 'badge' => '৳15,000'],
        ];

        // 8. Notifications
        $notifications = [
            ['id' => 1, 'type' => 'mortgage_overdue', 'title' => 'Mortgage Interest Overdue', 'desc' => 'Customer Md. Rahman (Invoice #M-204) is 5 days overdue on interest payment (৳4,500).'],
            ['id' => 2, 'type' => 'low_stock', 'title' => 'Low 22K Gold Stock', 'desc' => '22K Gold Chain stock has fallen below threshold limit (Only 2 remaining).'],
            ['id' => 3, 'type' => 'artisan_approval', 'title' => 'Pending Job Approval', 'desc' => 'Karigar Babul submitted finished 15g Gold Bangle order #ORD-881 for inspection.'],
        ];

        // Sale Form Data for Quick New Sale modal
        $customers   = Customer::orderBy('name', 'asc')->get(['id', 'name', 'phone']);
        $products    = Product::with('purity')->where('status', 'active')->get(['id', 'name', 'sku', 'gross_weight', 'stone_weight', 'making_charge_type', 'making_charge_value', 'purity_id']);
        $branches    = Branch::where('status', 'active')->orderBy('name', 'asc')->get(['id', 'name']);
        $todayDateStr = date('Ymd');
        $todaysCount  = Sale::whereDate('created_at', date('Y-m-d'))->count() + 1;
        $autoInvoiceNo = 'INV-' . $todayDateStr . '-' . str_pad($todaysCount, 4, '0', STR_PAD_LEFT);
        $defaultVatRate = optional(SystemSetting::where('key', 'vat_rate')->first())->value ?? 5;

        return Inertia::render('Dashboard', [
            'metrics' => [
                'businessSummary' => $businessSummary,
                'dailySales'      => $dailySales,
                'purchaseOverview'=> $purchaseOverview,
                'customerStats'   => $customerStats,
                'supplierStats'   => $supplierStats,
                'inventoryStatus' => $inventoryStatus,
                'recentActivities'=> $recentActivities,
                'notifications'   => $notifications,
            ],
            'customers'      => $customers,
            'products'       => $products,
            'branches'       => $branches,
            'autoInvoiceNo'  => $autoInvoiceNo,
            'defaultVatRate' => $defaultVatRate,
        ]);
    }
}
