import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { TrendingDown, Plus, Trash2, Search, Filter, RotateCcw } from 'lucide-react';

export default function Index({ expenses, accounts = [], branches = [], filters = {} }) {
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
        if (confirm('Are you sure you want to delete this expense record?')) {
            router.delete(route('accounts.other-expenses.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingDown className="w-7 h-7 text-rose-600" />
                            Other Expense
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Record shop operating & miscellaneous expenses</p>
                    </div>
                    <Link
                        href={route('accounts.other-expenses.create')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Record Other Expense
                    </Link>
                </div>
            }
        >
            <Head title="Other Expense" />

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by expense #, category or notes..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                        />
                    </div>

                    {accounts.length > 0 && (
                        <div className="w-44">
                            <select
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                            >
                                <option value="">All Expense Accounts</option>
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
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                        />
                    </div>

                    <div className="w-36">
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" /> Clear
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pb-24">
                <div className="overflow-visible">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-rose-600 text-white">
                            <tr>
                                <th className="px-4 py-3.5 font-bold rounded-tl-lg">Expense No</th>
                                <th className="px-4 py-3.5 font-bold">Date</th>
                                <th className="px-4 py-3.5 font-bold">Account</th>
                                <th className="px-4 py-3.5 font-bold">Category</th>
                                <th className="px-4 py-3.5 font-bold">Branch</th>
                                <th className="px-4 py-3.5 font-bold text-right">Amount (BDT)</th>
                                <th className="px-4 py-3.5 font-bold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.data.map((exp) => (
                                <tr key={exp.id} className="hover:bg-rose-50/40 transition-colors">
                                    <td className="px-4 py-3.5 font-mono font-bold text-gray-800">{exp.expense_no}</td>
                                    <td className="px-4 py-3.5 text-gray-600 font-medium">
                                        {new Date(exp.expense_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 font-semibold text-gray-900">{exp.account?.name}</td>
                                    <td className="px-4 py-3.5 text-gray-600 capitalize">{exp.category || 'General'}</td>
                                    <td className="px-4 py-3.5 text-gray-600">{exp.branch?.name || 'Main'}</td>
                                    <td className="px-4 py-3.5 text-right font-bold text-rose-700 text-base">
                                        BDT {Number(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-medium">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150"
                                                >
                                                    Actions
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
                                                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-rose-600 hover:bg-rose-50 focus:outline-none flex items-center cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Expense
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                            {expenses.data.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500 font-medium">
                                        No expense records match your filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={expenses.links} from={expenses.from} to={expenses.to} total={expenses.total} />
            </div>
        </AuthenticatedLayout>
    );
}
