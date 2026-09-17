import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { TrendingUp, Plus, Trash2, Search, RotateCcw } from 'lucide-react';

export default function Index({ incomes, accounts = [], branches = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    const [search, setSearch] = useState(filters.search || '');
    const [accountId, setAccountId] = useState(filters.account_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');

    useFilter(route('accounts.other-incomes.index'), {
        search,
        account_id: accountId,
        from_date: fromDate,
        to_date: toDate,
        branch_id: branchId,
    });

    const handleReset = () => {
        setSearch('');
        setAccountId('');
        setFromDate('');
        setToDate('');
        setBranchId('');
    };

    const handleDelete = (id) => {
        if (confirm(isBn ? 'আপনি কি নিশ্চিত যে আপনি এই আয়ের রেকর্ড মুছে ফেলতে চান?' : 'Are you sure you want to delete this income record?')) {
            router.delete(route('accounts.other-incomes.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'অন্যান্য আয়' : 'Other Income'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'বিক্রয় বহির্ভূত আয় ও বিবিধ রাজস্ব পরিচালনা করুন' : 'Record non-sales income & miscellaneous revenue'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('accounts.other-incomes.create')}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন আয় রেকর্ড' : 'Record Other Income'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'অন্যান্য আয়' : 'Other Income'} />

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
                                placeholder={isBn ? 'আয় নং, ক্যাটেগরি বা বিবরণ দিয়ে খুঁজুন...' : 'Search by income #, category or notes...'}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>

                        {accounts.length > 0 && (
                            <div className="w-44">
                                <select
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 focus:border-amber-500 focus:ring-amber-500"
                                >
                                    <option value="">{isBn ? 'সকল আয় অ্যাকাউন্ট' : 'All Income Accounts'}</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="w-36">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>

                        <div className="w-36">
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 focus:border-amber-500 focus:ring-amber-500"
                            />
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
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'আয় নম্বর' : 'Income #'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অ্যাকাউন্ট' : 'Income Account'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ক্যাটেগরি' : 'Category'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'বিবরণ / নোট' : 'Notes'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {incomes.data && incomes.data.length > 0 ? (
                                    incomes.data.map((inc) => (
                                        <tr key={inc.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                {isBn ? toBn(inc.income_no) : inc.income_no}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">
                                                {inc.income_date ? (isBn ? toBn(inc.income_date) : inc.income_date) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap font-bold text-gray-900">
                                                {inc.account ? inc.account.name : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {inc.category || '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                {fmtMoney(inc.amount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500 max-w-xs truncate" title={inc.notes}>
                                                {inc.notes || '—'}
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
                                                                handleDelete(inc.id);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center cursor-pointer font-medium"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" /> {isBn ? 'মুছে ফেলুন' : 'Delete'}
                                                        </button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <TrendingUp className="w-8 h-8 opacity-30 text-emerald-500" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন আয়ের রেকর্ড পাওয়া যায়নি।' : 'No income records found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {incomes.links && (
                        <div className="mt-4">
                            <Pagination links={incomes.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
