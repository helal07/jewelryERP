import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Bell, Save, CheckCircle2, PackageSearch, Mail, MessageSquare, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

function ToggleSwitch({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                checked ? 'bg-amber-600' : 'bg-gray-200'
            }`}
            style={checked ? { backgroundColor: 'rgb(177, 118, 51)' } : {}}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
}

function SectionCard({ icon: Icon, title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            </div>
            <div className="p-5 space-y-4">
                {children}
            </div>
        </div>
    );
}

function ToggleRow({ label, description, checked, onChange }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
            <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-gray-800">{label}</span>
                <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
            </div>
            <ToggleSwitch checked={checked} onChange={onChange} />
        </div>
    );
}

export default function Index({ settings }) {
    const { t } = useLanguage();
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        low_stock_threshold: settings.low_stock_threshold || '5',
        enable_low_stock_alerts: settings.enable_low_stock_alerts ?? true,
        enable_payment_due_reminders: settings.enable_payment_due_reminders ?? true,
        enable_daily_summary_email: settings.enable_daily_summary_email ?? false,
        summary_recipient_email: settings.summary_recipient_email || '',
        sms_gateway_active: settings.sms_gateway_active ?? false,
        sms_api_key: settings.sms_api_key || '',
        sms_sender_id: settings.sms_sender_id || 'JEWELRYERP',
        customer_order_notification: settings.customer_order_notification ?? true,
        sales_notification: settings.sales_notification ?? true,
        payment_received_notification: settings.payment_received_notification ?? true,
        sales_return_notification: settings.sales_return_notification ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.notifications.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Bell className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('notificationSettings') || 'Notification Settings'}
                    </h2>
                </div>
            }
        >
            <Head title="Notification Settings" />

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
                {/* Stock & Payment Alert Rules */}
                <SectionCard
                    icon={PackageSearch}
                    title="Stock & Payment Alerts"
                >
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Low Stock Threshold *
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="w-36">
                                <input
                                    type="number"
                                    min="0"
                                    value={data.low_stock_threshold}
                                    onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                    className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 font-bold"
                                />
                            </div>
                            <span className="text-xs text-gray-500 font-semibold">units</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden p-2 bg-gray-50/40">
                        <ToggleRow
                            label="Enable Low Stock Alerts"
                            description="Notify dashboard when item stock drops below threshold"
                            checked={data.enable_low_stock_alerts}
                            onChange={(val) => setData('enable_low_stock_alerts', val)}
                        />
                        <ToggleRow
                            label="Enable Payment Due Reminders"
                            description="Auto-generate reminders for overdue mortgage & credit balances"
                            checked={data.enable_payment_due_reminders}
                            onChange={(val) => setData('enable_payment_due_reminders', val)}
                        />
                    </div>
                </SectionCard>

                {/* Automated Email Reports */}
                <SectionCard
                    icon={Mail}
                    title="Automated Email Reports"
                >
                    <ToggleRow
                        label="Enable Daily Sales Summary Email"
                        description="Send automated daily sales digest at end of business day"
                        checked={data.enable_daily_summary_email}
                        onChange={(val) => setData('enable_daily_summary_email', val)}
                    />

                    {data.enable_daily_summary_email && (
                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Recipient Email Address *
                            </label>
                            <input
                                type="email"
                                value={data.summary_recipient_email}
                                onChange={(e) => setData('summary_recipient_email', e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="owner@jewelrystore.com"
                            />
                        </div>
                    )}
                </SectionCard>

                {/* SMS Gateway */}
                <SectionCard
                    icon={MessageSquare}
                    title="SMS Gateway"
                >
                    <ToggleRow
                        label="Enable SMS Notifications"
                        description="Send SMS receipts to customers on sale completion and payments"
                        checked={data.sms_gateway_active}
                        onChange={(val) => setData('sms_gateway_active', val)}
                    />

                    {data.sms_gateway_active && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    SMS API Key *
                                </label>
                                <input
                                    type="password"
                                    value={data.sms_api_key}
                                    onChange={(e) => setData('sms_api_key', e.target.value)}
                                    className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Enter API Key"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Sender Masking ID
                                </label>
                                <input
                                    type="text"
                                    value={data.sms_sender_id}
                                    onChange={(e) => setData('sms_sender_id', e.target.value)}
                                    className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="e.g. JEWELRYERP"
                                />
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* Business Event Notifications */}
                <SectionCard
                    icon={ShoppingBag}
                    title="Business Event Notifications"
                >
                    <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden p-2 bg-gray-50/40">
                        <ToggleRow
                            label="Customer Order Notification"
                            description="Trigger an alert whenever a new customer order is placed"
                            checked={data.customer_order_notification}
                            onChange={(val) => setData('customer_order_notification', val)}
                        />
                        <ToggleRow
                            label="Sales Notification"
                            description="Send a notification when a sale is recorded"
                            checked={data.sales_notification}
                            onChange={(val) => setData('sales_notification', val)}
                        />
                        <ToggleRow
                            label="Payment Received Notification"
                            description="Alert when a customer payment or instalment is received"
                            checked={data.payment_received_notification}
                            onChange={(val) => setData('payment_received_notification', val)}
                        />
                        <ToggleRow
                            label="Sales Return Notification"
                            description="Notify when a sales return or refund request is submitted"
                            checked={data.sales_return_notification}
                            onChange={(val) => setData('sales_return_notification', val)}
                        />
                    </div>
                </SectionCard>

                {/* Save Button */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Save className="w-4 h-4" />
                        Save Settings
                    </button>

                    {recentlySuccessful && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            Settings Saved!
                        </span>
                    )}
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
