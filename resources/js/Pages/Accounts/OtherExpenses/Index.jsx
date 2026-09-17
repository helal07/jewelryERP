import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { TrendingDown, Plus, Trash2, Search, RotateCcw } from 'lucide-react';

export default function Index({ expenses, accounts = [], branches = [], filters = {} }) {
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

    useFilter(route('accounts.other-expenses.index'), {
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
        if (confirm(isBn ? 'আপনি কি নিশ্চিত যে আপনি এই ব্যয়ের রেকর্ড মুছে ফেলতে চান?' : 'Are you sure you want to delete this expense record?')) {
            router.delete(route('accounts.other-expenses.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'অন্যান্য ব্যয়' : 'Other Expenses'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'দোকানের পরিচালনা ও বিবিধ খরচ রেকর্ড ও পরিচালনা করুন' : 'Record shop operating & miscellaneous expenses'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('accounts.other-expenses.create')}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন ব্যয় রেকর্ড' : 'Record Other Expense'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'অন্যান্য ব্যয়' : 'Other Expenses'} />

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
                                placeholder={isBn ? 'ব্যয় নং, ক্যাটেগরি বা বিবরণ দিয়ে খুঁজুন...' : 'Search by expense #, category or notes...'}
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
                                    <option value="">{isBn ? 'সকল ব্যয় অ্যাকাউন্ট' : 'All Expense Accounts'}</option>
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
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ব্যয় নম্বর' : 'Expense #'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অ্যাকাউন্ট' : 'Expense Account'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ক্যাটেগরি' : 'Category'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'বিবরণ / নোট' : 'Notes'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {expenses.data && expenses.data.length > 0 ? (
                                    expenses.data.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                {isBn ? toBn(exp.expense_no) : exp.expense_no}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">
                                                {exp.expense_date ? (isBn ? toBn(exp.expense_date) : exp.expense_date) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap font-bold text-gray-900">
                                                {exp.account ? exp.account.name : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                                    {exp.category || '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">
                                                {fmtMoney(exp.amount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500 max-w-xs truncate" title={exp.notes}>
                                                {exp.notes || '—'}
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
                                                                handleDelete(exp.id);
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
                                                <TrendingDown className="w-8 h-8 opacity-30 text-rose-500" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন ব্যয়ের রেকর্ড পাওয়া যায়নি।' : 'No expense records found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {expenses.links && (
                        <div className="mt-4">
                            <Pagination links={expenses.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
