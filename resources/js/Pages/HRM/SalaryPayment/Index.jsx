import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { Banknote, Plus, Trash2, RotateCcw, Search } from 'lucide-react';

export default function Index({ auth, payments, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [paymentNo, setPaymentNo] = useState(filters.payment_no || '');

    useFilter(route('hrm.salary.index'), {
        payment_no: paymentNo,
    });

    const handleReset = () => {
        setPaymentNo('');
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    const getMethodLabel = (method) => {
        switch (method) {
            case 'cash':
                return isBn ? 'নগদ (Cash)' : 'Cash';
            case 'bank_transfer':
                return isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer';
            case 'cheque':
                return isBn ? 'চেক (Cheque)' : 'Cheque';
            case 'mobile_money':
                return isBn ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking';
            default:
                return method;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isBn ? 'বেতন প্রদানের ইতিহাস' : 'Salary Payments History'} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                        <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">
                            {isBn ? 'বেতন পরিশোধের ইতিহাস' : 'Salary Payments History'}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {isBn ? 'কর্মীদের বেতন পরিশোধের ট্রানজেকশন ও ভাউচার তালিকা' : 'View all staff salary disbursement vouchers and records'}
                        </p>
                    </div>
                </div>
                <Link
                    href={route('hrm.salary.create')}
                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                    className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'বেতন প্রদান করুন' : 'Record Salary Payment'}</span>
                </Link>
            </div>

            <div className="space-y-4">
                {/* Filter Area */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-64">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পেমেন্ট ভাউচার নম্বর' : 'Payment No'}
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={paymentNo}
                                    onChange={(e) => setPaymentNo(e.target.value)}
                                    placeholder={isBn ? 'ভাউচার নং দিয়ে খুঁজুন...' : 'Search by payment no...'}
                                    className="w-full pl-8 border border-gray-200 bg-gray-50 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-xs py-2 px-3" 
                                />
                            </div>
                        </div>
                        <div className="pt-5">
                            <button 
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-200 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> {isBn ? 'রিসেট' : 'Clear'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ক্রমিক' : 'SL'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ভাউচার নং' : 'Payment No'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কর্মীর নাম' : 'Staff Name'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পদ্ধতি' : 'Method'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'পরিশোধিত অর্থ' : 'Amount'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {payments.data && payments.data.length > 0 ? (
                                    payments.data.map((payment, index) => (
                                        <tr key={payment.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 text-gray-500 font-mono">
                                                {isBn ? toBn((payments.current_page - 1) * payments.per_page + index + 1) : (payments.current_page - 1) * payments.per_page + index + 1}
                                            </td>
                                            <td className="px-3 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                {payment.payment_no}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-800 font-medium whitespace-nowrap">
                                                {payment.payment_date ? (isBn ? toBn(payment.payment_date) : payment.payment_date) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                                {payment.staff?.name || '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                    {getMethodLabel(payment.payment_method)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold font-mono text-emerald-700 whitespace-nowrap">
                                                {fmtMoney(payment.amount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {isBn ? 'অ্যাকশন' : 'Actions'}
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        <Dropdown.Link
                                                            href={route('hrm.salary.destroy', payment.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="flex items-center text-xs text-rose-600 hover:bg-rose-50 w-full"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" /> {isBn ? 'পেমেন্ট মুছে ফেলুন' : 'Delete Payment'}
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <Banknote className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন বেতন পরিশোধের রেকর্ড পাওয়া যায়নি।' : 'No payment records found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments.links && (
                        <div className="mt-4">
                            <Pagination links={payments.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
