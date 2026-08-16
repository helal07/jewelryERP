<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountConfigurationController extends Controller
{
    public function index(Request $request)
    {
        $isMainBranch = $request->user()->isMainBranch();

        $config = [
            // Company Information
            'company_name' => SystemSetting::getByKey('company_name', 'Jewelry ERP Limited'),
            'company_phone' => SystemSetting::getByKey('company_phone', '+880 1700-000000'),
            'company_email' => SystemSetting::getByKey('company_email', 'info@jewelryerp.com'),
            'company_address' => SystemSetting::getByKey('company_address', 'Dhaka, Bangladesh'),
            'company_trade_license' => SystemSetting::getByKey('company_trade_license', 'TRAD/DNCC/012345/2026'),
            'company_tagline' => SystemSetting::getByKey('company_tagline', 'Fine Gold & Diamond Craftsman'),

            // Financial & Prefixes
            'financial_year_start' => SystemSetting::getByKey('financial_year_start', '1'), // 1 = January
            'currency_code' => SystemSetting::getByKey('currency_code', 'BDT'),
            'currency_symbol' => SystemSetting::getByKey('currency_symbol', '৳'),
            'default_vat_rate' => SystemSetting::getByKey('default_vat_rate', '5.00'),
            'invoice_prefix' => SystemSetting::getByKey('invoice_prefix', 'INV-'),
            'purchase_prefix' => SystemSetting::getByKey('purchase_prefix', 'PUR-'),
            'order_prefix' => SystemSetting::getByKey('order_prefix', 'ORD-'),
            'mortgage_prefix' => SystemSetting::getByKey('mortgage_prefix', 'MORT-'),
            'receipt_footer_text' => SystemSetting::getByKey('receipt_footer_text', 'Thank you for buying from Jewelry ERP. All gold products are certified.'),
        ];

        return Inertia::render('Settings/AccountConfig/Index', [
            'config' => $config,
            'is_main_branch' => $isMainBranch,
        ]);
    }

    public function update(Request $request)
    {
        if (!$request->user()->isMainBranch()) {
            return redirect()->route('settings.account-config.index')
                ->with('error', 'Only the Main Branch (Head Office) is authorized to update company information and software configuration.');
        }

        $validated = $request->validate([
            // Company Information
            'company_name' => 'nullable|string|max:255',
            'company_phone' => 'nullable|string|max:50',
            'company_email' => 'nullable|email|max:255',
            'company_address' => 'nullable|string|max:500',
            'company_trade_license' => 'nullable|string|max:100',
            'company_tagline' => 'nullable|string|max:255',

            // Financial & Document Prefixes
            'financial_year_start' => 'required|numeric|min:1|max:12',
            'currency_code' => 'required|string|max:10',
            'currency_symbol' => 'required|string|max:10',
            'default_vat_rate' => 'required|numeric|min:0|max:100',
            'invoice_prefix' => 'required|string|max:15',
            'purchase_prefix' => 'required|string|max:15',
            'order_prefix' => 'required|string|max:15',
            'mortgage_prefix' => 'required|string|max:15',
            'receipt_footer_text' => 'nullable|string|max:500',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                SystemSetting::setByKey($key, (string) $value, 'account_config');
            }
        }

        return redirect()->route('settings.account-config.index')
            ->with('success', 'Company information & account configuration updated successfully.');
    }
}
