import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { Truck, Search, Plus, Eye, Edit, Trash2, Phone, Mail, Building2 } from 'lucide-react';

export default function Index({ suppliers, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const [search, setSearch] = useState(filters.search || '');

    useFilter(route('suppliers.index'), { search });

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'সরবরাহকারী তালিকা' : 'Suppliers'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'সাপ্লায়ার ও সরবরাহকারী প্রতিষ্ঠানের তথ্য ও লেনদেন পরিচালনা করুন' : 'Manage supplier vendors, orders & payable balances'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('suppliers.create')}
                        className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন সরবরাহকারী' : 'Add Supplier'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'সরবরাহকারী তালিকা' : 'Suppliers'} />

            <div className="space-y-4">
                {/* Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={isBn ? 'কোম্পানির নাম, মোবাইল বা কোড দিয়ে খুঁজুন...' : 'Search suppliers by company, phone or code...'}
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'সরবরাহকারী' : 'Supplier'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'যোগাযোগকারী ব্যক্তি' : 'Contact Person'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ঠিকানা ও এনআইডি' : 'Address & NID'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'বকেয়া দেনা' : 'Due Balance'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অবস্থা' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {suppliers.data && suppliers.data.length > 0 ? (
                                    suppliers.data.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-amber-50/20 transition-colors">
                                            {/* Supplier Column */}
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-9 w-9">
                                                        {supplier.photo ? (
                                                            <img className="h-9 w-9 rounded-full object-cover border border-gray-200" src={`/storage/${supplier.photo}`} alt="" />
                                                        ) : (
                                                            <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 text-amber-700 font-bold text-xs">
                                                                {(supplier.company_name || supplier.name).substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-bold text-gray-900">{supplier.company_name || supplier.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">{isBn ? toBn(supplier.code) : supplier.code}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Person */}
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{supplier.name}</div>
                                                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {isBn ? toBn(supplier.phone) : supplier.phone}
                                                </div>
                                                {supplier.email && (
                                                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        {supplier.email}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Address & NID */}
                                            <td className="px-3 py-2.5">
                                                <div className="text-gray-700 max-w-[220px] truncate" title={supplier.address}>
                                                    {supplier.address || '—'}
                                                </div>
                                                {supplier.nid_number && (
                                                    <div className="text-[10px] text-gray-400">NID: {isBn ? toBn(supplier.nid_number) : supplier.nid_number}</div>
                                                )}
                                            </td>

                                            {/* Due Balance */}
                                            <td className="px-3 py-2.5 whitespace-nowrap text-right">
                                                <div className={`font-bold ${Number(supplier.due_balance || 0) > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                                    {fmtMoney(supplier.due_balance)}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase rounded-md ${
                                                    supplier.status === 'active' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}>
                                                    {supplier.status === 'active' ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-2.5 whitespace-nowrap text-right">
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
                                                        <Dropdown.Link href={route('suppliers.show', supplier.id)} className="flex items-center text-xs text-gray-700">
                                                            <Eye className="w-3.5 h-3.5 mr-2 text-indigo-500" /> {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link href={route('suppliers.edit', supplier.id)} className="flex items-center text-xs text-gray-700">
                                                            <Edit className="w-3.5 h-3.5 mr-2 text-blue-500" /> {isBn ? 'সম্পাদনা করুন' : 'Edit Supplier'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link 
                                                            href={route('suppliers.destroy', supplier.id)} 
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
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Truck className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন সরবরাহকারী পাওয়া যায়নি।' : 'No suppliers found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {suppliers.links && (
                        <div className="mt-4">
                            <Pagination links={suppliers.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
