import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Calculator, Wallet } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Create({ auth, staffs = [], branches = [] }) {
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
        staff_id: '',
        branch_id: branches.length > 0 ? branches[0].id : '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basic_salary: '0',
        allowances: '0',
        deductions: '0',
        status: 'draft',
    });

    const [netSalary, setNetSalary] = useState(0);

    useEffect(() => {
        const basic = parseFloat(data.basic_salary) || 0;
        const allow = parseFloat(data.allowances) || 0;
        const deduct = parseFloat(data.deductions) || 0;
        setNetSalary(basic + allow - deduct);
    }, [data.basic_salary, data.allowances, data.deductions]);

    const handleStaffChange = (e) => {
        const staffId = e.target.value;
        const staff = staffs.find(s => String(s.id) === String(staffId));
        setData(prev => ({
            ...prev,
            staff_id: staffId,
            branch_id: staff ? (staff.branch_id || prev.branch_id) : prev.branch_id,
            basic_salary: staff && staff.basic_salary ? String(staff.basic_salary) : '0'
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('hrm.payroll.store'));
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
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'নতুন পে-রোল তৈরি করুন' : 'Generate Payroll'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'মাসিক বেতন বিবরণী, ভাতা ও কর্তন হিসাব করে পে-রোল তৈরি করুন' : 'Calculate employee monthly salary, allowances and deductions'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('hrm.payroll.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to Payrolls'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'পে-রোল তৈরি' : 'Generate Payroll'} />

            <div className="max-w-3xl mx-auto pb-12 mt-4">
                <form onSubmit={submit} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Staff */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'কর্মী' : 'Staff Member'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.staff_id}
                                onChange={handleStaffChange}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            >
                                <option value="">{isBn ? 'কর্মী নির্বাচন করুন' : 'Select Staff Member'}</option>
                                {staffs.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name} {staff.employee_code ? `(${staff.employee_code})` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.staff_id && <p className="text-xs text-rose-600 mt-1">{errors.staff_id}</p>}
                        </div>

                        {/* Branch */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'শাখা' : 'Branch'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            >
                                <option value="">{isBn ? 'শাখা নির্বাচন করুন' : 'Select Branch'}</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                            {errors.branch_id && <p className="text-xs text-rose-600 mt-1">{errors.branch_id}</p>}
                        </div>

                        {/* Month */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মাস' : 'Month'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.month}
                                onChange={(e) => setData('month', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{isBn ? m.labelBn : m.labelEn}</option>
                                ))}
                            </select>
                            {errors.month && <p className="text-xs text-rose-600 mt-1">{errors.month}</p>}
                        </div>

                        {/* Year */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'বছর' : 'Year'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            />
                            {errors.year && <p className="text-xs text-rose-600 mt-1">{errors.year}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'অবস্থা' : 'Status'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            >
                                <option value="draft">{isBn ? 'খসড়া (Draft)' : 'Draft'}</option>
                                <option value="approved">{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                                <option value="paid">{isBn ? 'পরিশোধিত (Paid)' : 'Paid'}</option>
                            </select>
                            {errors.status && <p className="text-xs text-rose-600 mt-1">{errors.status}</p>}
                        </div>

                        <div className="md:col-span-2 border-t border-gray-100 my-2 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center mb-4">
                                <Calculator className="w-4 h-4 mr-2" style={{ color: 'rgb(177,118,51)' }} />
                                {isBn ? 'বেতন ও ভাতার হিসাব' : 'Salary Breakdown'}
                            </h4>
                        </div>

                        {/* Basic Salary */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মূল বেতন (BDT)' : 'Basic Salary (BDT)'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={data.basic_salary}
                                onFocus={handleNumberFocus}
                                onChange={(e) => setData('basic_salary', cleanNumber(e.target.value))}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-bold text-gray-900"
                                placeholder="0"
                                required
                            />
                            {errors.basic_salary && <p className="text-xs text-rose-600 mt-1">{errors.basic_salary}</p>}
                        </div>

                        {/* Allowances */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'ভাতা ও অতিরিক্ত (BDT)' : 'Allowances (BDT)'}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={data.allowances}
                                onFocus={handleNumberFocus}
                                onChange={(e) => setData('allowances', cleanNumber(e.target.value))}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-bold text-emerald-600"
                                placeholder="0"
                            />
                            {errors.allowances && <p className="text-xs text-rose-600 mt-1">{errors.allowances}</p>}
                        </div>

                        {/* Deductions */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'কর্তন / জরিমানা (BDT)' : 'Deductions (BDT)'}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={data.deductions}
                                onFocus={handleNumberFocus}
                                onChange={(e) => setData('deductions', cleanNumber(e.target.value))}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-bold text-rose-600"
                                placeholder="0"
                            />
                            {errors.deductions && <p className="text-xs text-rose-600 mt-1">{errors.deductions}</p>}
                        </div>

                        {/* Net Salary Preview */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'প্রদেয় নিট বেতন' : 'Net Salary (Calculated)'}
                            </label>
                            <div className="w-full py-2 px-3 rounded-xl border border-amber-200 bg-amber-50 font-bold text-base text-gray-900 font-mono">
                                {fmtMoney(netSalary)}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                            className="text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? (isBn ? 'প্রস্তুত হচ্ছে…' : 'Generating...') : (isBn ? 'পে-রোল সংরক্ষণ করুন' : 'Generate Payroll')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
