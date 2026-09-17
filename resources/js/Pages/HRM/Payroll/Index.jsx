import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { Wallet, Plus, Edit2, Trash2, RotateCcw, CreditCard } from 'lucide-react';

export default function Index({ auth, payrolls, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [month, setMonth] = useState(filters.month || params.get('month') || '');
    const [year, setYear] = useState(filters.year || params.get('year') || '');

    useFilter(route('hrm.payroll.index'), {
        month,
        year,
    });

    const handleReset = () => {
        setMonth('');
        setYear('');
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

    const getMonthName = (val) => {
        const found = months.find(m => Number(m.value) === Number(val));
        if (!found) return val;
        return isBn ? found.labelBn : found.labelEn;
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'paid':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{isBn ? 'পরিশোধিত' : 'Paid'}</span>;
            case 'approved':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{isBn ? 'অনুমোদিত' : 'Approved'}</span>;
            case 'draft':
            default:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{isBn ? 'খসড়া' : 'Draft'}</span>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isBn ? 'বেতন বিল ও পে-রোল' : 'Payroll Lists'} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">
                            {isBn ? 'কর্মীদের বেতন তালিকা (পে-রোল)' : 'Payroll Lists'}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {isBn ? 'মাসিক পে-রোল প্রস্তুতকরণ ও বেতন নিষ্পত্তির বিবরণ' : 'Manage monthly staff payroll sheets and salary disbursements'}
                        </p>
                    </div>
                </div>
                <Link
                    href={route('hrm.payroll.create')}
                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                    className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'নতুন পে-রোল তৈরি করুন' : 'Generate Payroll'}</span>
                </Link>
            </div>

            <div className="space-y-4">
                {/* Filter Area */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-48">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মাস' : 'Month'}
                            </label>
                            <select 
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-xs py-2 px-3" 
                            >
                                <option value="">{isBn ? 'সকল মাস' : 'All Months'}</option>
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{isBn ? m.labelBn : m.labelEn}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-40">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                {isBn ? 'বছর' : 'Year'}
                            </label>
                            <select 
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-xs py-2 px-3" 
                            >
                                <option value="">{isBn ? 'সকল বছর' : 'All Years'}</option>
                                <option value="2025">{isBn ? '২০২৫' : '2025'}</option>
                                <option value="2026">{isBn ? '২০২৬' : '2026'}</option>
                                <option value="2027">{isBn ? '২০২৭' : '2027'}</option>
                                <option value="2028">{isBn ? '২০২৮' : '2028'}</option>
                            </select>
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
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মাস ও বছর' : 'Period'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কর্মীর নাম' : 'Staff Name'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'শাখা' : 'Branch'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'মূল বেতন' : 'Basic'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'ভাতা' : 'Allow.'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'কর্তন' : 'Deduct.'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'প্রদেয় নিট বেতন' : 'Net Salary'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {payrolls.data && payrolls.data.length > 0 ? (
                                    payrolls.data.map((payroll, index) => (
                                        <tr key={payroll.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 text-gray-500 font-mono">
                                                {isBn ? toBn((payrolls.current_page - 1) * payrolls.per_page + index + 1) : (payrolls.current_page - 1) * payrolls.per_page + index + 1}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">
                                                {getMonthName(payroll.month)} {isBn ? toBn(payroll.year) : payroll.year}
                                            </td>
                                            <td className="px-3 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                                {payroll.staff?.name || '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{payroll.branch?.name || 'Main'}</td>
                                            <td className="px-3 py-2.5 text-right font-mono text-gray-700">
                                                {fmtMoney(payroll.basic_salary)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono text-emerald-600">
                                                +{fmtMoney(payroll.allowances)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono text-rose-600">
                                                -{fmtMoney(payroll.deductions)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold font-mono text-gray-900">
                                                {fmtMoney(payroll.net_salary)}
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                {getStatusBadge(payroll.status)}
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
                                                            href={route('hrm.salary.create', { payroll_id: payroll.id })}
                                                            className="flex items-center text-xs text-emerald-700 hover:bg-emerald-50"
                                                        >
                                                            <CreditCard className="w-3.5 h-3.5 mr-2 text-emerald-600" /> {isBn ? 'বেতন পরিশোধ' : 'Pay Salary'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link
                                                            href={route('hrm.payroll.edit', payroll.id)}
                                                            className="flex items-center text-xs text-gray-700"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5 mr-2 text-blue-500" /> {isBn ? 'সম্পাদনা করুন' : 'Edit Payroll'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link
                                                            href={route('hrm.payroll.destroy', payroll.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="flex items-center text-xs text-rose-600 hover:bg-rose-50 w-full"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" /> {isBn ? 'মুছে ফেলুন' : 'Delete Payroll'}
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-12 text-center text-gray-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <Wallet className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন পে-রোল রেকর্ড পাওয়া যায়নি।' : 'No payroll records found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payrolls.links && (
                        <div className="mt-4">
                            <Pagination links={payrolls.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
