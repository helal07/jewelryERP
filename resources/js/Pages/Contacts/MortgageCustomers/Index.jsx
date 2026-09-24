import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import { Search, Plus, User, Phone, FileText, Paperclip, MapPin, Eye, Edit, Trash2, Shield } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';

export default function Index({ mortgageCustomers, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const [search, setSearch] = useState(filters.search || '');

    useFilter(route('mortgage-customers.index'), { search });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'বন্ধক গ্রাহক তালিকা' : 'Mortgage Customers'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'স্বর্ণ বন্ধক রাখা গ্রাহকদের তথ্য পরিচালনা করুন' : 'Manage gold mortgage customers & files'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('mortgage-customers.create')}
                        className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন বন্ধক গ্রাহক' : 'Add Customer'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'বন্ধক গ্রাহক তালিকা' : 'Mortgage Customers'} />

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
                            placeholder={isBn ? 'নাম, ফোন বা কোড দিয়ে খুঁজুন...' : 'Search mortgage customers by name, phone or code...'}
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
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'গ্রাহক' : 'Customer'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'যোগাযোগ ও এনআইডি' : 'Contact & NID'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ঠিকানা' : 'Address'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{isBn ? 'ডকুমেন্ট' : 'Docs'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অবস্থা' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {mortgageCustomers.data && mortgageCustomers.data.length > 0 ? (
                                    mortgageCustomers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-amber-50/20 transition-colors">
                                            {/* Customer Column */}
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-9 w-9">
                                                        {customer.photo ? (
                                                            <img className="h-9 w-9 rounded-full object-cover border border-gray-200" src={`/storage/${customer.photo}`} alt={customer.name} />
                                                        ) : (
                                                            <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 text-amber-700">
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-bold text-gray-900">{customer.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">{isBn ? toBn(customer.code) : customer.code}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact & NID */}
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="flex items-center text-gray-900 font-medium mb-0.5">
                                                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                    {isBn ? toBn(customer.phone) : customer.phone}
                                                </div>
                                                {customer.nid_number && (
                                                    <div className="flex items-center text-[10px] text-gray-400">
                                                        <FileText className="w-3 h-3 mr-1 text-gray-400" />
                                                        NID: {isBn ? toBn(customer.nid_number) : customer.nid_number}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Address */}
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-start text-gray-600 max-w-xs truncate" title={customer.address}>
                                                    <MapPin className="w-3 h-3 mr-1 text-gray-400 mt-0.5 shrink-0" />
                                                    <span className="truncate">{customer.address || '—'}</span>
                                                </div>
                                            </td>

                                            {/* Docs */}
                                            <td className="px-3 py-2.5 whitespace-nowrap text-center">
                                                {customer.attachment ? (
                                                    <a href={`/storage/${customer.attachment}`} target="_blank" rel="noreferrer" className="inline-flex p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="View Attachment">
                                                        <Paperclip className="w-3.5 h-3.5" />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase rounded-md ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                    {customer.status === 'active' ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
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
                                                        <Dropdown.Link href={route('mortgage-customers.show', customer.id)} className="flex items-center text-xs text-gray-700">
                                                            <Eye className="w-3.5 h-3.5 mr-2 text-indigo-500" /> {isBn ? 'বিস্তারিত দেখুন' : 'View'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link href={route('mortgage-customers.edit', customer.id)} className="flex items-center text-xs text-gray-700">
                                                            <Edit className="w-3.5 h-3.5 mr-2 text-blue-500" /> {isBn ? 'সম্পাদনা করুন' : 'Edit'}
                                                        </Dropdown.Link>
                                                        <Dropdown.Link 
                                                            href={route('mortgage-customers.destroy', customer.id)} 
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
                                                <User className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন বন্ধক গ্রাহক পাওয়া যায়নি।' : 'No mortgage customers found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {mortgageCustomers.links && (
                        <div className="mt-4">
                            <Pagination links={mortgageCustomers.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
