import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Landmark, Printer, Filter
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MortgageReport({ mortgages = [], summary = {}, branches = [], filters = {} }) {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [status, setStatus] = useState(filters.status || '');

    useFilter(route('reports.mortgage'), {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        status: status,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Landmark className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('mortgageReport') || 'Mortgage Report'}
                    </h2>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer print:hidden"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Printer className="w-4 h-4" />
                        {t('print') || 'Print'}
                    </button>
                </div>
            }
        >
            <Head title="Mortgage Report" />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">Mortgage & Collateral Report</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        {startDate && endDate && <p>Period: {startDate} to {endDate}</p>}
                        <p>Printed: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch</label>
                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active Loan</option>
                            <option value="released">Released / Settled</option>
                            <option value="overdue">Overdue</option>
                            <option value="defaulted">Defaulted / Auction</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Mortgages</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{summary.total_mortgages || 0}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Principal Disbursed</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">৳ {fmtBDT(summary.total_principal)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Interest Collected</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">৳ {fmtBDT(summary.interest_collected)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Active Accounts</p>
                    <p className="text-2xl font-black text-blue-700 mt-1">{summary.active_count || 0}</p>
                </div>
            </div>

            {/* Mortgage Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                <th className="p-3.5">Mortgage No</th>
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5">Customer</th>
                                <th className="p-3.5">Branch</th>
                                <th className="p-3.5 text-right">Principal</th>
                                <th className="p-3.5 text-right">Interest Rate</th>
                                <th className="p-3.5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mortgages.length > 0 ? (
                                mortgages.map((mort) => (
                                    <tr key={mort.id} className="hover:bg-gray-50/50">
                                        <td className="p-3.5 font-bold text-amber-800 whitespace-nowrap">{mort.mortgage_no}</td>
                                        <td className="p-3.5 text-gray-700 whitespace-nowrap">{mort.mortgage_date}</td>
                                        <td className="p-3.5 font-semibold text-gray-900">{mort.customer?.name || '—'}</td>
                                        <td className="p-3.5 text-gray-600">{mort.branch?.name || '—'}</td>
                                        <td className="p-3.5 text-right font-bold text-gray-900">৳ {fmtBDT(mort.principal_amount)}</td>
                                        <td className="p-3.5 text-right font-semibold text-gray-700">{mort.interest_rate}% ({mort.interest_type})</td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                                                mort.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : mort.status === 'released'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {mort.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-400">
                                        No mortgage records found for this period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
