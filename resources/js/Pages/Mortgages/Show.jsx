import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Landmark, 
    ArrowLeft, 
    Building2, 
    User, 
    Calendar, 
    Percent, 
    FileText, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Phone, 
    MapPin, 
    Plus, 
    Edit, 
    X, 
    Trash2, 
    DollarSign,
    Scale,
    Receipt,
    Printer
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Show({ mortgage }) {
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {isBn ? 'সচল (Active)' : 'Active'}</span>;
            case 'redeemed':
                return <span className="px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {isBn ? 'খালাসকৃত (Redeemed)' : 'Redeemed'}</span>;
            case 'overdue':
                return <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {isBn ? 'মেয়াদোত্তীর্ণ (Overdue)' : 'Overdue'}</span>;
            case 'forfeited':
                return <span className="px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {isBn ? 'বাজেয়াপ্ত (Forfeited)' : 'Forfeited'}</span>;
            default:
                return <span className="px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold">{status}</span>;
        }
    };

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Payment Form
    const paymentForm = useForm({
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_type: 'interest',
        notes: '',
    });

    // Status Form
    const statusForm = useForm({
        status: mortgage.status || 'active',
    });

    // Edit Form
    const editForm = useForm({
        due_date: mortgage.due_date || '',
        interest_rate: mortgage.interest_rate || '',
        interest_type: mortgage.interest_type || 'monthly',
        notes: mortgage.notes || '',
    });

    const totalPaid = (mortgage.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const remainingBalance = Math.max(0, Number(mortgage.principal_amount || 0) - totalPaid);

    const handleAddPayment = (e) => {
        e.preventDefault();
        paymentForm.post(route('mortgages.payments.store', mortgage.id), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                paymentForm.reset();
            }
        });
    };

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        statusForm.patch(route('mortgages.update-status', mortgage.id), {
            onSuccess: () => setIsStatusModalOpen(false)
        });
    };

    const handleUpdateDetails = (e) => {
        e.preventDefault();
        editForm.patch(route('mortgages.update', mortgage.id), {
            onSuccess: () => setIsEditModalOpen(false)
        });
    };

    const handleDeletePayment = (paymentId) => {
        if (confirm(isBn ? 'আপনি কি নিশ্চিত যে এই পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this payment?')) {
            paymentForm.delete(route('mortgages.payments.destroy', [mortgage.id, paymentId]));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden print:hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('mortgages.index')} 
                            className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                                    {isBn ? `মর্টগেজ #${toBn(mortgage.mortgage_no)}` : `Mortgage #${mortgage.mortgage_no}`}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsStatusModalOpen(true)}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    {getStatusBadge(mortgage.status)}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            {isBn ? 'প্রিন্ট' : 'Print'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-4 py-2.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
                        >
                            <Edit className="w-4 h-4" />
                            {isBn ? 'শর্ত পরিবর্তন' : 'Edit Terms'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="px-4 py-2.5 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 hover:opacity-90 active:opacity-100 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4" /> {isBn ? 'কিস্তি / সুদ জমা' : 'Add Payment'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? `মর্টগেজ ${toBn(mortgage.mortgage_no)}` : `Mortgage ${mortgage.mortgage_no}`} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Column: Customer & Details */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <User className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'গ্রাহকের তথ্য' : 'Customer Info'}
                        </h3>
                        {mortgage.customer ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 font-semibold mb-0.5">{isBn ? 'নাম' : 'Name'}</div>
                                    <div className="text-sm font-bold text-gray-900">{mortgage.customer.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-semibold mb-0.5">{isBn ? 'মোবাইল' : 'Phone'}</div>
                                    <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-amber-600" /> {mortgage.customer.phone ? (isBn ? toBn(mortgage.customer.phone) : mortgage.customer.phone) : '—'}
                                    </div>
                                </div>
                                {mortgage.customer.address && (
                                    <div>
                                        <div className="text-xs text-gray-500 font-semibold mb-0.5">{isBn ? 'ঠিকানা' : 'Address'}</div>
                                        <div className="text-sm font-medium text-gray-700 flex items-start gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" /> <span className="flex-1">{mortgage.customer.address}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">{isBn ? 'অজ্ঞাত গ্রাহক' : 'Unknown Customer'}</p>
                        )}
                    </div>

                    {/* Mortgage Summary */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                                {isBn ? 'ঋণ ও সুদের সারসংক্ষেপ' : 'Mortgage Summary'}
                            </h3>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1.5 border-b border-gray-50">
                                <span className="text-gray-500">{isBn ? 'মূল ঋণের পরিমাণ' : 'Principal Amount'}</span>
                                <span className="font-bold text-gray-900">{fmtMoney(mortgage.principal_amount)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-50">
                                <span className="text-gray-500">{isBn ? 'সুদের হার' : 'Interest Rate'}</span>
                                <span className="font-bold text-gray-900">
                                    {isBn ? `${toBn(mortgage.interest_rate)}% (${mortgage.interest_type === 'monthly' ? 'মাসিক' : mortgage.interest_type === 'yearly' ? 'বার্ষিক' : 'ফ্ল্যাট'})` : `${mortgage.interest_rate}% (${mortgage.interest_type})`}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-50">
                                <span className="text-gray-500">{isBn ? 'বন্ধকের তারিখ' : 'Mortgage Date'}</span>
                                <span className="font-semibold text-gray-800">
                                    {mortgage.mortgage_date ? (isBn ? toBn(String(mortgage.mortgage_date).substring(0, 10)) : String(mortgage.mortgage_date).substring(0, 10)) : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-50">
                                <span className="text-gray-500">{isBn ? 'পরিশোধের শেষ তারিখ' : 'Due Date'}</span>
                                <span className="font-semibold text-amber-700">
                                    {mortgage.due_date ? (isBn ? toBn(String(mortgage.due_date).substring(0, 10)) : String(mortgage.due_date).substring(0, 10)) : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-50">
                                <span className="text-gray-500">{isBn ? 'মোট পরিশোধিত কিস্তি' : 'Total Paid'}</span>
                                <span className="font-bold text-emerald-600">{fmtMoney(totalPaid)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 bg-amber-50/50 p-2 rounded-xl">
                                <span className="font-bold text-amber-900">{isBn ? 'অবশিষ্ট মূল ব্যালেন্স' : 'Remaining Balance'}</span>
                                <span className="font-black text-rose-600 text-base">{fmtMoney(remainingBalance)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Items & Payments */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* Section 1: Pledged Items Table */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Scale className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'বন্ধক রাখা গহনা সামগ্রী' : 'Pledged Jewelry Items'}
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[#e68a1d] text-white">
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'গহনার বিবরণ' : 'Item Description'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ধাতু ও ক্যারেট' : 'Metal & Purity'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ঐতিহ্যবাহী ওজন' : 'Traditional Weight'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মোট গ্রাম' : 'Gross Weight'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'আনুমানিক মূল্য' : 'Estimated Value'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {mortgage.items && mortgage.items.length > 0 ? (
                                        mortgage.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap">
                                                    {item.item_name}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    {item.metal_type} • {item.purity?.name || '22K'}
                                                </td>
                                                <td className="px-3 py-3 font-semibold text-amber-800 whitespace-nowrap">
                                                    {isBn 
                                                        ? `${toBn(item.vori || 0)} ভরি ${toBn(item.ana || 0)} আনা ${toBn(item.roti || 0)} রতি ${toBn(item.point || 0)} পয়েন্ট` 
                                                        : `${item.vori || 0}v ${item.ana || 0}a ${item.roti || 0}r ${item.point || 0}p`}
                                                </td>
                                                <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap">
                                                    {isBn ? `${toBn(item.gross_weight || 0)} গ্রাম` : `${item.gross_weight || 0}g`}
                                                </td>
                                                <td className="px-3 py-3 font-bold text-right text-gray-900 whitespace-nowrap">
                                                    {fmtMoney(item.estimated_value)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-6 text-center text-gray-400">
                                                {isBn ? 'কোনো গহনার বিবরণ পাওয়া যায়নি' : 'No items recorded for this mortgage'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 2: Payment History Table */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                                {isBn ? 'কিস্তি ও সুদ পরিশোধের ইতিহাস' : 'Payment History'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> {isBn ? 'পেমেন্ট যোগ করুন' : 'Add Payment'}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[#e68a1d] text-white">
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ধরণ' : 'Type'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মন্তব্য' : 'Notes'}</th>
                                        <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {mortgage.payments && mortgage.payments.length > 0 ? (
                                        mortgage.payments.map((pmt) => (
                                            <tr key={pmt.id} className="hover:bg-gray-50/50">
                                                <td className="px-3 py-3 font-semibold whitespace-nowrap">
                                                    {pmt.payment_date ? (isBn ? toBn(String(pmt.payment_date).substring(0, 10)) : String(pmt.payment_date).substring(0, 10)) : '—'}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        pmt.payment_type === 'interest' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {pmt.payment_type === 'interest' ? (isBn ? 'সুদ' : 'Interest') : (isBn ? 'আসল' : 'Principal')}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 font-bold text-emerald-600 whitespace-nowrap">
                                                    {fmtMoney(pmt.amount)}
                                                </td>
                                                <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                                                    {pmt.notes || '—'}
                                                </td>
                                                <td className="px-3 py-3 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePayment(pmt.id)}
                                                        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                        title="Delete Payment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-6 text-center text-gray-400">
                                                {isBn ? 'এখনো কোনো পেমেন্ট রেকর্ড নেই' : 'No payments recorded yet'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal 1: Add Payment Modal rendered via createPortal */}
            {isPaymentModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '520px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{isBn ? 'মর্টগেজ পেমেন্ট জমা দিন' : 'Record Mortgage Payment'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="mortgage-payment-form" onSubmit={handleAddPayment} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'পেমেন্টের তারিখ *' : 'Payment Date *'}
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={paymentForm.data.payment_date}
                                        onChange={e => paymentForm.setData('payment_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {isBn ? 'পরিমাণ (৳) *' : 'Amount (BDT) *'}
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0"
                                            onFocus={handleNumberFocus}
                                            required
                                            value={paymentForm.data.amount}
                                            onChange={e => paymentForm.setData('amount', cleanNumber(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {isBn ? 'পেমেন্টের ধরণ' : 'Payment Type'}
                                        </label>
                                        <select
                                            value={paymentForm.data.payment_type}
                                            onChange={e => paymentForm.setData('payment_type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold"
                                        >
                                            <option value="interest">{isBn ? 'সুদ (Interest)' : 'Interest'}</option>
                                            <option value="principal">{isBn ? 'আসল (Principal)' : 'Principal'}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'মন্তব্য' : 'Notes / Remarks'}</label>
                                    <textarea
                                        rows="2"
                                        value={paymentForm.data.notes}
                                        onChange={e => paymentForm.setData('notes', e.target.value)}
                                        placeholder={isBn ? 'পেমেন্ট সংক্রান্ত কোনো মন্তব্য...' : 'Optional payment notes...'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="mortgage-payment-form"
                                disabled={paymentForm.processing}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {paymentForm.processing ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পেমেন্ট সংরক্ষণ করুন' : 'Record Payment')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal 2: Update Status / Redeem Modal rendered via createPortal */}
            {isStatusModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '500px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{isBn ? 'মর্টগেজ স্ট্যাটাস পরিবর্তন' : 'Update Mortgage Status'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsStatusModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="mortgage-status-form" onSubmit={handleUpdateStatus} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'স্ট্যাটাস নির্বাচন করুন' : 'Select Status'}</label>
                                    <select
                                        value={statusForm.data.status}
                                        onChange={e => statusForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 focus:border-amber-500"
                                    >
                                        <option value="active">{isBn ? 'সচল (Active)' : 'Active (In Progress)'}</option>
                                        <option value="redeemed">{isBn ? 'খালাসকৃত / সম্পন্ন (Redeemed)' : 'Redeemed (Paid & Items Returned)'}</option>
                                        <option value="overdue">{isBn ? 'মেয়াদোত্তীর্ণ (Overdue)' : 'Overdue (Payment Pending)'}</option>
                                        <option value="forfeited">{isBn ? 'বাজেয়াপ্ত (Forfeited)' : 'Forfeited (Pledged Items Claimed)'}</option>
                                    </select>
                                </div>

                                <p className="text-xs text-gray-500 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                                    💡 {isBn ? 'স্ট্যাটাস খালাসকৃত (Redeemed) করলে বোঝাবে গ্রাহক ঋণ পরিশোধ করে গহনা ফেরত নিয়ে গেছেন।' : 'Setting the status to Redeemed marks the pledged jewelry as returned to the customer.'}
                                </p>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsStatusModalOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="mortgage-status-form"
                                disabled={statusForm.processing}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {statusForm.processing ? (isBn ? 'আপডেট হচ্ছে...' : 'Updating...') : (isBn ? 'স্ট্যাটাস আপডেট করুন' : 'Update Status')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal 3: Edit Details Modal rendered via createPortal */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '520px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <Edit className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{isBn ? 'মর্টগেজ শর্তাবলী পরিবর্তন' : 'Edit Mortgage Details'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="mortgage-edit-form" onSubmit={handleUpdateDetails} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'পরিশোধের শেষ তারিখ' : 'Due Date'}</label>
                                    <input
                                        type="date"
                                        value={editForm.data.due_date}
                                        onChange={e => editForm.setData('due_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:border-amber-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'সুদের হার (%)' : 'Interest Rate (%)'}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0"
                                            onFocus={handleNumberFocus}
                                            value={editForm.data.interest_rate}
                                            onChange={e => editForm.setData('interest_rate', cleanNumber(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'সুদের ধরণ' : 'Interest Type'}</label>
                                        <select
                                            value={editForm.data.interest_type}
                                            onChange={e => editForm.setData('interest_type', e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold focus:border-amber-500"
                                        >
                                            <option value="monthly">{isBn ? 'মাসিক' : 'Monthly'}</option>
                                            <option value="yearly">{isBn ? 'বার্ষিক' : 'Yearly'}</option>
                                            <option value="flat">{isBn ? 'ফ্ল্যাট' : 'Flat'}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'নোট / বিবরণ' : 'Notes'}</label>
                                    <textarea
                                        value={editForm.data.notes}
                                        onChange={e => editForm.setData('notes', e.target.value)}
                                        rows="2"
                                        placeholder={isBn ? 'মর্টগেজ সম্পর্কিত নোট...' : 'Notes...'}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="mortgage-edit-form"
                                disabled={editForm.processing}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {editForm.processing ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
