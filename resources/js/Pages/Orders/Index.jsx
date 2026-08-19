import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Modal from '@/Components/Modal';
import useFilter from '@/Hooks/useFilter';
import { 
    Plus, 
    Search, 
    Filter, 
    Eye, 
    Edit3, 
    Trash2, 
    UserCheck, 
    ClipboardList, 
    Clock, 
    CheckCircle2, 
    Hammer, 
    Calendar,
    ChevronDown,
    DollarSign,
    Printer,
    XCircle,
    X,
    Save
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ orders, filters, stats }) {
    const { t } = useLanguage();

    // Customer Payment Modal State
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const { data: payData, setData: setPayData, post: postPayment, processing: payProcessing, errors: payErrors, reset: resetPay } = useForm({
        amount: '',
    });

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [metalType, setMetalType] = useState(filters?.metal_type || '');

    useFilter(route('orders.index'), {
        search,
        status,
        metal_type: metalType
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return String(dateStr).split('T')[0].split(' ')[0];
    };

    const handleDelete = (id, orderNo) => {
        if (confirm(`Are you sure you want to delete order ${orderNo}?`)) {
            router.delete(route('orders.destroy', id), {
                preserveScroll: true,
                onError: (errors) => {
                    alert(errors.error || errors.message || 'Failed to delete order.');
                }
            });
        }
    };

    const handleCancelOrder = (order) => {
        if (confirm(`Are you sure you want to CANCEL order ${order.order_no}?`)) {
            router.patch(route('orders.update-status', order.id), { status: 'cancelled' }, {
                preserveScroll: true,
                onError: (errors) => {
                    alert(errors.error || errors.message || 'Failed to cancel order.');
                }
            });
        }
    };

    const openPaymentModal = (order) => {
        setSelectedOrderForPayment(order);
        setPayData('amount', order.due_amount > 0 ? order.due_amount : '');
        setPaymentModalOpen(true);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!selectedOrderForPayment) return;

        postPayment(route('orders.record-payment', selectedOrderForPayment.id), {
            preserveScroll: true,
            onSuccess: () => {
                setPaymentModalOpen(false);
                setSelectedOrderForPayment(null);
                resetPay();
            },
            onError: (errs) => {
                alert(Object.values(errs).flat().join('\n') || 'Failed to record payment.');
            }
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            new: 'bg-blue-100 text-blue-800 border-blue-200',
            assigned: 'bg-purple-100 text-purple-800 border-purple-200',
            in_production: 'bg-amber-100 text-amber-800 border-amber-200',
            ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            delivered: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
        };

        const labels = {
            new: 'New Order',
            assigned: 'Assigned',
            in_production: 'In Production',
            ready: 'Ready for Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <ClipboardList className="h-7 w-7" style={{ color: 'rgb(177,118,51)' }} />
                            {t('orderList') || 'Order List'}
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route('orders.assignments')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl text-sm font-semibold shadow-xs transition-all"
                        >
                            <UserCheck className="w-4 h-4 mr-2" style={{ color: 'rgb(177,118,51)' }} />
                            {t('assignOrder') || 'Assign Order'}
                        </Link>
                        <Link
                            href={route('artisan-payments.index')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl text-sm font-semibold shadow-xs transition-all"
                        >
                            <Hammer className="w-4 h-4 mr-2" style={{ color: 'rgb(177,118,51)' }} />
                            {t('artisanPayment') || 'Artisan Payment'}
                        </Link>
                        <Link
                            href={route('orders.create')}
                            className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition-all hover:opacity-90 active:opacity-100 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('newOrder') || 'New Order'}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Order List" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_orders || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)' }}>
                        <ClipboardList className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Pending Orders</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.pending_orders || 0}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">In Production</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.in_production_orders || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <Hammer className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Completed Orders</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.completed_orders || 0}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order #, customer, item..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full sm:w-44 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_production">In Production</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={metalType}
                            onChange={(e) => setMetalType(e.target.value)}
                            className="w-full sm:w-40 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">All Metals</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Diamond">Diamond</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm pb-16">
                <div className="overflow-visible min-h-[450px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-4">Order Date</th>
                                <th className="py-4 px-4">Delivery Date</th>
                                <th className="py-4 px-4">Invoice No</th>
                                <th className="py-4 px-4">Customer</th>
                                <th className="py-4 px-4">Mobile</th>
                                <th className="py-4 px-4">Total Bill</th>
                                <th className="py-4 px-4">Received</th>
                                <th className="py-4 px-4">Due</th>
                                <th className="py-4 px-4">Status</th>
                                <th className="py-4 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {orders.data && orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        className="hover:bg-amber-50/30 transition-colors"
                                    >
                                        
                                        {/* 1. Order Date */}
                                        <td className="py-4 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            {formatDate(order.order_date)}
                                        </td>

                                        {/* 2. Delivery Date */}
                                        <td className="py-4 px-4 text-xs font-semibold text-amber-700 whitespace-nowrap">
                                            {formatDate(order.delivery_date)}
                                        </td>

                                        {/* 3. Invoice No */}
                                        <td className="py-4 px-4 font-bold text-amber-800 whitespace-nowrap">
                                            <Link href={route('orders.show', order.id)} className="hover:underline">
                                                {order.order_no}
                                            </Link>
                                        </td>

                                        {/* 4. Customer */}
                                        <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                                            {order.customer?.name || 'N/A'}
                                        </td>

                                        {/* 5. Mobile */}
                                        <td className="py-4 px-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                                            {order.customer?.phone || '—'}
                                        </td>

                                        {/* 6. Total Bill */}
                                        <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                                            ৳{Number(order.estimated_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* 7. Received */}
                                        <td className="py-4 px-4 font-semibold text-emerald-600 whitespace-nowrap">
                                            ৳{Number(order.advance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* 8. Due */}
                                        <td className="py-4 px-4 font-bold whitespace-nowrap">
                                            {Number(order.due_amount) > 0 ? (
                                                <span className="text-rose-600">৳{Number(order.due_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            ) : (
                                                <span className="text-emerald-600 font-bold">Paid</span>
                                            )}
                                        </td>

                                        {/* 9. Status */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>

                                        {/* 10. Actions Dropdown */}
                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3.5 py-1.5 border rounded-xl text-xs font-bold bg-white hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
                                                        style={{ color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.4)' }}
                                                    >
                                                        Actions
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" className="w-48 py-1.5 bg-white shadow-xl rounded-xl border border-gray-100">
                                                    <Link
                                                        href={route('orders.show', order.id)}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <Printer className="w-4 h-4 text-amber-600" /> Print Invoice
                                                    </Link>

                                                    <Link
                                                        href={route('orders.edit', order.id)}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-blue-600" /> Edit Order
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => openPaymentModal(order)}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <DollarSign className="w-4 h-4 text-amber-600" /> Receive Payment
                                                    </button>

                                                    <div className="border-t border-gray-100 my-1"></div>

                                                    {order.status !== 'cancelled' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancelOrder(order)}
                                                            className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4 text-amber-600" /> Cancel Order
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(order.id, order.order_no)}
                                                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-rose-600" /> Delete Order
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-gray-400">
                                        <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-base font-semibold text-gray-600">No custom orders found</p>
                                        <p className="text-xs text-gray-400 mt-1">Get started by creating a new custom jewelry order.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Showing <span className="font-semibold text-gray-700">{orders.from}</span> to <span className="font-semibold text-gray-700">{orders.to}</span> of <span className="font-semibold text-gray-700">{orders.total}</span> orders
                        </div>
                        <div className="flex items-center gap-1">
                            {orders.links.map((link, key) => (
                                <Link
                                    key={key}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-amber-600 text-white'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Payment Modal */}
            <Modal show={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} maxWidth="md">
                <div className="p-6 text-left space-y-5 bg-white rounded-2xl">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Receive Customer Payment</h3>
                                <p className="text-xs text-gray-500">Order: {selectedOrderForPayment?.order_no}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPaymentModalOpen(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Customer Name:</span>
                                <span className="font-bold text-gray-900">{selectedOrderForPayment?.customer?.name}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Total Bill:</span>
                                <span className="font-bold text-gray-900">৳{Number(selectedOrderForPayment?.estimated_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-emerald-600">
                                <span>Already Received:</span>
                                <span className="font-bold">৳{Number(selectedOrderForPayment?.advance_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-rose-600 font-bold border-t border-gray-200 pt-2">
                                <span>Current Due:</span>
                                <span>৳{Number(selectedOrderForPayment?.due_amount || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Payment Amount (৳) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={payData.amount}
                                onChange={(e) => setPayData('amount', e.target.value)}
                                placeholder="Enter payment amount"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            {payErrors.amount && <p className="text-xs text-rose-500 mt-1">{payErrors.amount}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setPaymentModalOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={payProcessing}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <DollarSign className="w-3.5 h-3.5" />
                                {payProcessing ? 'Processing...' : 'Record Payment'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
