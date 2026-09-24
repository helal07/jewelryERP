import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ClipboardList, Printer
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

export default function CustomerOrders({ orders = [], summary = {}, branches = [], customers = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [customerId, setCustomerId] = useState(filters.customer_id || '');
    const [status, setStatus] = useState(filters.status || '');

    useFilter(route('reports.customer-orders'), {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        customer_id: customerId,
        status: status,
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
                        <ClipboardList className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('customerOrderReport')}
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
            <Head title={t('customerOrderReport')} />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">{t('customerOrderReport')}</h2>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
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
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('customers')}</label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">{t('allCustomers')}</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('status')}</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">{t('allStatuses')}</option>
                            <option value="pending">{t('pending') || 'Pending'}</option>
                            <option value="in_production">{t('inProduction') || 'In Production'}</option>
                            <option value="completed">{t('completed') || 'Completed'}</option>
                            <option value="delivered">{t('delivered') || 'Delivered'}</option>
                            <option value="cancelled">{t('cancelled') || 'Cancelled'}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('totalOrders') || 'Total Orders'}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{isBn ? toBn(summary.total_orders || 0) : (summary.total_orders || 0)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('totalValue') || 'Total Value'}</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">{fmtMoney(summary.total_bill)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('advanceReceived') || 'Advance Received'}</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{fmtMoney(summary.total_advance)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('dueBalance') || 'Due Balance'}</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{fmtMoney(summary.total_due)}</p>
                </div>
            </div>

            {/* Customer Orders Table */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12">
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('orderNo') || 'Order No'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('orderDate') || 'Order Date'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('deliveryDate') || 'Delivery Date'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('customer')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('product')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('estimatedAmount') || 'Est. Bill'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('advanceAmount') || 'Advance'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('dueAmount')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-3.5 py-2.5 font-bold text-amber-800 whitespace-nowrap">{isBn ? toBn(order.order_no) : order.order_no}</td>
                                        <td className="px-3.5 py-2.5 text-gray-700 whitespace-nowrap">{isBn ? toBn(order.order_date) : order.order_date}</td>
                                        <td className="px-3.5 py-2.5 text-amber-700 whitespace-nowrap font-medium">{order.delivery_date ? (isBn ? toBn(order.delivery_date) : order.delivery_date) : '—'}</td>
                                        <td className="px-3.5 py-2.5 font-semibold text-gray-900">{order.customer?.name || '—'}</td>
                                        <td className="px-3.5 py-2.5 text-gray-700 font-medium">{order.product_name || order.product?.name || (isBn ? 'কাস্টম আইটেম' : 'Custom Item')}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">{fmtMoney(order.estimated_amount)}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600 whitespace-nowrap">{fmtMoney(order.advance_amount)}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">{fmtMoney(order.due_amount)}</td>
                                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                                                order.status === 'completed' || order.status === 'delivered'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : order.status === 'in_production'
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                                {t(order.status) || order.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-12 text-center text-gray-400">
                                        {t('noOrderRecords')}
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
