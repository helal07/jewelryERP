import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { 
    Landmark, Save, CheckCircle2, Banknote, Building2, PiggyBank, 
    TrendingUp, ShoppingCart, Home, Plus, Calendar, 
    FileText, Trash2, ListPlus, Sliders, Wallet, ShieldAlert, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

function AccountSelectRow({ label, description, value, onChange, options, placeholder }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{label}</label>
            <p className="text-[11px] text-gray-400 mb-2">{description}</p>
            <select
                value={value}
                onChange={onChange}
                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
            >
                <option value="">{placeholder}</option>
                {options.map(acc => (
                    <option key={acc.id} value={acc.id}>
                        {acc.code} — {acc.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

const fmtBDT = (val) =>
    Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const accountTypeBadge = (type) => {
    switch (type) {
        case 'asset':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'liability':
            return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'equity':
            return 'bg-amber-50 text-amber-800 border-amber-200';
        case 'income':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'expense':
            return 'bg-purple-50 text-purple-700 border-purple-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const ACCOUNT_TYPES = [
    { key: 'asset', label: 'Asset', icon: Wallet },
    { key: 'liability', label: 'Liability', icon: ShieldAlert },
    { key: 'equity', label: 'Equity', icon: Landmark },
    { key: 'income', label: 'Income', icon: ArrowUpRight },
    { key: 'expense', label: 'Expense', icon: ArrowDownLeft },
];

export default function Index({ accounts = [], openingAccounts = {}, openingBalances = [] }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('balances'); // 'balances' | 'mappings'

    // Form for System Account Mapping
    const mappingForm = useForm({
        default_cash_account_id: openingAccounts.default_cash_account_id || '',
        default_bank_account_id: openingAccounts.default_bank_account_id || '',
        default_capital_account_id: openingAccounts.default_capital_account_id || '',
        default_sales_income_account_id: openingAccounts.default_sales_income_account_id || '',
        default_purchase_expense_account_id: openingAccounts.default_purchase_expense_account_id || '',
        default_mortgage_account_id: openingAccounts.default_mortgage_account_id || '',
    });

    // Form for New Opening Balance Entry
    const balanceForm = useForm({
        date: new Date().toISOString().split('T')[0],
        account_type: 'asset',
        chart_of_account_id: '',
        amount: '',
        note: '',
    });

    const handleMappingSubmit = (e) => {
        e.preventDefault();
        mappingForm.post(route('settings.opening-accounts.update'));
    };

    const handleBalanceSubmit = (e) => {
        e.preventDefault();
        balanceForm.post(route('settings.opening-accounts.store-balance'), {
            onSuccess: () => {
                balanceForm.reset('amount', 'note');
            },
        });
    };

    const handleDeleteBalance = (id) => {
        if (confirm('Are you sure you want to delete this opening balance record?')) {
            router.delete(route('settings.opening-accounts.destroy-balance', id));
        }
    };

    const filteredAccounts = accounts.filter(acc => 
        !balanceForm.data.account_type || acc.account_type === balanceForm.data.account_type
    );

    const assetAccounts   = accounts.filter(a => a.account_type === 'asset');
    const equityAccounts  = accounts.filter(a => a.account_type === 'equity');
    const incomeAccounts  = accounts.filter(a => a.account_type === 'income');
    const expenseAccounts = accounts.filter(a => a.account_type === 'expense');

    const totalOpeningAmount = openingBalances.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Landmark className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('openingAccounts') || 'Opening Accounts'}
                    </h2>

                    {/* Navigation Tabs */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200/80 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setActiveTab('balances')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'balances'
                                    ? 'text-white shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                            style={activeTab === 'balances' ? { backgroundColor: 'rgb(177, 118, 51)' } : {}}
                        >
                            <ListPlus className="w-3.5 h-3.5" />
                            Balances ({openingBalances.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('mappings')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'mappings'
                                    ? 'text-white shadow-2xs'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                            style={activeTab === 'mappings' ? { backgroundColor: 'rgb(177, 118, 51)' } : {}}
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            Mappings
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Opening Accounts" />

            <div className="max-w-4xl space-y-6">
                {flash?.success && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* TAB 1: OPENING BALANCES */}
                {activeTab === 'balances' && (
                    <div className="space-y-6">
                        {/* Entry Form Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                                <h3 className="text-xs font-bold text-gray-700 uppercase">Set Opening Balance</h3>
                                <span className="text-xs font-bold text-amber-900">Total: ৳ {fmtBDT(totalOpeningAmount)}</span>
                            </div>

                            <form onSubmit={handleBalanceSubmit} className="p-5 space-y-4">
                                {/* Account Type Pills */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                                        Account Type *
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {ACCOUNT_TYPES.map((type) => {
                                            const isSelected = balanceForm.data.account_type === type.key;
                                            const TypeIcon = type.icon;
                                            return (
                                                <button
                                                    key={type.key}
                                                    type="button"
                                                    onClick={() => {
                                                        balanceForm.setData(data => ({
                                                            ...data,
                                                            account_type: type.key,
                                                            chart_of_account_id: '',
                                                        }));
                                                    }}
                                                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                                        isSelected
                                                            ? 'text-white shadow-2xs'
                                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                    style={isSelected ? { backgroundColor: 'rgb(177, 118, 51)', borderColor: 'rgb(177, 118, 51)' } : {}}
                                                >
                                                    <TypeIcon className="w-3.5 h-3.5" />
                                                    {type.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date *</label>
                                        <input
                                            type="date"
                                            value={balanceForm.data.date}
                                            onChange={(e) => balanceForm.setData('date', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        />
                                        {balanceForm.errors.date && <p className="text-xs text-rose-500 mt-1">{balanceForm.errors.date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Account *</label>
                                        <select
                                            value={balanceForm.data.chart_of_account_id}
                                            onChange={(e) => balanceForm.setData('chart_of_account_id', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        >
                                            <option value="">Select Account</option>
                                            {filteredAccounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.code} — {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                        {balanceForm.errors.chart_of_account_id && <p className="text-xs text-rose-500 mt-1">{balanceForm.errors.chart_of_account_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (BDT) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={balanceForm.data.amount}
                                            onChange={(e) => balanceForm.setData('amount', e.target.value)}
                                            className="w-full text-sm font-bold text-amber-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            placeholder="0.00"
                                            required
                                        />
                                        {balanceForm.errors.amount && <p className="text-xs text-rose-500 mt-1">{balanceForm.errors.amount}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Note</label>
                                    <input
                                        type="text"
                                        value={balanceForm.data.note}
                                        onChange={(e) => balanceForm.setData('note', e.target.value)}
                                        className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                        placeholder="Optional remark"
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={balanceForm.processing}
                                        className="px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                    >
                                        <Save className="w-4 h-4" /> Save Balance
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Recorded Balances Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Account</th>
                                            <th className="py-3 px-4">Type</th>
                                            <th className="py-3 px-4 text-right">Amount</th>
                                            <th className="py-3 px-4">Note</th>
                                            <th className="py-3 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {openingBalances.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                                                    {item.date}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-gray-900">
                                                        {item.chart_of_account?.name || '-'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 font-mono">
                                                        {item.chart_of_account?.code || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${accountTypeBadge(item.account_type)}`}>
                                                        {item.account_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-black text-amber-900">
                                                    ৳ {fmtBDT(item.amount)}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 text-xs truncate max-w-xs">
                                                    {item.note || '—'}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteBalance(item.id)}
                                                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {openingBalances.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="py-10 text-center text-gray-400">
                                                    No opening balances recorded yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: SYSTEM MAPPINGS */}
                {activeTab === 'mappings' && (
                    <form onSubmit={handleMappingSubmit} className="space-y-5">
                        {/* Cash & Bank */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <h3 className="text-xs font-bold text-gray-700 uppercase">Cash & Bank Accounts</h3>
                            <AccountSelectRow
                                label="Default Cash Account"
                                description="Used for cash sales and cash receipts"
                                value={mappingForm.data.default_cash_account_id}
                                onChange={(e) => mappingForm.setData('default_cash_account_id', e.target.value)}
                                options={assetAccounts}
                                placeholder="Select Cash Account"
                            />
                            <AccountSelectRow
                                label="Default Bank Account"
                                description="Used for cheque payments and bank transfers"
                                value={mappingForm.data.default_bank_account_id}
                                onChange={(e) => mappingForm.setData('default_bank_account_id', e.target.value)}
                                options={assetAccounts}
                                placeholder="Select Bank Account"
                            />
                        </div>

                        {/* Capital & Revenue */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <h3 className="text-xs font-bold text-gray-700 uppercase">Capital & Revenue Accounts</h3>
                            <AccountSelectRow
                                label="Owner Capital Account"
                                description="Equity account representing owner capital"
                                value={mappingForm.data.default_capital_account_id}
                                onChange={(e) => mappingForm.setData('default_capital_account_id', e.target.value)}
                                options={equityAccounts}
                                placeholder="Select Equity Account"
                            />
                            <AccountSelectRow
                                label="Sales Revenue Account"
                                description="Income account credited for sales"
                                value={mappingForm.data.default_sales_income_account_id}
                                onChange={(e) => mappingForm.setData('default_sales_income_account_id', e.target.value)}
                                options={incomeAccounts}
                                placeholder="Select Income Account"
                            />
                        </div>

                        {/* Expense & Liabilities */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <h3 className="text-xs font-bold text-gray-700 uppercase">Expense & Liabilities</h3>
                            <AccountSelectRow
                                label="Purchase Expense Account"
                                description="Expense account debited when purchasing stock"
                                value={mappingForm.data.default_purchase_expense_account_id}
                                onChange={(e) => mappingForm.setData('default_purchase_expense_account_id', e.target.value)}
                                options={expenseAccounts}
                                placeholder="Select Expense Account"
                            />
                            <AccountSelectRow
                                label="Mortgage Account"
                                description="Account used for mortgage loans"
                                value={mappingForm.data.default_mortgage_account_id}
                                onChange={(e) => mappingForm.setData('default_mortgage_account_id', e.target.value)}
                                options={accounts}
                                placeholder="Select Account"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={mappingForm.processing}
                                className="px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                                style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                            >
                                <Save className="w-4 h-4" /> Save Mappings
                            </button>

                            {mappingForm.recentlySuccessful && (
                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                    <CheckCircle2 className="w-4 h-4" /> Mappings Saved!
                                </span>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
