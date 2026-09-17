import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { CreditCard, Plus, Trash2, CheckCircle2, AlertTriangle, XCircle, Clock, Search, RotateCcw } from 'lucide-react';

export default function Index({ cheques, branches = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

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
        if (confirm(isBn ? 'আপনি কি নিশ্চিত যে আপনি এই চেক রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this cheque record?')) {
            router.delete(route('accounts.cheques.destroy', id));
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'cleared':
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {isBn ? 'ক্লিয়ার্ড' : 'Cleared'}</span>;
            case 'bounced':
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {isBn ? 'বাউন্সড' : 'Bounced'}</span>;
            case 'cancelled':
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-50 text-gray-700 border border-gray-200 inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> {isBn ? 'বাতিল' : 'Cancelled'}</span>;
            default:
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {isBn ? 'অপেক্ষমাণ' : 'Pending'}</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'চেক রেজিস্টার' : 'Cheque Register'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'প্রাপ্ত ও প্রদত্ত চেক, ক্লিয়ারিং তারিখ এবং অবস্থা ট্র্যাক করুন' : 'Track issued & received cheques, clearing dates, and status'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('accounts.cheques.create')}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন চেক এন্ট্রি' : 'Record Cheque'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'চেক রেজিস্টার' : 'Cheque Register'} />

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
                                placeholder={isBn ? 'চেক নং, ব্যাংক বা নোট দিয়ে খুঁজুন...' : 'Search by cheque #, bank name, notes...'}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>

                        <div className="w-36">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="">{isBn ? 'সকল অবস্থা' : 'All Status'}</option>
                                <option value="pending">{isBn ? 'অপেক্ষমাণ' : 'Pending'}</option>
                                <option value="cleared">{isBn ? 'ক্লিয়ার্ড' : 'Cleared'}</option>
                                <option value="bounced">{isBn ? 'বাউন্সড' : 'Bounced'}</option>
                                <option value="cancelled">{isBn ? 'বাতিল' : 'Cancelled'}</option>
                            </select>
                        </div>

                        <div className="w-36">
                            <select
                                value={direction}
                                onChange={(e) => setDirection(e.target.value)}
                                className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="">{isBn ? 'সকল ধরন' : 'All Directions'}</option>
                                <option value="received">{isBn ? 'প্রাপ্ত চেক' : 'Received'}</option>
                                <option value="issued">{isBn ? 'প্রদত্ত চেক' : 'Issued'}</option>
                            </select>
                        </div>

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
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'চেক নম্বর' : 'Cheque #'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ধরন' : 'Direction'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ব্যাংক ও অ্যাকাউন্ট' : 'Bank / Account'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ইস্যু তারিখ' : 'Issue Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পরিশোধের তারিখ' : 'Due Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {cheques.data && cheques.data.length > 0 ? (
                                    cheques.data.map((chq) => (
                                        <tr key={chq.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                {isBn ? toBn(chq.cheque_no) : chq.cheque_no}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                                                    chq.direction === 'received' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {chq.direction === 'received' ? (isBn ? 'প্রাপ্ত' : 'Received') : (isBn ? 'প্রদত্ত' : 'Issued')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="font-bold text-gray-900">{chq.bank_name || '—'}</div>
                                                <div className="text-[10px] text-gray-400">{chq.account ? chq.account.name : '—'}</div>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">
                                                {chq.issue_date ? (isBn ? toBn(chq.issue_date) : chq.issue_date) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">
                                                {chq.due_date ? (isBn ? toBn(chq.due_date) : chq.due_date) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                                                {fmtMoney(chq.amount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                {getStatusBadge(chq.status)}
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
                                                        {chq.status !== 'cleared' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(chq.id, 'cleared');
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center cursor-pointer font-medium"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" /> {isBn ? 'ক্লিয়ার হিসেবে চিহ্নিত করুন' : 'Mark Cleared'}
                                                            </button>
                                                        )}
                                                        {chq.status !== 'bounced' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(chq.id, 'bounced');
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center cursor-pointer font-medium"
                                                            >
                                                                <AlertTriangle className="w-3.5 h-3.5 mr-2 text-amber-600" /> {isBn ? 'বাউন্সড হিসেবে চিহ্নিত করুন' : 'Mark Bounced'}
                                                            </button>
                                                        )}
                                                        {chq.status !== 'cancelled' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(chq.id, 'cancelled');
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer font-medium"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5 mr-2 text-gray-500" /> {isBn ? 'বাতিল করুন' : 'Mark Cancelled'}
                                                            </button>
                                                        )}
                                                        <div className="border-t border-gray-100"></div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(chq.id);
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
                                        <td colSpan="8" className="px-4 py-12 text-center text-gray-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <CreditCard className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন চেক পাওয়া যায়নি।' : 'No cheques match your filter criteria.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {cheques.links && (
                        <div className="mt-4">
                            <Pagination links={cheques.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
