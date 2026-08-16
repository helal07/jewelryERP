import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Truck, Printer, Filter
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PurchaseReport({ purchases = [], summary = {}, branches = [], suppliers = [], filters = {} }) {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('reports.purchase'), {
            start_date: startDate,
            end_date: endDate,
            branch_id: branchId,
            supplier_id: supplierId,
        }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Truck className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('purchaseReport') || 'Purchase Report'}
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
            <Head title="Purchase Report" />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">Purchase & Procurement Report</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        {startDate && endDate && <p>Period: {startDate} to {endDate}</p>}
                        <p>Printed: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
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
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier</label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full text-white py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        >
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Purchases</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{summary.total_purchases || 0}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Grand Total</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">৳ {fmtBDT(summary.total_grand)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Paid Amount</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">৳ {fmtBDT(summary.total_paid)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Due Amount</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">৳ {fmtBDT(summary.total_due)}</p>
                </div>
            </div>

            {/* Purchase Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                <th className="p-3.5">Purchase No</th>
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5">Supplier</th>
                                <th className="p-3.5">Branch</th>
                                <th className="p-3.5 text-right">Grand Total</th>
                                <th className="p-3.5 text-right">Paid</th>
                                <th className="p-3.5 text-right">Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {purchases.length > 0 ? (
                                purchases.map((pur) => (
                                    <tr key={pur.id} className="hover:bg-gray-50/50">
                                        <td className="p-3.5 font-bold text-amber-800 whitespace-nowrap">{pur.purchase_no}</td>
                                        <td className="p-3.5 text-gray-700 whitespace-nowrap">{pur.purchase_date}</td>
                                        <td className="p-3.5 font-semibold text-gray-900">{pur.supplier?.name || '—'}</td>
                                        <td className="p-3.5 text-gray-600">{pur.branch?.name || '—'}</td>
                                        <td className="p-3.5 text-right font-bold text-gray-900">৳ {fmtBDT(pur.grand_total)}</td>
                                        <td className="p-3.5 text-right font-bold text-emerald-600">৳ {fmtBDT(pur.paid_amount)}</td>
                                        <td className="p-3.5 text-right font-bold text-rose-600">৳ {fmtBDT(pur.due_amount)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-400">
                                        No purchase records found for this period
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
