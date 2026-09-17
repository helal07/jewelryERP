import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import { UserCheck, Plus, Edit2, Trash2, RotateCcw, Search, Phone, User, CheckCircle2, XCircle } from 'lucide-react';

export default function Index({ auth, staff, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [name, setName] = useState(filters.name || '');
    const [phone, setPhone] = useState(filters.phone || '');

    useFilter(route('hrm.staff.index'), {
        name,
        phone,
    });

    const handleReset = () => {
        setName('');
        setPhone('');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isBn ? 'কর্মকর্তা ও কর্মচারী তালিকা' : 'Staff Lists'} />

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">
                            {isBn ? 'কর্মকর্তা ও কর্মচারী তালিকা' : 'Staff Lists'}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {isBn ? 'কর্মচারীদের প্রোফাইল, পদবি ও বেতন সংক্রান্ত তথ্য পরিচালনা করুন' : 'Manage employee profiles, designations and branch assignments'}
                        </p>
                    </div>
                </div>
                <Link
                    href={route('hrm.staff.create')}
                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                    className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Staff'}</span>
                </Link>
            </div>

            <div className="space-y-4">
                {/* Filter Area */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                {isBn ? 'নাম দিয়ে খুঁজুন' : 'Search by Name'}
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={isBn ? 'কর্মীর নাম...' : 'Staff name...'}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={isBn ? 'মোবাইল নম্বর...' : 'Phone number...'}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500" 
                                />
                            </div>
                        </div>
                        <div>
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
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'শাখা' : 'Branch Name'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কর্মীর নাম ও কোড' : 'Name & Code'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মোবাইল' : 'Phone'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পদবি / বিভাগ' : 'Designation / Dept'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {staff.data && staff.data.length > 0 ? (
                                    staff.data.map((member, index) => (
                                        <tr key={member.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 text-gray-500 font-mono">
                                                {isBn ? toBn((staff.current_page - 1) * staff.per_page + index + 1) : (staff.current_page - 1) * staff.per_page + index + 1}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-700 font-medium whitespace-nowrap">{member.branch?.name || 'Main'}</td>
                                            <td className="px-3 py-2.5">
                                                <div className="font-bold text-gray-900">{member.name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{isBn ? toBn(member.employee_code) : member.employee_code}</div>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                                                {member.phone ? (isBn ? toBn(member.phone) : member.phone) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="font-semibold text-gray-800">{member.designation || '—'}</div>
                                                <div className="text-[10px] text-gray-400">{member.department || '—'}</div>
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                {member.status === 'active' ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> {isBn ? 'সক্রিয়' : 'Active'}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" /> {isBn ? 'নিষ্ক্রিয়' : 'Inactive'}
                                                    </span>
                                                )}
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
                                                            href={route('hrm.staff.edit', member.id)}
                                                            className="flex items-center text-xs text-gray-700"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5 mr-2 text-blue-500" /> {isBn ? 'সম্পাদনা করুন' : 'Edit'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link
                                                            href={route('hrm.staff.destroy', member.id)}
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
                                                <User className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন কর্মী পাওয়া যায়নি।' : 'No staff found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {staff.links && (
                        <div className="mt-4">
                            <Pagination links={staff.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
