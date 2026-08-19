import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { CreditCard, Plus, Trash2, CheckCircle2, AlertTriangle, XCircle, Clock, Search, Filter, RotateCcw } from 'lucide-react';

export default function Index({ cheques, branches = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [direction, setDirection] = useState(filters.direction || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');

    useFilter(route('accounts.cheques.index'), {
        search,
        status,
        direction,
        from_date: fromDate,
        to_date: toDate,
        branch_id: branchId,
    });

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDirection('');
        setFromDate('');
        setToDate('');
        setBranchId('');
    };

    const handleStatusUpdate = (chequeId, newStatus) => {
        router.patch(route('accounts.cheques.update-status', chequeId), {
            status: newStatus,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this cheque record?')) {
            router.delete(route('accounts.cheques.destroy', id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'cleared':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Cleared</span>;
            case 'bounced':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Bounced</span>;
            case 'cancelled':
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200 inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard className="w-7 h-7 text-[#E88A1A]" />
                            Cheque Register
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Track issued & received cheques, clearing dates, and status</p>
                    </div>
                    <Link
                        href={route('accounts.cheques.create')}
                        className="bg-[#E88A1A] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Record Cheque
                    </Link>
                </div>
            }
        >
            <Head title="Cheque Register" />

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by cheque #, bank name, notes..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        />
                    </div>

                    <div className="w-36">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="cleared">Cleared</option>
                            <option value="bounced">Bounced</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="w-36">
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        >
                            <option value="">All Directions</option>
                            <option value="received">Received</option>
                            <option value="issued">Issued</option>
                        </select>
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
                                <th className="px-4 py-3.5 font-bold rounded-tl-lg">Cheque No</th>
                                <th className="px-4 py-3.5 font-bold">Direction</th>
                                <th className="px-4 py-3.5 font-bold">Bank Name</th>
                                <th className="px-4 py-3.5 font-bold">Bank Account</th>
                                <th className="px-4 py-3.5 font-bold">Issue Date</th>
                                <th className="px-4 py-3.5 font-bold">Due Date</th>
                                <th className="px-4 py-3.5 font-bold text-right">Amount (BDT)</th>
                                <th className="px-4 py-3.5 font-bold">Status</th>
                                <th className="px-4 py-3.5 font-bold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cheques.data.map((chq) => (
                                <tr key={chq.id} className="hover:bg-amber-50/40 transition-colors">
                                    <td className="px-4 py-3.5 font-mono font-bold text-gray-800">{chq.cheque_no}</td>
                                    <td className="px-4 py-3.5">
                                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold capitalize ${chq.direction === 'received' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {chq.direction}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-700 font-medium">{chq.bank_name || '-'}</td>
                                    <td className="px-4 py-3.5 text-gray-700">{chq.account?.name}</td>
                                    <td className="px-4 py-3.5 text-gray-600">{new Date(chq.issue_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3.5 text-gray-600">{chq.due_date ? new Date(chq.due_date).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-3.5 text-right font-bold text-gray-900 text-base">
                                        BDT {Number(chq.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="px-4 py-3.5">{getStatusBadge(chq.status)}</td>
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
                                                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase">Set Status</div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(chq.id, 'cleared');
                                                    }}
                                                    className="block w-full px-4 py-1.5 text-start text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                                >
                                                    Mark as Cleared
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(chq.id, 'bounced');
                                                    }}
                                                    className="block w-full px-4 py-1.5 text-start text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                                                >
                                                    Mark as Bounced
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(chq.id, 'pending');
                                                    }}
                                                    className="block w-full px-4 py-1.5 text-start text-xs font-semibold text-amber-700 hover:bg-amber-50 cursor-pointer"
                                                >
                                                    Mark as Pending
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(chq.id, 'cancelled');
                                                    }}
                                                    className="block w-full px-4 py-1.5 text-start text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    Mark as Cancelled
                                                </button>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(chq.id);
                                                    }}
                                                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-rose-600 hover:bg-rose-50 focus:outline-none flex items-center cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Cheque
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                            {cheques.data.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500 font-medium">
                                        No cheques match your filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={cheques.links} from={cheques.from} to={cheques.to} total={cheques.total} />
            </div>
        </AuthenticatedLayout>
    );
}
