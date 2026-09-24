import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
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
    Save,
    RotateCcw
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Index({ orders, filters = {}, stats = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    // Customer Payment Modal State
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

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

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setMetalType('');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const formatted = String(dateStr).split('T')[0].split(' ')[0];
        return isBn ? toBn(formatted) : formatted;
    };

    const handleDelete = (id, orderNo) => {
        if (confirm(isBn ? `আপনি কি অর্ডার #${toBn(orderNo)} ডিলিট করতে চান?` : `Are you sure you want to delete order #${orderNo}?`)) {
            router.delete(route('orders.destroy', id), {
                preserveScroll: true,
                onError: (errors) => {
                    alert(errors.error || errors.message || t('Failed to delete order.'));
                }
            });
        }
    };

    const handleCancelOrder = (order) => {
        if (confirm(isBn ? `আপনি কি অর্ডার #${toBn(order.order_no)} বাতিল করতে চান?` : `Are you sure you want to CANCEL order #${order.order_no}?`)) {
            router.patch(route('orders.update-status', order.id), { status: 'cancelled' }, {
                preserveScroll: true,
                onError: (errors) => {
                    alert(errors.error || errors.message || t('Failed to cancel order.'));
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
                alert(Object.values(errs).flat().join('\n') || t('Failed to record payment.'));
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
            new: t('New Order'),
            assigned: t('Assigned'),
            in_production: t('In Production'),
            ready: t('Ready for Delivery'),
            delivered: t('Delivered'),
            cancelled: t('Cancelled'),
        };

        return (
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
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
                            <ClipboardList className="h-7 w-7 text-[#b17633]" />
                            {t('Order List')}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">{t('Track custom jewelry orders, assignments & payment statuses')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route('orders.assignments')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                            <UserCheck className="w-4 h-4 mr-1.5 text-[#b17633]" />
                            {t('Assign Order')}
                        </Link>
                        <Link
                            href={route('artisan-payments.index')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                            <Hammer className="w-4 h-4 mr-1.5 text-[#b17633]" />
                            {t('Artisan Payment')}
                        </Link>
                        <Link
                            href={route('orders.create')}
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                            className="inline-flex items-center px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:opacity-90 active:opacity-100 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            {t('New Order')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={t('Order List')} />

            <div className="space-y-4 pb-16">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-400">{t('Total Orders')}</p>
                            <p className="text-xl font-extrabold text-gray-900 mt-1">
                                {isBn ? toBn(stats?.total_orders || 0) : (stats?.total_orders || 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b17633] flex items-center justify-center font-bold">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-400">{t('Pending Orders')}</p>
                            <p className="text-xl font-extrabold text-gray-900 mt-1">
                                {isBn ? toBn(stats?.pending_orders || 0) : (stats?.pending_orders || 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-400">{t('In Production')}</p>
                            <p className="text-xl font-extrabold text-gray-900 mt-1">
                                {isBn ? toBn(stats?.in_production_orders || 0) : (stats?.in_production_orders || 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <Hammer className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-400">{t('Completed Orders')}</p>
                            <p className="text-xl font-extrabold text-gray-900 mt-1">
                                {isBn ? toBn(stats?.completed_orders || 0) : (stats?.completed_orders || 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-center">
                        <div className="md:col-span-3 relative">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('Search order #, customer, item...')}
                                    className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:border-[#b17633] focus:ring-1 focus:ring-[#b17633]"
                                />
                            </div>
                        </div>

                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-10 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:border-[#b17633] focus:ring-1 focus:ring-[#b17633] font-semibold text-gray-700"
                            >
                                <option value="">{t('All Statuses')}</option>
                                <option value="new">{t('New Order')}</option>
                                <option value="assigned">{t('Assigned')}</option>
                                <option value="in_production">{t('In Production')}</option>
                                <option value="ready">{t('Ready for Delivery')}</option>
                                <option value="delivered">{t('Delivered')}</option>
                                <option value="cancelled">{t('Cancelled')}</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={metalType}
                                onChange={(e) => setMetalType(e.target.value)}
                                className="w-full h-10 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:border-[#b17633] focus:ring-1 focus:ring-[#b17633] font-semibold text-gray-700"
                            >
                                <option value="">{t('All Metals')}</option>
                                <option value="Gold">{t('Gold')}</option>
                                <option value="Silver">{t('Silver')}</option>
                                <option value="Platinum">{t('Platinum')}</option>
                                <option value="Diamond">{t('Diamond')}</option>
                            </select>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full h-10 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> {t('Clear')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-xs text-left min-w-[950px]">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap rounded-l-lg">{t('Order Date')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Delivery Date')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Invoice #')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Customer')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Phone')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-right whitespace-nowrap">{t('Total Bill')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-right whitespace-nowrap">{t('Received')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-right whitespace-nowrap">{t('Due')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Status')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-right whitespace-nowrap rounded-r-lg">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {orders.data && orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr 
                                            key={order.id} 
                                            className="hover:bg-amber-50/30 transition-colors"
                                        >
                                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                                                {formatDate(order.order_date)}
                                            </td>

                                            <td className="px-3 py-2.5 font-semibold text-amber-800 whitespace-nowrap">
                                                {formatDate(order.delivery_date)}
                                            </td>

                                            <td className="px-3 py-2.5 font-bold text-[#b17633] whitespace-nowrap">
                                                <Link href={route('orders.show', order.id)} className="hover:underline">
                                                    {isBn ? toBn(order.order_no) : order.order_no}
                                                </Link>
                                            </td>

                                            <td className="px-3 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                                {order.customer?.name || '—'}
                                            </td>

                                            <td className="px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                                                {order.customer?.phone ? (isBn ? toBn(order.customer.phone) : order.customer.phone) : '—'}
                                            </td>

                                            <td className="px-3 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(order.estimated_amount)) : fmtBDT(order.estimated_amount)}
                                            </td>

                                            <td className="px-3 py-2.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(order.advance_amount)) : fmtBDT(order.advance_amount)}
                                            </td>

                                            <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap">
                                                {Number(order.due_amount) > 0 ? (
                                                    <span className="text-rose-600">
                                                        {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(order.due_amount)) : fmtBDT(order.due_amount)}
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 font-bold">{t('Paid')}</span>
                                                )}
                                            </td>

                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>

                                            <td className="px-3 py-2.5 whitespace-nowrap text-right">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {t('Actions')}
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48">
                                                        <Link
                                                            href={route('orders.show', order.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="block w-full px-4 py-2 text-start text-xs leading-5 text-gray-800 hover:bg-amber-50 focus:outline-none flex items-center gap-2 cursor-pointer font-bold"
                                                        >
                                                            <Printer className="w-4 h-4 text-amber-600" /> {t('Print Invoice')}
                                                        </Link>

                                                        <Link
                                                            href={route('orders.edit', order.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="block w-full px-4 py-2 text-start text-xs leading-5 text-gray-800 hover:bg-blue-50 focus:outline-none flex items-center gap-2 cursor-pointer font-bold"
                                                        >
                                                            <Edit3 className="w-4 h-4 text-blue-600" /> {t('Edit Order')}
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openPaymentModal(order);
                                                            }}
                                                            className="block w-full px-4 py-2 text-start text-xs leading-5 text-gray-800 hover:bg-emerald-50 focus:outline-none flex items-center gap-2 cursor-pointer font-bold"
                                                        >
                                                            <DollarSign className="w-4 h-4 text-emerald-600" /> {t('Receive Payment')}
                                                        </button>

                                                        <div className="border-t border-gray-100 my-1"></div>

                                                        {order.status !== 'cancelled' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCancelOrder(order);
                                                                }}
                                                                className="block w-full px-4 py-2 text-start text-xs leading-5 text-amber-700 hover:bg-amber-50 focus:outline-none flex items-center gap-2 cursor-pointer font-bold"
                                                            >
                                                                <XCircle className="w-4 h-4 text-amber-600" /> {t('Cancel Order')}
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(order.id, order.order_no);
                                                            }}
                                                            className="block w-full px-4 py-2 text-start text-xs leading-5 text-rose-600 hover:bg-rose-50 focus:outline-none flex items-center gap-2 cursor-pointer font-bold"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-600" /> {t('Delete')}
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
                                            <p className="text-base font-semibold text-gray-600">{t('No custom orders found')}</p>
                                            <p className="text-xs text-gray-400 mt-1">{t('Get started by creating a new custom jewelry order.')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.links && (
                        <div className="pt-4 border-t border-gray-100">
                            <Pagination links={orders.links} />
                        </div>
                    )}
                </div>

            </div>

            {/* Customer Payment Modal (React Portal) */}
            {paymentModalOpen && selectedOrderForPayment && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 text-left my-8">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-amber-600 via-[#b17633] to-orange-600 text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{t('Receive Payment')}</h3>
                                    <p className="text-xs text-white/80">{t('Order')}: #{isBn ? toBn(selectedOrderForPayment.order_no) : selectedOrderForPayment.order_no}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPaymentModalOpen(false)}
                                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{t('Customer')}:</span>
                                    <span className="font-bold text-gray-900">{selectedOrderForPayment.customer?.name}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{t('Total Bill')}:</span>
                                    <span className="font-bold text-gray-900">
                                        {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedOrderForPayment.estimated_amount)) : fmtBDT(selectedOrderForPayment.estimated_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-emerald-600">
                                    <span>{t('Received')}:</span>
                                    <span className="font-bold">
                                        {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedOrderForPayment.advance_amount)) : fmtBDT(selectedOrderForPayment.advance_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-rose-600 font-bold border-t border-gray-200 pt-2">
                                    <span>{t('Due Amount')}:</span>
                                    <span>
                                        {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedOrderForPayment.due_amount)) : fmtBDT(selectedOrderForPayment.due_amount)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('Payment Amount')} ({isBn ? '৳' : 'BDT'}) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs select-none">{isBn ? '৳' : 'BDT'}</span>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0.01"
                                        required
                                        value={payData.amount}
                                        onFocus={handleNumberFocus}
                                        onChange={(e) => setPayData('amount', e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                                {payErrors.amount && <p className="text-xs text-rose-500 mt-1">{payErrors.amount}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={payProcessing}
                                    style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                    className="px-6 py-2 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {payProcessing ? t('Processing...') : t('Record Payment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
