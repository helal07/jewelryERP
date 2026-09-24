import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserCheck } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Create({ auth, branches = [] }) {
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
        branch_id: branches.length > 0 ? branches[0].id : '',
        employee_code: '',
        name: '',
        designation: '',
        department: '',
        phone: '',
        address: '',
        nid_number: '',
        joining_date: '',
        salary_type: 'fixed',
        basic_salary: '',
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrm.staff.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Staff'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'কর্মকর্তা ও কর্মচারীর পদবি ও বেতন সংক্রান্ত তথ্য প্রদান করুন' : 'Fill in employee personal and salary information'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('hrm.staff.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to Staff List'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'নতুন কর্মী' : 'Add Staff'} />

            <div className="max-w-4xl mx-auto pb-12 mt-4">
                <form onSubmit={submit} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        {/* Employee Code */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'কর্মচারী কোড' : 'Employee Code'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.employee_code}
                                onChange={(e) => setData('employee_code', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-mono font-bold"
                                placeholder="e.g. EMP-001"
                                required
                            />
                            {errors.employee_code && <p className="text-xs text-rose-600 mt-1">{errors.employee_code}</p>}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'কর্মীর নাম' : 'Name'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                placeholder={isBn ? 'কর্মীর পূর্ণ নাম' : 'Enter full name'}
                                required
                            />
                            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পদবি' : 'Designation'}
                            </label>
                            <input
                                type="text"
                                value={data.designation}
                                onChange={(e) => setData('designation', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                placeholder={isBn ? 'যেমন: বিক্রয়কর্মী, হিসাবরক্ষক, ম্যানেজার' : 'e.g. Salesman, Accountant, Manager'}
                            />
                            {errors.designation && <p className="text-xs text-rose-600 mt-1">{errors.designation}</p>}
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'বিভাগ' : 'Department'}
                            </label>
                            <input
                                type="text"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                placeholder={isBn ? 'যেমন: সেলস, প্রশাসন, উৎপাদন' : 'e.g. Sales, Admin, Production'}
                            />
                            {errors.department && <p className="text-xs text-rose-600 mt-1">{errors.department}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মোবাইল নম্বর' : 'Phone'}
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                placeholder={isBn ? 'মোবাইল নম্বর' : 'Phone number'}
                            />
                            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                        </div>

                        {/* NID */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'জাতীয় পরিচয়পত্র নং' : 'NID Number'}
                            </label>
                            <input
                                type="text"
                                value={data.nid_number}
                                onChange={(e) => setData('nid_number', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                placeholder={isBn ? 'জাতীয় পরিচয়পত্র নম্বর' : 'National ID number'}
                            />
                            {errors.nid_number && <p className="text-xs text-rose-600 mt-1">{errors.nid_number}</p>}
                        </div>

                        {/* Joining Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'যোগদানের তারিখ' : 'Joining Date'}
                            </label>
                            <input
                                type="date"
                                value={data.joining_date}
                                onChange={(e) => setData('joining_date', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            />
                            {errors.joining_date && <p className="text-xs text-rose-600 mt-1">{errors.joining_date}</p>}
                        </div>

                        {/* Salary Type */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'বেতনের ধরন' : 'Salary Type'}
                            </label>
                            <select
                                value={data.salary_type}
                                onChange={(e) => setData('salary_type', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            >
                                <option value="fixed">{isBn ? 'মাসিক নির্ধারিত (Fixed Monthly)' : 'Fixed Monthly'}</option>
                                <option value="daily">{isBn ? 'দৈনিক (Daily)' : 'Daily'}</option>
                                <option value="commission">{isBn ? 'কমিশন ভিত্তিক (Commission)' : 'Commission'}</option>
                            </select>
                            {errors.salary_type && <p className="text-xs text-rose-600 mt-1">{errors.salary_type}</p>}
                        </div>

                        {/* Basic Salary */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মূল বেতন (BDT)' : 'Basic Salary (BDT)'}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={data.basic_salary}
                                onFocus={handleNumberFocus}
                                onChange={(e) => setData('basic_salary', cleanNumber(e.target.value))}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-bold text-gray-900"
                                placeholder="0"
                            />
                            {errors.basic_salary && <p className="text-xs text-rose-600 mt-1">{errors.basic_salary}</p>}
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পূর্ণ ঠিকানা' : 'Address'}
                            </label>
                            <textarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows="2"
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 p-3"
                                placeholder={isBn ? 'কর্মীর পূর্ণ ঠিকানা' : 'Full address'}
                            />
                            {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'অবস্থা' : 'Status'}
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            >
                                <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                                <option value="inactive">{isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                            </select>
                            {errors.status && <p className="text-xs text-rose-600 mt-1">{errors.status}</p>}
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
                            <span>{processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving...') : (isBn ? 'কর্মী সংরক্ষণ করুন' : 'Save Staff')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
