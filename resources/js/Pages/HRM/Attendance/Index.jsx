import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';

export default function Index({ auth, attendances }) {
    const [date, setDate] = useState(new URLSearchParams(window.location.search).get('date') || '');

    useFilter(route('hrm.attendance.index'), {
        date,
    });

    const handleReset = () => {
        setDate('');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Attendance" />

            <div className="-m-6 p-6 bg-[#FEF9E7] min-h-screen">
                <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">Attendance Lists</h2>
                    <Link
                        href={route('hrm.attendance.create')}
                        className="px-4 py-1.5 bg-[#E88A1A] hover:bg-orange-600 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
                    >
                        Add New
                    </Link>
                </div>

                <div className="bg-[#FEF9E7] border border-amber-200/60 rounded-xl p-4 shadow-sm pb-24">
                    <div className="text-sm font-semibold text-gray-700 mb-3">All {attendances.total}</div>
                    
                    {/* Filter Area */}
                    <div className="bg-[#FDEEDC] rounded-xl p-5 mb-5 border border-amber-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] text-gray-500 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-9 text-sm" 
                                    />
                                </div>
                                <div className="flex items-end mb-0.5">
                                    <button 
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-200 transition-all text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="overflow-x-auto custom-scrollbar rounded-t-lg shadow-sm border border-gray-200">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#E88A1A] text-white">
                                <tr>
                                    <th className="px-4 py-3.5 font-bold">SL</th>
                                    <th className="px-4 py-3.5 font-bold">Date</th>
                                    <th className="px-4 py-3.5 font-bold">Staff Name</th>
                                    <th className="px-4 py-3.5 font-bold">Branch Name</th>
                                    <th className="px-4 py-3.5 font-bold">Status</th>
                                    <th className="px-4 py-3.5 font-bold">Check In/Out</th>
                                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {attendances.data.map((attendance, index) => (
                                    <tr key={attendance.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-4 py-3 text-gray-600 font-medium">
                                            {(attendances.current_page - 1) * attendances.per_page + index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">
                                            {new Date(attendance.attendance_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">{attendance.staff?.name}</td>
                                        <td className="px-4 py-3 text-gray-800">{attendance.branch?.name || 'Main'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white
                                                ${attendance.status === 'present' ? 'bg-teal-700' : 
                                                attendance.status === 'absent' ? 'bg-rose-700' : 
                                                attendance.status === 'half_day' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                                                {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1).replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {attendance.check_in || '--:--'} - {attendance.check_out || '--:--'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150"
                                                    >
                                                        Actions
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('hrm.attendance.edit', attendance.id)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> Edit Attendance
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('hrm.attendance.destroy', attendance.id)} method="delete" as="button" className="flex items-center w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                                                        <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Attendance
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {attendances.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500 font-medium">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Standard Reusable Pagination Component */}
                    <Pagination links={attendances.links} from={attendances.from} to={attendances.to} total={attendances.total} />

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
