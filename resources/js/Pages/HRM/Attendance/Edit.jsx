import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, CalendarCheck } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Edit({ auth, attendance, staffs = [], branches = [] }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const { data, setData, put, processing, errors } = useForm({
        staff_id: attendance.staff_id || '',
        branch_id: attendance.branch_id || '',
        attendance_date: attendance.attendance_date ? new Date(attendance.attendance_date).toISOString().split('T')[0] : '',
        check_in: attendance.check_in || '',
        check_out: attendance.check_out || '',
        status: attendance.status || 'present',
        remarks: attendance.remarks || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('hrm.attendance.update', attendance.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'উপস্থিতি সম্পাদনা করুন' : 'Edit Attendance'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'কর্মীর উপস্থিতি ও সময় রেকর্ড সংশোধন করুন' : 'Update employee attendance record and check-in/out times'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('hrm.attendance.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to Attendance'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'উপস্থিতি সম্পাদনা' : 'Edit Attendance'} />

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
                                onChange={(e) => {
                                    const staffId = e.target.value;
                                    const staff = staffs.find(s => String(s.id) === String(staffId));
                                    setData(prev => ({
                                        ...prev,
                                        staff_id: staffId,
                                        branch_id: staff ? (staff.branch_id || prev.branch_id) : prev.branch_id
                                    }));
                                }}
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

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'তারিখ' : 'Date'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.attendance_date}
                                onChange={(e) => setData('attendance_date', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            />
                            {errors.attendance_date && <p className="text-xs text-rose-600 mt-1">{errors.attendance_date}</p>}
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'উপস্থিতির অবস্থা' : 'Attendance Status'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            >
                                <option value="present">{isBn ? 'উপস্থিত (Present)' : 'Present'}</option>
                                <option value="absent">{isBn ? 'অনুপস্থিত (Absent)' : 'Absent'}</option>
                                <option value="half_day">{isBn ? 'হাফ ডে (Half Day)' : 'Half Day'}</option>
                                <option value="leave">{isBn ? 'অনুমোদিত ছুটি (Leave)' : 'Leave'}</option>
                                <option value="holiday">{isBn ? 'সরকারি/সাপ্তাহিক ছুটি (Holiday)' : 'Holiday'}</option>
                            </select>
                            {errors.status && <p className="text-xs text-rose-600 mt-1">{errors.status}</p>}
                        </div>

                        {/* Check In */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'প্রবেশের সময় (Check In)' : 'Check In Time'}
                            </label>
                            <input
                                type="time"
                                value={data.check_in}
                                onChange={(e) => setData('check_in', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            />
                            {errors.check_in && <p className="text-xs text-rose-600 mt-1">{errors.check_in}</p>}
                        </div>

                        {/* Check Out */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'প্রস্থানের সময় (Check Out)' : 'Check Out Time'}
                            </label>
                            <input
                                type="time"
                                value={data.check_out}
                                onChange={(e) => setData('check_out', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            />
                            {errors.check_out && <p className="text-xs text-rose-600 mt-1">{errors.check_out}</p>}
                        </div>

                        {/* Remarks */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মন্তব্য' : 'Remarks'}
                            </label>
                            <input
                                type="text"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                placeholder={isBn ? 'প্রয়োজনে অতিরিক্ত মন্তব্য লিখুন' : 'Optional notes or remarks'}
                            />
                            {errors.remarks && <p className="text-xs text-rose-600 mt-1">{errors.remarks}</p>}
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
                            <span>{processing ? (isBn ? 'আপডেট হচ্ছে…' : 'Updating...') : (isBn ? 'হালনাগাদ সংরক্ষণ করুন' : 'Update Attendance')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
