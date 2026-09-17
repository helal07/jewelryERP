import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { CalendarCheck, Plus, Edit2, Trash2, RotateCcw, Search, User } from 'lucide-react';

export default function Index({ auth, attendances, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [date, setDate] = useState(filters.date || '');

    useFilter(route('hrm.attendance.index'), {
        date,
    });

    const handleReset = () => {
        setDate('');
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'present':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{isBn ? 'উপস্থিত' : 'Present'}</span>;
            case 'absent':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">{isBn ? 'অনুপস্থিত' : 'Absent'}</span>;
            case 'half_day':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{isBn ? 'হাফ ডে' : 'Half Day'}</span>;
            case 'leave':
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{isBn ? 'ছুটি' : 'Leave'}</span>;
            default:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-50 text-gray-700 border border-gray-200">{st}</span>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isBn ? 'উপস্থিতি তালিকা' : 'Attendance Lists'} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">
                            {isBn ? 'উপস্থিতি তালিকা' : 'Attendance Register'}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {isBn ? 'দৈনিক কর্মীদের আগমন ও প্রস্থানের সময় এবং উপস্থিতি পর্যবেক্ষণ করুন' : 'Daily staff check-in/out records, status and leaves'}
                        </p>
                    </div>
                </div>
                <Link
                    href={route('hrm.attendance.create')}
                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                    className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'উপস্থিতি যোগ করুন' : 'Mark Attendance'}</span>
                </Link>
            </div>

            <div className="space-y-4">
                {/* Filter Area */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-48">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                {isBn ? 'তারিখ' : 'Filter by Date'}
                            </label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-xs py-2 px-3" 
                            />
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
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কর্মীর নাম' : 'Staff Name'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'শাখা' : 'Branch'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{isBn ? 'উপস্থিতির অবস্থা' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ইন / আউট সময়' : 'Check In/Out'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {attendances.data && attendances.data.length > 0 ? (
                                    attendances.data.map((attendance, index) => (
                                        <tr key={attendance.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 text-gray-500 font-mono">
                                                {isBn ? toBn((attendances.current_page - 1) * attendances.per_page + index + 1) : (attendances.current_page - 1) * attendances.per_page + index + 1}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-800 font-medium whitespace-nowrap">
                                                {attendance.attendance_date ? (isBn ? toBn(attendance.attendance_date) : attendance.attendance_date) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 font-bold text-gray-900 whitespace-nowrap">
                                                {attendance.staff?.name || '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{attendance.branch?.name || 'Main'}</td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                {getStatusBadge(attendance.status)}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 font-mono whitespace-nowrap">
                                                {attendance.check_in ? (isBn ? toBn(attendance.check_in) : attendance.check_in) : '--:--'} - {attendance.check_out ? (isBn ? toBn(attendance.check_out) : attendance.check_out) : '--:--'}
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
                                                            href={route('hrm.attendance.edit', attendance.id)}
                                                            className="flex items-center text-xs text-gray-700"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5 mr-2 text-blue-500" /> {isBn ? 'সম্পাদনা করুন' : 'Edit'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link
                                                            href={route('hrm.attendance.destroy', attendance.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="flex items-center text-xs text-rose-600 hover:bg-rose-50 w-full"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" /> {isBn ? 'মুছে ফেলুন' : 'Delete'}
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
                                                <CalendarCheck className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন উপস্থিতির রেকর্ড পাওয়া যায়নি।' : 'No attendance records found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attendances.links && (
                        <div className="mt-4">
                            <Pagination links={attendances.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
