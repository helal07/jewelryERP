<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationSettingController extends Controller
{
    public function index()
    {
        $settings = [
            'low_stock_threshold' => SystemSetting::getByKey('low_stock_threshold', '5'),
            'enable_low_stock_alerts' => SystemSetting::getByKey('enable_low_stock_alerts', '1') === '1',
            'enable_payment_due_reminders' => SystemSetting::getByKey('enable_payment_due_reminders', '1') === '1',
            'enable_daily_summary_email' => SystemSetting::getByKey('enable_daily_summary_email', '0') === '1',
            'summary_recipient_email' => SystemSetting::getByKey('summary_recipient_email', 'admin@jewelryerp.com'),
            'sms_gateway_active' => SystemSetting::getByKey('sms_gateway_active', '0') === '1',
            'sms_api_key' => SystemSetting::getByKey('sms_api_key', ''),
            'sms_sender_id' => SystemSetting::getByKey('sms_sender_id', 'JEWELRYERP'),
            'customer_order_notification' => SystemSetting::getByKey('customer_order_notification', '1') === '1',
            'sales_notification' => SystemSetting::getByKey('sales_notification', '1') === '1',
            'payment_received_notification' => SystemSetting::getByKey('payment_received_notification', '1') === '1',
            'sales_return_notification' => SystemSetting::getByKey('sales_return_notification', '1') === '1',
        ];

        return Inertia::render('Settings/Notifications/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'low_stock_threshold' => 'required|numeric|min:0',
            'enable_low_stock_alerts' => 'boolean',
            'enable_payment_due_reminders' => 'boolean',
            'enable_daily_summary_email' => 'boolean',
            'summary_recipient_email' => 'nullable|email',
            'sms_gateway_active' => 'boolean',
            'sms_api_key' => 'nullable|string',
            'sms_sender_id' => 'nullable|string',
            'customer_order_notification' => 'boolean',
            'sales_notification' => 'boolean',
            'payment_received_notification' => 'boolean',
            'sales_return_notification' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            $val = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
            SystemSetting::setByKey($key, $val, 'notifications');
        }

        return redirect()->route('settings.notifications.index')
            ->with('success', 'Notification settings saved successfully.');
    }
}
