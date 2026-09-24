import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import { Truck, Phone, MapPin, Mail, ArrowLeft, Edit, Building2 } from 'lucide-react';

export default function Show({ supplier }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const [activeTab, setActiveTab] = useState('info');

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
                            <h2 className="text-lg font-black text-gray-900 leading-tight">{supplier.company_name || supplier.name}</h2>
                            <p className="text-xs text-gray-500 font-mono">
                                {isBn ? 'কোড: ' : 'Code: '}{isBn ? toBn(supplier.code) : supplier.code}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('suppliers.edit', supplier.id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Edit className="w-4 h-4" />
                            <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                        </Link>
                        <Link 
                            href={route('suppliers.index')}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to List'}</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${isBn ? 'সরবরাহকারী' : 'Supplier'} - ${supplier.company_name || supplier.name}`} />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex space-x-2 border-b border-gray-200 bg-white p-2 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTab === 'info' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isBn ? 'সরবরাহকারী তথ্য' : 'Supplier Information'}
                    </button>
                    <button
                        onClick={() => setActiveTab('purchase')}
                        className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTab === 'purchase' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isBn ? 'ক্রয় ইতিহাস' : 'Purchase History'}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {activeTab === 'info' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                {isBn ? 'সরবরাহকারীর বিবরণ' : 'Supplier Details'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'কোড' : 'Code'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{isBn ? toBn(supplier.code) : supplier.code}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'প্রতিষ্ঠানের নাম' : 'Company Name'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{supplier.company_name || '—'}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'যোগাযোগকারী ব্যক্তি' : 'Contact Person'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{supplier.name}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{isBn ? toBn(supplier.phone) : supplier.phone}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'ইমেইল' : 'Email'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{supplier.email || '—'}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'ঠিকানা' : 'Address'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{supplier.address || '—'}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'প্রারম্ভিক জের' : 'Opening Balance'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{fmtMoney(supplier.opening_balance)}</p>
                                </div>
                                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{isBn ? 'বকেয়া দেনা' : 'Due Balance'}</p>
                                    <p className="font-bold text-rose-700 mt-0.5">{fmtMoney(supplier.due_balance)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchase' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">{isBn ? 'ক্রয় ইতিহাস' : 'Purchase History'}</h3>
                            <p className="text-xs text-gray-400 italic">{isBn ? 'কোন ক্রয়ের ইতিহাস পাওয়া যায়নি।' : 'No purchase history available yet.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
