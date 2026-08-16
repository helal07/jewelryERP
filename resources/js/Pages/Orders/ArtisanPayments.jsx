import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import axios from 'axios';
import { 
    Hammer, 
    Plus, 
    Search, 
    Filter, 
    DollarSign, 
    Calendar, 
    Trash2, 
    X, 
    FileText, 
    UserPlus,
    Building2,
    Save
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function ArtisanPayments({ payments, duePaymentsList = [], artisans: initialArtisans, branches, orders, filters, stats }) {
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('dues');
    const [artisans, setArtisans] = useState(initialArtisans || []);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showArtisanModal, setShowArtisanModal] = useState(false);

    // Payment Form State
    const { data, setData, post, processing, errors, reset } = useForm({
        artisan_id: '',
        branch_id: branches?.[0]?.id || '',
        order_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'Cash',
        notes: '',
    });

    const openPaymentForArtisan = (artisanItem) => {
        setData({
            artisan_id: artisanItem.id,
            branch_id: artisanItem.branch_id || branches?.[0]?.id || '',
            order_id: '',
            payment_date: new Date().toISOString().split('T')[0],
            amount: artisanItem.due_amount > 0 ? artisanItem.due_amount : '',
            payment_method: 'Cash',
            notes: `Wage payment for ${artisanItem.name}`,
        });
        setShowPaymentModal(true);
    };

    // Quick Artisan Form State
    const [artisanForm, setArtisanForm] = useState({
        name: '',
        phone: '',
        address: '',
        specialization: 'Goldsmith (কারিগর)',
        wage_type: 'fixed',
        rate: '0',
        status: 'active'
    });
    const [artisanErrors, setArtisanErrors] = useState({});
    const [isSavingArtisan, setIsSavingArtisan] = useState(false);

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        post(route('artisan-payments.store'), {
            onSuccess: () => {
                setShowPaymentModal(false);
                reset();
            }
        });
    };

    const handleDelete = (id, paymentNo) => {
        if (confirm(`Are you sure you want to delete payment record ${paymentNo}?`)) {
            router.delete(route('artisan-payments.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const form = e.target;
        router.get(route('artisan-payments.index'), {
            search: form.search.value,
            artisan_id: form.artisan_id.value,
            payment_method: form.payment_method.value,
        }, { preserveState: true });
    };

    // Save Artisan Inline via Axios
    const handleQuickArtisanSubmit = async (e) => {
        e.preventDefault();
        setArtisanErrors({});
        setIsSavingArtisan(true);

        const payload = {};
        Object.keys(artisanForm).forEach(key => {
            const val = artisanForm[key];
            if (val !== null && val !== undefined && val !== '') {
                payload[key] = val;
            }
        });

        try {
            const response = await axios.post(route('artisans.store'), payload, {
                headers: { 
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (response.data && response.data.artisan) {
                const newArtisan = response.data.artisan;
                setArtisans((prev) => [newArtisan, ...prev]);
                setData('artisan_id', newArtisan.id);
                setShowArtisanModal(false);
                setArtisanForm({ name: '', phone: '', address: '', specialization: 'Goldsmith (কারিগর)', wage_type: 'fixed', rate: '0', status: 'active' });
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setArtisanErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                alert('Artisan Error: ' + err.response.data.message);
            } else {
                alert('Failed to save artisan. Please check inputs.');
            }
        } finally {
            setIsSavingArtisan(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Hammer className="h-7 w-7 text-amber-600" />
                            {t('artisanPayment') || 'Artisan Payment'}
                        </h2>
                    </div>

                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Record Payment
                    </button>
                </div>
            }
        >
            <Head title="Artisan Payments" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Total Payments Recorded</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_payments || 0}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Hammer className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Total Amount Paid</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">৳{Number(stats?.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Paid Today</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">৳{Number(stats?.today_amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Total Pending Dues</p>
                        <p className="text-2xl font-bold text-rose-600 mt-1">৳{Number(stats?.total_artisan_due || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setActiveTab('dues')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'dues'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <DollarSign className="w-4 h-4" />
                    Pending Dues ({duePaymentsList?.length || 0})
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'history'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <Calendar className="w-4 h-4" />
                    Payment History ({payments?.total || 0})
                </button>
            </div>

            {/* 1. ARTISAN DUE PAYMENT LIST TAB */}
            {activeTab === 'dues' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-600" /> Artisan Pending Dues & Balances
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-4 px-6">Artisan</th>
                                    <th className="py-4 px-6">Specialization</th>
                                    <th className="py-4 px-6">Phone</th>
                                    <th className="py-4 px-6 text-center">Assigned Work Orders</th>
                                    <th className="py-4 px-6">Total Payable</th>
                                    <th className="py-4 px-6">Total Paid</th>
                                    <th className="py-4 px-6">Due Amount</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                {duePaymentsList && duePaymentsList.length > 0 ? (
                                    duePaymentsList.map((artisan) => (
                                        <tr key={artisan.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900">{artisan.name}</div>
                                                <div className="text-xs text-gray-400">{artisan.code}</div>
                                            </td>
                                            <td className="py-4 px-6 text-xs font-medium text-indigo-700">
                                                {artisan.specialization || 'Goldsmith'}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-600">
                                                {artisan.phone || '—'}
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-gray-800">
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-xs border border-amber-200">
                                                    {artisan.total_orders} Orders
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-gray-900">
                                                ৳{Number(artisan.total_payable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-emerald-600">
                                                ৳{Number(artisan.total_paid).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-6 font-bold">
                                                {artisan.due_amount > 0 ? (
                                                    <span className="text-rose-600">৳{Number(artisan.due_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <span className="text-emerald-600 font-bold">Paid</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {artisan.due_amount > 0 ? (
                                                    <button
                                                        onClick={() => openPaymentForArtisan(artisan)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
                                                    >
                                                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                                                        Give Payment
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                                                        Paid
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-gray-400">
                                            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-base font-semibold text-gray-600">No pending artisan dues</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 2. PAYMENT HISTORY TAB */}
            {activeTab === 'history' && (
                <>
                    {/* Filter Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                                <div className="relative flex-1 w-full">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="search"
                                        defaultValue={filters?.search || ''}
                                        placeholder="Search payment #, artisan name..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <select
                                    name="artisan_id"
                                    defaultValue={filters?.artisan_id || ''}
                                    className="w-full sm:w-48 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                                >
                                    <option value="">All Artisans</option>
                                    {artisans.map((artisan) => (
                                        <option key={artisan.id} value={artisan.id}>
                                            {artisan.name} ({artisan.code})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="payment_method"
                                    defaultValue={filters?.payment_method || ''}
                                    className="w-full sm:w-44 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                                >
                                    <option value="">All Methods</option>
                                    <option value="Cash">Cash</option>
                                    <option value="bKash">bKash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                </select>

                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 shadow-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Payments Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-4 px-6">Payment #</th>
                                        <th className="py-4 px-6">Artisan</th>
                                        <th className="py-4 px-6">Branch</th>
                                        <th className="py-4 px-6">Related Order</th>
                                        <th className="py-4 px-6">Date</th>
                                        <th className="py-4 px-6">Method</th>
                                        <th className="py-4 px-6">Amount Paid</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {payments.data && payments.data.length > 0 ? (
                                        payments.data.map((pmt) => (
                                            <tr key={pmt.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 font-semibold text-amber-700">
                                                    {pmt.payment_no}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">{pmt.artisan?.name}</div>
                                                    <div className="text-xs text-gray-400">{pmt.artisan?.code}</div>
                                                </td>
                                                <td className="py-4 px-6 text-xs text-gray-600">
                                                    {pmt.branch?.name || '—'}
                                                </td>
                                                <td className="py-4 px-6 text-xs font-medium text-amber-800">
                                                    {pmt.order ? (
                                                        <Link href={route('orders.show', pmt.order.id)} className="hover:underline font-bold">
                                                            {pmt.order.order_no}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">General Payment</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                                                    {pmt.payment_date ? String(pmt.payment_date).substring(0, 10) : '—'}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                                        {pmt.payment_method}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 font-bold text-emerald-600">
                                                    ৳{Number(pmt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(pmt.id, pmt.payment_no)}
                                                        className="inline-flex p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete Payment Record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-gray-400">
                                                <Hammer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p className="text-base font-semibold text-gray-600">No artisan payments recorded</p>
                                                <p className="text-xs text-gray-400 mt-1">Record a payment to craftsmen for order labor.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {payments.links && payments.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    Showing <span className="font-semibold text-gray-700">{payments.from}</span> to <span className="font-semibold text-gray-700">{payments.to}</span> of <span className="font-semibold text-gray-700">{payments.total}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {payments.links.map((link, key) => (
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
                </>
            )}

            {/* Record Payment Modal */}
            <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} maxWidth="lg">
                <div className="p-6 text-left space-y-5 bg-white rounded-2xl">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <Hammer className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        {/* Artisan Selection + Add Artisan Button */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Select Artisan <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={data.artisan_id}
                                    onChange={(e) => setData('artisan_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">Choose Artisan</option>
                                    {artisans.map((art) => (
                                        <option key={art.id} value={art.id}>
                                            {art.name} ({art.code}) {art.due_balance > 0 ? `- Due: ৳${art.due_balance}` : ''}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() => setShowArtisanModal(true)}
                                    className="p-2.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center"
                                    title="Add New Artisan"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            </div>
                            {errors.artisan_id && <p className="text-xs text-rose-500 mt-1">{errors.artisan_id}</p>}
                        </div>

                        {/* Branch */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Branch <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Optional Order Link */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Link to Custom Order (Optional)
                            </label>
                            <select
                                value={data.order_id}
                                onChange={(e) => setData('order_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="">None (General Wage Payment)</option>
                                {orders.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.order_no} - {o.product_description?.substring(0, 30)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Date & Amount */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Payment Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Amount (৳) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Payment Method <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="Cash">Cash</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Payment Notes / Remarks
                            </label>
                            <input
                                type="text"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="e.g. Labor charge for ring polish"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <DollarSign className="w-3.5 h-3.5" />
                                {processing ? 'Processing...' : 'Record Payment'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Quick Artisan Modal */}
            <Modal show={showArtisanModal} onClose={() => setShowArtisanModal(false)} maxWidth="lg">
                <div className="p-6 text-left space-y-5 bg-white rounded-2xl">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Artisan</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowArtisanModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleQuickArtisanSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Artisan Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={artisanForm.name}
                                onChange={(e) => setArtisanForm({ ...artisanForm, name: e.target.value })}
                                placeholder="Enter artisan name"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                            {artisanErrors.name && <p className="text-xs text-rose-500 mt-1">{artisanErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Phone Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={artisanForm.phone}
                                onChange={(e) => setArtisanForm({ ...artisanForm, phone: e.target.value })}
                                placeholder="Enter contact phone number"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                            {artisanErrors.phone && <p className="text-xs text-rose-500 mt-1">{artisanErrors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization</label>
                            <input
                                type="text"
                                value={artisanForm.specialization}
                                onChange={(e) => setArtisanForm({ ...artisanForm, specialization: e.target.value })}
                                placeholder="e.g. Goldsmith, Polisher, Setter"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={artisanForm.address}
                                onChange={(e) => setArtisanForm({ ...artisanForm, address: e.target.value })}
                                placeholder="Address (Optional)"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowArtisanModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingArtisan}
                                className="px-6 py-2 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-3.5 h-3.5" />
                                {isSavingArtisan ? 'Saving...' : 'Save Artisan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
