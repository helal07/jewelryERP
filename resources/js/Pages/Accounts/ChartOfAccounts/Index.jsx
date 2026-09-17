import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { Plus, Trash2, Edit2, FolderTree, Search, RotateCcw, CornerDownRight, CheckCircle2, XCircle, X } from 'lucide-react';

export default function Index({ accounts, allAccounts = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

    const cleanNumber = (val) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        if (/^0+[0-9]/.test(str)) {
            str = str.replace(/^0+/, '');
        }
        return str;
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editAccount, setEditAccount] = useState(null);

    const [search, setSearch] = useState(filters.search || '');
    const [accountType, setAccountType] = useState(filters.account_type || '');

    useFilter(route('accounts.chart-of-accounts.index'), {
        search,
        account_type: accountType,
    });

    const handleReset = () => {
        setSearch('');
        setAccountType('');
    };

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        account_type: 'asset',
        parent_id: '',
        opening_balance: '',
        description: '',
        is_active: true,
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditAccount(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (account) => {
        clearErrors();
        setEditAccount(account);
        setData({
            code: account.code || '',
            name: account.name || '',
            account_type: account.account_type || 'asset',
            parent_id: account.parent_id || '',
            opening_balance: account.opening_balance || '',
            description: account.description || '',
            is_active: account.is_active ?? true,
        });
        setIsCreateOpen(true);
    };

    const closeModal = () => {
        setIsCreateOpen(false);
        setEditAccount(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editAccount) {
            put(route('accounts.chart-of-accounts.update', editAccount.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('accounts.chart-of-accounts.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm(isBn ? 'আপনি কি নিশ্চিত যে আপনি এই অ্যাকাউন্ট মুছে ফেলতে চান?' : 'Are you sure you want to delete this account?')) {
            router.delete(route('accounts.chart-of-accounts.destroy', id));
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'asset': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'liability': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'equity': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'income': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'expense': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getTypeLabel = (type) => {
        if (!isBn) return type;
        switch (type) {
            case 'asset': return 'সম্পদ (Asset)';
            case 'liability': return 'দায় (Liability)';
            case 'equity': return 'মালিকানাস্বত্ব (Equity)';
            case 'income': return 'আয় (Income)';
            case 'expense': return 'ব্যয় (Expense)';
            default: return type;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <FolderTree className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'হিসাবের তালিকা' : 'Chart of Accounts'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'লেজার অ্যাকাউন্ট, সাব-ক্যাটেগরি ও প্রারম্ভিক জের পরিচালনা করুন' : 'Manage general ledger accounts, parent relationships & opening balances'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন অ্যাকাউন্ট' : 'Add New Account'}</span>
                    </button>
                </div>
            }
        >
            <Head title={isBn ? 'হিসাবের তালিকা' : 'Chart of Accounts'} />

            <div className="space-y-4">
                {/* Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isBn ? 'কোড বা অ্যাকাউন্টের নাম দিয়ে খুঁজুন...' : 'Search by code or account name...'}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>

                        <div className="w-48">
                            <select
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                                className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="">{isBn ? 'সকল অ্যাকাউন্টের ধরন' : 'All Account Types'}</option>
                                <option value="asset">{isBn ? 'সম্পদ (Asset)' : 'Asset'}</option>
                                <option value="liability">{isBn ? 'দায় (Liability)' : 'Liability'}</option>
                                <option value="equity">{isBn ? 'মালিকানাস্বত্ব (Equity)' : 'Equity'}</option>
                                <option value="income">{isBn ? 'আয় (Income)' : 'Income'}</option>
                                <option value="expense">{isBn ? 'ব্যয় (Expense)' : 'Expense'}</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> {isBn ? 'রিসেট' : 'Clear'}
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কোড' : 'Code'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অ্যাকাউন্টের নাম' : 'Account Name'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ধরন' : 'Type'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মূল অ্যাকাউন্ট' : 'Parent Account'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'বিবরণ' : 'Description'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'প্রারম্ভিক জের' : 'Opening Balance'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {accounts.data && accounts.data.length > 0 ? (
                                    accounts.data.map((acc) => (
                                        <tr key={acc.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 font-mono font-bold text-gray-700 whitespace-nowrap">
                                                {isBn ? toBn(acc.code) : acc.code}
                                            </td>
                                            <td className="px-3 py-2.5 font-semibold text-gray-900">
                                                <div className="flex items-center gap-1.5">
                                                    {acc.parent_id && <CornerDownRight className="w-3.5 h-3.5 text-amber-500 ml-2" />}
                                                    <span className={acc.parent_id ? 'text-gray-700 font-normal' : 'font-bold text-gray-900'}>{acc.name}</span>
                                                    {acc.is_system && (
                                                        <span className="ml-1.5 text-[9px] bg-gray-100 text-gray-500 px-1 py-0.2 rounded border">System</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getTypeBadgeClass(acc.account_type)}`}>
                                                    {getTypeLabel(acc.account_type)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{acc.parent ? acc.parent.name : '—'}</td>
                                            <td className="px-3 py-2.5 text-gray-500 max-w-[200px] truncate" title={acc.description}>
                                                {acc.description || '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold text-gray-800 whitespace-nowrap">
                                                {fmtMoney(acc.opening_balance)}
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                {acc.is_active ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> {isBn ? 'সক্রিয়' : 'Active'}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-md border border-gray-200 inline-flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" /> {isBn ? 'নিষ্ক্রিয়' : 'Inactive'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {isBn ? 'অ্যাকশন' : 'Actions'}
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(acc);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer font-medium"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5 mr-2 text-blue-500" /> {isBn ? 'সম্পাদনা করুন' : 'Edit Account'}
                                                        </button>
                                                        {!acc.is_system && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(acc.id);
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center cursor-pointer font-medium"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" /> {isBn ? 'মুছে ফেলুন' : 'Delete Account'}
                                                            </button>
                                                        )}
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-12 text-center text-gray-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <FolderTree className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন অ্যাকাউন্ট পাওয়া যায়নি।' : 'No accounts match your filter criteria.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {accounts.links && (
                        <div className="mt-4">
                            <Pagination links={accounts.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal via Portal */}
            {isCreateOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,23,42,0.55)' }}
                >
                    <div className="relative bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '540px', maxHeight: '90vh' }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl"
                            style={{ background: 'linear-gradient(to right, #fdf8f3, #ffffff)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                                    <FolderTree className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-800">
                                        {editAccount ? (isBn ? 'অ্যাকাউন্ট সম্পাদনা' : 'Edit Account') : (isBn ? 'নতুন অ্যাকাউন্ট তৈরি' : 'Add New Account')}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">
                                        {isBn ? 'অ্যাকাউন্ট কোড, ধরন এবং প্রারম্ভিক জের প্রদান করুন' : 'Fill in account details, type and starting balance'}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={closeModal}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <form id="coa-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            {isBn ? 'অ্যাকাউন্ট কোড' : 'Account Code'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                            placeholder="e.g. 1040"
                                            required
                                        />
                                        {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            {isBn ? 'অ্যাকাউন্টের ধরন' : 'Account Type'} <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.account_type}
                                            onChange={(e) => setData('account_type', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 capitalize"
                                            required
                                        >
                                            <option value="asset">{isBn ? 'সম্পদ (Asset)' : 'Asset'}</option>
                                            <option value="liability">{isBn ? 'দায় (Liability)' : 'Liability'}</option>
                                            <option value="equity">{isBn ? 'মালিকানাস্বত্ব (Equity)' : 'Equity'}</option>
                                            <option value="income">{isBn ? 'আয় (Income)' : 'Income'}</option>
                                            <option value="expense">{isBn ? 'ব্যয় (Expense)' : 'Expense'}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'অ্যাকাউন্টের নাম' : 'Account Name'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                        placeholder={isBn ? 'যেমন: নগদ তহবিল, ডাচ বাংলা ব্যাংক ইত্যাদি' : 'e.g. Cash in Hand, DBBL Bank Account'}
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'বিবরণ / সাব-ক্যাটেগরি' : 'Description / Sub-category'}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                        placeholder={isBn ? 'ঐচ্ছিক বিবরণ' : 'Optional description'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'প্রারম্ভিক জের (BDT)' : 'Opening Balance (BDT)'}
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.opening_balance}
                                        onFocus={handleNumberFocus}
                                        onChange={(e) => setData('opening_balance', cleanNumber(e.target.value))}
                                        className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-bold text-gray-900"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                                        {isBn ? 'অ্যাকাউন্ট সক্রিয়' : 'Account is Active'}
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 rounded-b-3xl bg-gray-50/60">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
                            >
                                {isBn ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="coa-form"
                                disabled={processing}
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                                className="text-white px-6 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving...') : editAccount ? (isBn ? 'আপডেট করুন' : 'Update Account') : (isBn ? 'সংরক্ষণ করুন' : 'Create Account')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
