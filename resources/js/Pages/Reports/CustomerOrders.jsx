import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    ClipboardList, Printer, Filter
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CustomerOrders({ orders = [], summary = {}, branches = [], customers = [], filters = {} }) {
    const { t } = useLanguage();
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <ClipboardList className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('customerOrderReport') || 'Customer Order Report'}
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
            <Head title="Customer Order Report" />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">Customer Custom Orders Report</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        {startDate && endDate && <p>Period: {startDate} to {endDate}</p>}
                        <p>Printed: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
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
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer</label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Customers</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
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
                            <option value="pending">Pending</option>
                            <option value="in_production">In Production</option>
                            <option value="completed">Completed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Orders</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{summary.total_orders || 0}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Value</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">৳ {fmtBDT(summary.total_bill)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Advance Received</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">৳ {fmtBDT(summary.total_advance)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Due Balance</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">৳ {fmtBDT(summary.total_due)}</p>
                </div>
            </div>

            {/* Customer Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                <th className="p-3.5">Order No</th>
                                <th className="p-3.5">Order Date</th>
                                <th className="p-3.5">Delivery Date</th>
                                <th className="p-3.5">Customer</th>
                                <th className="p-3.5">Product</th>
                                <th className="p-3.5 text-right">Est. Bill</th>
                                <th className="p-3.5 text-right">Advance</th>
                                <th className="p-3.5 text-right">Due</th>
                                <th className="p-3.5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50">
                                        <td className="p-3.5 font-bold text-amber-800 whitespace-nowrap">{order.order_no}</td>
                                        <td className="p-3.5 text-gray-700 whitespace-nowrap">{order.order_date}</td>
                                        <td className="p-3.5 text-amber-700 whitespace-nowrap font-medium">{order.delivery_date || '—'}</td>
                                        <td className="p-3.5 font-semibold text-gray-900">{order.customer?.name || '—'}</td>
                                        <td className="p-3.5 text-gray-700 font-medium">{order.product_name || order.product?.name || 'Custom Item'}</td>
                                        <td className="p-3.5 text-right font-bold text-gray-900">৳ {fmtBDT(order.estimated_amount)}</td>
                                        <td className="p-3.5 text-right font-bold text-emerald-600">৳ {fmtBDT(order.advance_amount)}</td>
                                        <td className="p-3.5 text-right font-bold text-rose-600">৳ {fmtBDT(order.due_amount)}</td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                                                order.status === 'completed' || order.status === 'delivered'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : order.status === 'in_production'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {order.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-12 text-center text-gray-400">
                                        No customer orders found for this period
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
