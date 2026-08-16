import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Sliders, Save, CheckCircle2, Calendar, DollarSign, Percent, 
    FileText, Hash, Receipt, Building2, Phone, Mail, MapPin, Award, ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

function ConfigSectionCard({ icon: Icon, title, children }) {
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

export default function Index({ config = {}, is_main_branch }) {
    const { t } = useLanguage();
    const { flash, auth } = usePage().props;
    const canManageConfig = is_main_branch ?? auth?.is_main_branch ?? true;

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        // Company Information
        company_name: config.company_name || '',
        company_phone: config.company_phone || '',
        company_email: config.company_email || '',
        company_address: config.company_address || '',
        company_trade_license: config.company_trade_license || '',
        company_tagline: config.company_tagline || '',

        // Financial & Document Prefixes
        financial_year_start: config.financial_year_start || '1',
        currency_code: config.currency_code || 'BDT',
        currency_symbol: config.currency_symbol || '৳',
        default_vat_rate: config.default_vat_rate || '5.00',
        invoice_prefix: config.invoice_prefix || 'INV-',
        purchase_prefix: config.purchase_prefix || 'PUR-',
        order_prefix: config.order_prefix || 'ORD-',
        mortgage_prefix: config.mortgage_prefix || 'MORT-',
        receipt_footer_text: config.receipt_footer_text || '',
    });

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canManageConfig) return;
        post(route('settings.account-config.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Sliders className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('accountConfig') || 'Account Configuration'}
                    </h2>

                    {!canManageConfig && (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-amber-700" />
                            Main Branch Edit Only
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Account Configuration" />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* 1. Company Information Card */}
                <ConfigSectionCard
                    icon={Building2}
                    title="Company Information"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                required
                            />
                            {errors.company_name && <p className="text-xs text-rose-600 mt-1">{errors.company_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Trade License No
                            </label>
                            <input
                                type="text"
                                value={data.company_trade_license}
                                onChange={(e) => setData('company_trade_license', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-semibold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="e.g. TRAD/DNCC/012345/2026"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Hotline / Phone
                            </label>
                            <input
                                type="text"
                                value={data.company_phone}
                                onChange={(e) => setData('company_phone', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-semibold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="+880 1XXXXXXXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Official Email
                            </label>
                            <input
                                type="email"
                                value={data.company_email}
                                onChange={(e) => setData('company_email', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-semibold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="info@company.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Company Address
                            </label>
                            <input
                                type="text"
                                value={data.company_address}
                                onChange={(e) => setData('company_address', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-medium text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="HQ Address"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Tagline / Slogan
                            </label>
                            <input
                                type="text"
                                value={data.company_tagline}
                                onChange={(e) => setData('company_tagline', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-medium text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="e.g. Fine Gold & Diamond Craftsman"
                            />
                        </div>
                    </div>
                </ConfigSectionCard>

                {/* 2. Financial & Tax Settings Card */}
                <ConfigSectionCard
                    icon={Calendar}
                    title="Financial & Tax Settings"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Financial Year Start *
                            </label>
                            <select
                                value={data.financial_year_start}
                                onChange={(e) => setData('financial_year_start', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                required
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Currency Symbol *
                            </label>
                            <input
                                type="text"
                                value={data.currency_symbol}
                                onChange={(e) => setData('currency_symbol', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="৳"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Default VAT Rate (%) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.default_vat_rate}
                                onChange={(e) => setData('default_vat_rate', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="5.00"
                                required
                            />
                        </div>
                    </div>
                </ConfigSectionCard>

                {/* 3. Document Numbering Prefixes Card */}
                <ConfigSectionCard
                    icon={Hash}
                    title="Document Numbering Prefixes"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Sales Invoice Prefix *
                            </label>
                            <input
                                type="text"
                                value={data.invoice_prefix}
                                onChange={(e) => setData('invoice_prefix', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-mono font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="INV-"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Purchase Prefix *
                            </label>
                            <input
                                type="text"
                                value={data.purchase_prefix}
                                onChange={(e) => setData('purchase_prefix', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-mono font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="PUR-"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Custom Order Prefix *
                            </label>
                            <input
                                type="text"
                                value={data.order_prefix}
                                onChange={(e) => setData('order_prefix', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-mono font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="ORD-"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Mortgage Loan Prefix *
                            </label>
                            <input
                                type="text"
                                value={data.mortgage_prefix}
                                onChange={(e) => setData('mortgage_prefix', e.target.value)}
                                disabled={!canManageConfig}
                                className="w-full text-sm font-mono font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
                                placeholder="MORT-"
                                required
                            />
                        </div>
                    </div>
                </ConfigSectionCard>

                {/* 4. Receipt Footer Card */}
                <ConfigSectionCard
                    icon={Receipt}
                    title="Invoice & Receipt Footer"
                >
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Receipt Footer Terms / Note
                        </label>
                        <textarea
                            value={data.receipt_footer_text}
                            onChange={(e) => setData('receipt_footer_text', e.target.value)}
                            disabled={!canManageConfig}
                            className="w-full rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm p-3 disabled:bg-gray-50 disabled:text-gray-500"
                            rows="3"
                            placeholder="e.g. Thank you for your purchase. Hallmarked gold guaranteed."
                        />
                    </div>
                </ConfigSectionCard>

                {/* Submit Button */}
                {canManageConfig && (
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        >
                            <Save className="w-4 h-4" />
                            Save Configuration
                        </button>

                        {(recentlySuccessful || flash?.success) && (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4" />
                                Configuration Saved!
                            </span>
                        )}
                    </div>
                )}
            </form>
        </AuthenticatedLayout>
    );
}
