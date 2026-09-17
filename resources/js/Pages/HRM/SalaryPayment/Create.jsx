import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Banknote } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Create({ auth, payrolls = [], staffs = [], branches = [], selectedPayroll = null }) {
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

    const { data, setData, post, processing, errors } = useForm({
        payroll_id: selectedPayroll ? selectedPayroll.id : '',
        staff_id: selectedPayroll ? selectedPayroll.staff_id : '',
        branch_id: selectedPayroll ? selectedPayroll.branch_id : '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: selectedPayroll ? String(selectedPayroll.net_salary) : '',
        payment_method: 'cash',
        notes: '',
    });

    const [currentPayroll, setCurrentPayroll] = useState(selectedPayroll);

    const handlePayrollChange = (e) => {
        const pId = e.target.value;
        const payroll = payrolls.find(p => String(p.id) === String(pId));
        setCurrentPayroll(payroll);
        setData(prev => ({
            ...prev,
            payroll_id: pId,
            staff_id: payroll ? payroll.staff_id : '',
            branch_id: payroll ? payroll.branch_id : '',
            amount: payroll ? String(payroll.net_salary) : ''
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('hrm.salary.store'));
    };

    const months = [
        { value: 1, labelEn: 'January', labelBn: 'জানুয়ারি' },
        { value: 2, labelEn: 'February', labelBn: 'ফেব্রুয়ারি' },
        { value: 3, labelEn: 'March', labelBn: 'মার্চ' },
        { value: 4, labelEn: 'April', labelBn: 'এপ্রিল' },
        { value: 5, labelEn: 'May', labelBn: 'মে' },
        { value: 6, labelEn: 'June', labelBn: 'জুন' },
        { value: 7, labelEn: 'July', labelBn: 'জুলাই' },
        { value: 8, labelEn: 'August', labelBn: 'আগস্ট' },
        { value: 9, labelEn: 'September', labelBn: 'সেপ্টেম্বর' },
        { value: 10, labelEn: 'October', labelBn: 'অক্টোবর' },
        { value: 11, labelEn: 'November', labelBn: 'নভেম্বর' },
        { value: 12, labelEn: 'December', labelBn: 'ডিসেম্বর' },
    ];

    const getMonthLabel = (mVal) => {
        const m = months.find(item => Number(item.value) === Number(mVal));
        if (!m) return mVal;
        return isBn ? m.labelBn : m.labelEn;
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'বেতন পরিশোধ করুন' : 'Record Salary Payment'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'কর্মীর প্রস্তুতকৃত পে-রোল বিল নিষ্পত্তি ও পরিশোধের ভাউচার তৈরি করুন' : 'Disburse salary against approved payroll sheets'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('hrm.salary.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to Payments'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'বেতন পরিশোধ' : 'Record Salary Payment'} />

            <div className="max-w-3xl mx-auto pb-12 mt-4">
                <form onSubmit={submit} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Payroll Select */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পে-রোল নির্বাচন করুন (অনুমোদিত/খসড়া)' : 'Select Payroll (Approved/Draft)'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.payroll_id}
                                onChange={handlePayrollChange}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            >
                                <option value="">{isBn ? 'বকেয়া পে-রোল নির্বাচন করুন' : 'Select an unpaid payroll'}</option>
                                {payrolls.map(payroll => (
                                    <option key={payroll.id} value={payroll.id}>
                                        {payroll.staff?.name} — {getMonthLabel(payroll.month)} {isBn ? toBn(payroll.year) : payroll.year} ({isBn ? 'নিট' : 'Net'}: {fmtMoney(payroll.net_salary)})
                                    </option>
                                ))}
                            </select>
                            {errors.payroll_id && <p className="text-xs text-rose-600 mt-1">{errors.payroll_id}</p>}
                        </div>

                        {/* Readonly Staff / Branch Info */}
                        {currentPayroll && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'কর্মীর নাম' : 'Staff Member'}
                                    </label>
                                    <div className="w-full py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-100 text-xs font-bold text-gray-800">
                                        {currentPayroll.staff?.name} {currentPayroll.staff?.employee_code ? `(${currentPayroll.staff?.employee_code})` : ''}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'বকেয়া নিট বেতন' : 'Net Salary Due'}
                                    </label>
                                    <div className="w-full py-2.5 px-3 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-gray-900 font-mono">
                                        {fmtMoney(currentPayroll.net_salary)}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পরিশোধের তারিখ' : 'Payment Date'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.payment_date}
                                onChange={(e) => setData('payment_date', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            />
                            {errors.payment_date && <p className="text-xs text-rose-600 mt-1">{errors.payment_date}</p>}
                        </div>

                        {/* Method */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পরিশোধের মাধ্যম' : 'Payment Method'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            >
                                <option value="cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                                <option value="bank_transfer">{isBn ? 'ব্যাংক ট্রান্সফার (Bank Transfer)' : 'Bank Transfer'}</option>
                                <option value="cheque">{isBn ? 'চেক (Cheque)' : 'Cheque'}</option>
                                <option value="mobile_money">{isBn ? 'মোবাইল ব্যাংকিং (Mobile Banking)' : 'Mobile Banking'}</option>
                            </select>
                            {errors.payment_method && <p className="text-xs text-rose-600 mt-1">{errors.payment_method}</p>}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পরিশোধিত অর্থ (BDT)' : 'Amount Paid (BDT)'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={data.amount}
                                onFocus={handleNumberFocus}
                                onChange={(e) => setData('amount', cleanNumber(e.target.value))}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-bold text-emerald-700 font-mono"
                                placeholder="0"
                                required
                            />
                            {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মন্তব্য / নোট' : 'Payment Notes'}
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows="3"
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 p-3"
                                placeholder={isBn ? 'পেমেন্ট সংক্রান্ত যেকোনো মন্তব্য...' : 'Optional remarks about this payment...'}
                            />
                            {errors.notes && <p className="text-xs text-rose-600 mt-1">{errors.notes}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing || !data.payroll_id}
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                            className="text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            <Banknote className="w-4 h-4" />
                            <span>{processing ? (isBn ? 'পরিশোধ হচ্ছে…' : 'Processing...') : (isBn ? 'বেতন পরিশোধ নিশ্চিত করুন' : 'Record Payment')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
