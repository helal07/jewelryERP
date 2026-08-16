import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import { Edit2, Trash2 } from 'lucide-react';

export default function Index({ auth, staff }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Staff Lists" />

            <div className="-m-6 p-6 bg-[#FEF9E7] min-h-screen">
                <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">Staff Lists</h2>
                    <Link
                        href={route('hrm.staff.create')}
                        className="px-4 py-1.5 bg-[#E88A1A] hover:bg-orange-600 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
                    >
                        Add New
                    </Link>
                </div>

                <div className="bg-[#FEF9E7] border border-amber-200/60 rounded-xl p-4 shadow-sm pb-24">
                    <div className="text-sm font-semibold text-gray-700 mb-3">All {staff.total}</div>
                    
                    {/* Filter Area */}
                    <div className="bg-[#FDEEDC] rounded-xl p-5 mb-5 border border-amber-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] text-gray-500 mb-1">Name</label>
                                <input type="text" className="w-full border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-9 text-sm" />
                            </div>
                            <div>
                                <label className="block text-[11px] text-gray-500 mb-1">Phone</label>
                                <input type="text" className="w-full border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-9 text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-5">
                            <button className="px-8 py-2 bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900 font-bold rounded-lg shadow-sm hover:from-amber-400 hover:to-amber-600 transition-all text-xs">
                                SEARCH
                            </button>
                            <button className="px-8 py-2 bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900 font-bold rounded-lg shadow-sm hover:from-amber-400 hover:to-amber-600 transition-all text-xs">
                                RESET
                            </button>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="overflow-x-auto custom-scrollbar rounded-t-lg shadow-sm border border-gray-200">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#E88A1A] text-white">
                                <tr>
                                    <th className="px-4 py-3.5 font-bold">SL</th>
                                    <th className="px-4 py-3.5 font-bold">Branch Name</th>
                                    <th className="px-4 py-3.5 font-bold">Name</th>
                                    <th className="px-4 py-3.5 font-bold">Phone</th>
                                    <th className="px-4 py-3.5 font-bold">Designation</th>
                                    <th className="px-4 py-3.5 font-bold">Status</th>
                                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {staff.data.map((member, index) => (
                                    <tr key={member.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-4 py-3 text-gray-600 font-medium">
                                            {(staff.current_page - 1) * staff.per_page + index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">{member.branch?.name || 'Main'}</td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">{member.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{member.phone || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600">{member.designation || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.status === 'active' ? 'bg-teal-700 text-white' : 'bg-rose-700 text-white'}`}>
                                                {member.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
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
                                                    <Dropdown.Link href={route('hrm.staff.edit', member.id)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> Edit Staff
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('hrm.staff.destroy', member.id)} method="delete" as="button" className="flex items-center w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                                                        <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Staff
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {staff.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500 font-medium">
                                            No staff members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Standard Reusable Pagination Component */}
                    <Pagination links={staff.links} from={staff.from} to={staff.to} total={staff.total} />

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
