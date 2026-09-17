import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import axios from 'axios';
import { 
    Hammer, 
    Plus, 
    Search, 
    DollarSign, 
    Calendar, 
    Trash2, 
    X, 
    UserPlus,
    Building2,
    Save
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function ArtisanPayments({ payments, duePaymentsList = [], artisans: initialArtisans = [], branches = [], orders = [], filters = {}, stats = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

    const cleanNumber = (val) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        if (/^0+[0-9]/.test(str)) {
            str = str.replace(/^0+/, '');
        }
        return str;
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

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
        rate: '',
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
        if (confirm(isBn ? `আপনি কি নিশ্চিত যে পেমেন্ট রেকর্ড ${paymentNo} মুছে ফেলতে চান?` : `Are you sure you want to delete payment record ${paymentNo}?`)) {
            router.delete(route('artisan-payments.destroy', id));
        }
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [artisanIdFilter, setArtisanIdFilter] = useState(filters?.artisan_id || '');
    const [paymentMethod, setPaymentMethod] = useState(filters?.payment_method || '');

    useFilter(route('artisan-payments.index'), {
        search,
        artisan_id: artisanIdFilter,
        payment_method: paymentMethod
    });

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
                setArtisanForm({ name: '', phone: '', address: '', specialization: 'Goldsmith (কারিগর)', wage_type: 'fixed', rate: '', status: 'active' });
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
                            <Hammer className="h-7 w-7" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'কারিগর মজুরি পরিশোধ' : 'Artisan Payments'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPaymentModal(true)}
                        className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {isBn ? 'পেমেন্ট প্রদান করুন' : 'Record Payment'}
                    </button>
                </div>
            }
        >
            <Head title={isBn ? 'কারিগর মজুরি পরিশোধ' : 'Artisan Payments'} />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'মোট পেমেন্ট সংখ্যা' : 'Total Payments Recorded'}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{isBn ? toBn(stats?.total_payments || 0) : (stats?.total_payments || 0)}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                        <Hammer className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'মোট পরিশোধিত মজুরি' : 'Total Amount Paid'}</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{fmtMoney(stats?.total_amount || 0)}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'আজকে পরিশোধ' : 'Paid Today'}</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">{fmtMoney(stats?.today_amount || 0)}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'মোট বাকি মজুরি' : 'Total Pending Dues'}</p>
                        <p className="text-2xl font-bold text-rose-600 mt-1">{fmtMoney(stats?.total_artisan_due || 0)}</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('dues')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'dues'
                            ? 'text-white shadow-xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                    style={activeTab === 'dues' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                >
                    <DollarSign className="w-4 h-4" />
                    {isBn ? `বকেয়া মজুরির তালিকা (${toBn(duePaymentsList?.length || 0)})` : `Pending Dues (${duePaymentsList?.length || 0})`}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'history'
                            ? 'text-white shadow-xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                    style={activeTab === 'history' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                >
                    <Calendar className="w-4 h-4" />
                    {isBn ? `পেমেন্টের ইতিহাস (${toBn(payments?.total || 0)})` : `Payment History (${payments?.total || 0})`}
                </button>
            </div>

            {/* 1. ARTISAN DUE PAYMENT LIST TAB */}
            {activeTab === 'dues' && (
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কারিগর' : 'Artisan'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'দক্ষতা' : 'Specialization'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মোবাইল' : 'Phone'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{isBn ? 'বরাদ্দকৃত কাজ' : 'Assigned Orders'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মোট প্রদেয়' : 'Total Payable'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মোট পরিশোধিত' : 'Total Paid'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'বকেয়া' : 'Due Amount'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {duePaymentsList && duePaymentsList.length > 0 ? (
                                    duePaymentsList.map((artisan) => (
                                        <tr key={artisan.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{artisan.name}</div>
                                                <div className="text-[11px] text-gray-400">{isBn ? toBn(artisan.code) : artisan.code}</div>
                                            </td>
                                            <td className="px-3 py-3 font-medium text-indigo-700 whitespace-nowrap">
                                                {artisan.specialization || (isBn ? 'স্বর্ণের কারিগর' : 'Goldsmith')}
                                            </td>
                                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                                                {artisan.phone ? (isBn ? toBn(artisan.phone) : artisan.phone) : '—'}
                                            </td>
                                            <td className="px-3 py-3 text-center font-bold text-gray-800 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-xs border border-amber-200">
                                                    {isBn ? `${toBn(artisan.total_orders)} টি অর্ডার` : `${artisan.total_orders} Orders`}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap">
                                                {fmtMoney(artisan.total_payable)}
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-emerald-600 whitespace-nowrap">
                                                {fmtMoney(artisan.total_paid)}
                                            </td>
                                            <td className="px-3 py-3 font-bold whitespace-nowrap">
                                                {artisan.due_amount > 0 ? (
                                                    <span className="text-rose-600">{fmtMoney(artisan.due_amount)}</span>
                                                ) : (
                                                    <span className="text-emerald-600 font-bold">{isBn ? 'পরিশোধিত' : 'Paid'}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right whitespace-nowrap">
                                                {artisan.due_amount > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openPaymentForArtisan(artisan)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                                                    >
                                                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                                                        {isBn ? 'মজুরি দিন' : 'Give Payment'}
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                                                        {isBn ? 'পরিশোধিত' : 'Paid'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-gray-400">
                                            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-base font-semibold text-gray-600">{isBn ? 'কোনো বাকি মজুরি নেই' : 'No pending artisan dues'}</p>
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
                <div className="space-y-6">
                    {/* Filter Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                                <div className="relative flex-1 w-full">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={isBn ? 'পেমেন্ট নং, কারিগরের নাম...' : 'Search payment #, artisan name...'}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <select
                                    value={artisanIdFilter}
                                    onChange={(e) => setArtisanIdFilter(e.target.value)}
                                    className="w-full sm:w-48 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                                >
                                    <option value="">{isBn ? 'সব কারিগর' : 'All Artisans'}</option>
                                    {artisans.map((artisan) => (
                                        <option key={artisan.id} value={artisan.id}>
                                            {artisan.name} ({isBn ? toBn(artisan.code) : artisan.code})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full sm:w-44 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                                >
                                    <option value="">{isBn ? 'সব মাধ্যম' : 'All Methods'}</option>
                                    <option value="Cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                                    <option value="bKash">{isBn ? 'বিকাশ' : 'bKash'}</option>
                                    <option value="Bank Transfer">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                                    <option value="Cheque">{isBn ? 'চেক' : 'Cheque'}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Standard Table Container */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                        <div className="overflow-x-auto min-h-[320px] pb-40">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#e68a1d] text-white">
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পেমেন্ট নং' : 'Payment #'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কারিগর' : 'Artisan'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'শাখা' : 'Branch'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'সম্পর্কিত অর্ডার' : 'Related Order'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মাধ্যম' : 'Method'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পরিশোধের পরিমাণ' : 'Amount Paid'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                    {payments.data && payments.data.length > 0 ? (
                                        payments.data.map((pmt) => (
                                            <tr key={pmt.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-3 py-3 font-semibold text-amber-700 whitespace-nowrap">
                                                    {isBn ? toBn(pmt.payment_no) : pmt.payment_no}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900">{pmt.artisan?.name}</div>
                                                    <div className="text-[11px] text-gray-400">{isBn ? toBn(pmt.artisan?.code) : pmt.artisan?.code}</div>
                                                </td>
                                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                                                    {pmt.branch?.name || '—'}
                                                </td>
                                                <td className="px-3 py-3 font-medium text-amber-800 whitespace-nowrap">
                                                    {pmt.order ? (
                                                        <Link href={route('orders.show', pmt.order.id)} className="hover:underline font-bold">
                                                            {isBn ? toBn(pmt.order.order_no) : pmt.order.order_no}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">{isBn ? 'সাধারণ পেমেন্ট' : 'General Payment'}</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                                                    {pmt.payment_date ? (isBn ? toBn(String(pmt.payment_date).substring(0, 10)) : String(pmt.payment_date).substring(0, 10)) : '—'}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                                        {pmt.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 font-bold text-emerald-600 whitespace-nowrap">
                                                    {fmtMoney(pmt.amount)}
                                                </td>
                                                <td className="px-3 py-3 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(pmt.id, pmt.payment_no)}
                                                        className="inline-flex p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                        title={isBn ? 'পেমেন্ট মুছুন' : 'Delete Payment Record'}
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
                                                <p className="text-base font-semibold text-gray-600">{isBn ? 'কোনো পেমেন্ট রেকর্ড নেই' : 'No artisan payments recorded'}</p>
                                                <p className="text-xs text-gray-400 mt-1">{isBn ? 'কারিগরের কাজের মজুরি পরিশোধ রেকর্ড করুন।' : 'Record a payment to craftsmen for order labor.'}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {payments.links && payments.links.length > 3 && (
                            <div className="mt-4">
                                <Pagination links={payments.links} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal 1: Record Artisan Payment Modal rendered with createPortal */}
            {showPaymentModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '600px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{isBn ? 'কারিগর মজুরি পরিশোধ করুন' : 'Record Artisan Payment'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="record-payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
                                {/* Branch */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'শাখা' : 'Branch'} <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => setData('branch_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="">{isBn ? 'শাখা নির্বাচন করুন' : 'Select Branch'}</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    {errors.branch_id && <p className="text-xs text-rose-500 mt-1">{errors.branch_id}</p>}
                                </div>

                                {/* Artisan + Quick Add button */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'কারিগর' : 'Artisan'} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={data.artisan_id}
                                            onChange={(e) => setData('artisan_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">{isBn ? 'কারিগর নির্বাচন করুন' : 'Select Artisan'}</option>
                                            {artisans.map((art) => (
                                                <option key={art.id} value={art.id}>
                                                    {art.name} ({isBn ? toBn(art.code) : art.code})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowArtisanModal(true)}
                                            className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center cursor-pointer"
                                            title={isBn ? 'নতুন কারিগর যোগ করুন' : 'Add New Artisan'}
                                        >
                                            <UserPlus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {errors.artisan_id && <p className="text-xs text-rose-500 mt-1">{errors.artisan_id}</p>}
                                </div>

                                {/* Related Order (Optional) */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'সম্পর্কিত অর্ডার (ঐচ্ছিক)' : 'Related Order (Optional)'}
                                    </label>
                                    <select
                                        value={data.order_id}
                                        onChange={(e) => setData('order_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="">{isBn ? 'কোনো নির্দিষ্ট অর্ডার নয় (সাধারণ মজুরি)' : 'General Payment (No specific order)'}</option>
                                        {orders && orders.map((ord) => (
                                            <option key={ord.id} value={ord.id}>
                                                {isBn ? toBn(ord.order_no) : ord.order_no} - {ord.product_name || ord.category || (isBn ? 'পণ্য' : 'Item')} ({ord.customer?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {isBn ? 'পরিশোধের তারিখ' : 'Payment Date'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                        {errors.payment_date && <p className="text-xs text-rose-500 mt-1">{errors.payment_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {isBn ? 'পরিমাণ (৳)' : 'Amount (BDT)'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0"
                                            onFocus={handleNumberFocus}
                                            required
                                            value={data.amount}
                                            onChange={(e) => setData('amount', cleanNumber(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                        {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                                    </label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="Cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                                        <option value="bKash">{isBn ? 'বিকাশ' : 'bKash'}</option>
                                        <option value="Bank Transfer">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                                        <option value="Cheque">{isBn ? 'চেক' : 'Cheque'}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'নোট / মন্তব্য' : 'Notes / Remarks'}</label>
                                    <textarea
                                        rows="2"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder={isBn ? 'পেমেন্ট সম্পর্কিত বিবরণ...' : 'Payment notes...'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="record-payment-form"
                                disabled={processing}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পেমেন্ট সংরক্ষণ করুন' : 'Record Payment')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal 2: Quick Add Artisan Modal rendered with createPortal */}
            {showArtisanModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '560px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{isBn ? 'নতুন কারিগর যোগ করুন' : 'Add New Artisan'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowArtisanModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="quick-artisan-form" onSubmit={handleQuickArtisanSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'কারিগরের নাম' : 'Artisan Name'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={artisanForm.name}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, name: e.target.value })}
                                        placeholder={isBn ? 'কারিগরের নাম লিখুন' : 'Artisan Name'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    {artisanErrors.name && <p className="text-xs text-rose-500 mt-1">{artisanErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={artisanForm.phone}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, phone: e.target.value })}
                                        placeholder={isBn ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    {artisanErrors.phone && <p className="text-xs text-rose-500 mt-1">{artisanErrors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'দক্ষতা / বিভাগ' : 'Specialization'}</label>
                                    <input
                                        type="text"
                                        value={artisanForm.specialization}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, specialization: e.target.value })}
                                        placeholder={isBn ? 'স্বর্ণের কারিগর / রত্ন কারিগর' : 'Goldsmith (কারিগর)'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'ঠিকানা' : 'Address'}</label>
                                    <textarea
                                        rows="2"
                                        value={artisanForm.address}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, address: e.target.value })}
                                        placeholder={isBn ? 'কারিগরের ঠিকানা...' : 'Artisan address...'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowArtisanModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="quick-artisan-form"
                                disabled={isSavingArtisan}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {isSavingArtisan ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save Artisan')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
