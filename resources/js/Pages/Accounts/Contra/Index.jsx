import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { ArrowLeftRight, Plus, Trash2, Search, Filter, RotateCcw } from 'lucide-react';

export default function Index({ entries, branches = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');

    useFilter(route('accounts.contra.index'), {
        search,
        from_date: fromDate,
        to_date: toDate,
        branch_id: branchId,
    });

    const handleReset = () => {
        setSearch('');
        setFromDate('');
        setToDate('');
        setBranchId('');
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this Contra Entry?')) {
            router.delete(route('accounts.contra.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ArrowLeftRight className="w-7 h-7 text-[#E88A1A]" />
                            Contra Entries
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Cash-to-Bank and Bank-to-Bank fund transfers</p>
                    </div>
                    <Link
                        href={route('accounts.contra.create')}
                        className="bg-[#E88A1A] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        New Contra Transfer
                    </Link>
                </div>
            }
        >
            <Head title="Contra Entries" />

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by entry # or account..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        />
                    </div>

                    <div className="w-36">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        />
                    </div>

                    <div className="w-36">
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        />
                    </div>

                    {branches.length > 0 && (
                        <div className="w-40">
                            <select
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

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
                        <thead className="bg-[#E88A1A] text-white">
                            <tr>
                                <th className="px-4 py-3.5 font-bold rounded-tl-lg">Entry No</th>
                                <th className="px-4 py-3.5 font-bold">Date</th>
                                <th className="px-4 py-3.5 font-bold">From Account</th>
                                <th className="px-4 py-3.5 font-bold">To Account</th>
                                <th className="px-4 py-3.5 font-bold">Branch</th>
                                <th className="px-4 py-3.5 font-bold text-right">Amount (BDT)</th>
                                <th className="px-4 py-3.5 font-bold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.data.map((entry) => (
                                <tr key={entry.id} className="hover:bg-amber-50/40 transition-colors">
                                    <td className="px-4 py-3.5 font-mono font-bold text-gray-800">{entry.entry_no}</td>
                                    <td className="px-4 py-3.5 text-gray-600 font-medium">
                                        {new Date(entry.entry_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 font-semibold text-rose-700">
                                        {entry.from_account?.name}
                                    </td>
                                    <td className="px-4 py-3.5 font-semibold text-emerald-700">
                                        {entry.to_account?.name}
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-600">{entry.branch?.name || 'Main'}</td>
                                    <td className="px-4 py-3.5 text-right font-bold text-gray-900 text-base">
                                        BDT {Number(entry.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
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
                                                        handleDelete(entry.id);
                                                    }}
                                                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-rose-600 hover:bg-rose-50 focus:outline-none flex items-center cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Transfer
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                            {entries.data.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500 font-medium">
                                        No contra transfers match your filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={entries.links} from={entries.from} to={entries.to} total={entries.total} />
            </div>
        </AuthenticatedLayout>
    );
}
