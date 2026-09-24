import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Truck, Printer
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

export default function PurchaseReport({ purchases = [], summary = {}, branches = [], suppliers = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');

    useFilter(route('reports.purchase'), {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        supplier_id: supplierId,
    });

    const fmtMoney = (val) => {
        const formatted = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(formatted)}` : `BDT ${formatted}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Truck className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('purchaseReport')}
                    </h2>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer print:hidden"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Printer className="w-4 h-4" />
                        {t('print')}
                    </button>
                </div>
            }
        >
            <Head title={t('purchaseReport')} />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">{t('purchaseReport')}</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        {startDate && endDate && (
                            <p>{t('startDate')}: {isBn ? toBn(startDate) : startDate} - {t('endDate')}: {isBn ? toBn(endDate) : endDate}</p>
                        )}
                        <p>{t('Printed') || 'Printed'}: {isBn ? toBn(new Date().toLocaleDateString()) : new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('startDate')}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('endDate')}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('branch')}</label>
                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">{t('allBranches')}</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('supplier') || 'Supplier'}</label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">{t('allSuppliers')}</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('totalPurchases') || 'Total Purchases'}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{isBn ? toBn(summary.total_purchases || 0) : (summary.total_purchases || 0)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('grandTotal')}</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">{fmtMoney(summary.total_grand)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('paidAmount')}</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{fmtMoney(summary.total_paid)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('dueAmount')}</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{fmtMoney(summary.total_due)}</p>
                </div>
            </div>

            {/* Purchase Table */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12">
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('purchaseNo') || 'Purchase No'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('date')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('supplier') || 'Supplier'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('branch')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('grandTotal')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('paidAmount')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('dueAmount')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {purchases.length > 0 ? (
                                purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-3.5 py-2.5 font-bold text-amber-800 whitespace-nowrap">{isBn ? toBn(purchase.purchase_no) : purchase.purchase_no}</td>
                                        <td className="px-3.5 py-2.5 text-gray-700 whitespace-nowrap">{isBn ? toBn(purchase.purchase_date) : purchase.purchase_date}</td>
                                        <td className="px-3.5 py-2.5 font-semibold text-gray-900">{purchase.supplier?.name || '—'}</td>
                                        <td className="px-3.5 py-2.5 text-gray-600">{purchase.branch?.name || '—'}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">{fmtMoney(purchase.grand_total)}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600 whitespace-nowrap">{fmtMoney(purchase.paid_amount)}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">{fmtMoney(purchase.due_amount)}</td>
                                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                                                purchase.status === 'received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                                {t(purchase.status) || purchase.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-gray-400">
                                        {t('noPurchaseRecords')}
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
