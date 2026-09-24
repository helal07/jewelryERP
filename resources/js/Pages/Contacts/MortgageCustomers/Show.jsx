import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import { Shield, Phone, MapPin, FileText, ArrowLeft, Edit } from 'lucide-react';

export default function Show({ mortgageCustomer }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const [activeTab, setActiveTab] = useState('info');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">{mortgageCustomer.name}</h2>
                            <p className="text-xs text-gray-500 font-mono">
                                {isBn ? 'কোড: ' : 'Code: '}{isBn ? toBn(mortgageCustomer.code) : mortgageCustomer.code}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('mortgage-customers.edit', mortgageCustomer.id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Edit className="w-4 h-4" />
                            <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                        </Link>
                        <Link 
                            href={route('mortgage-customers.index')}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to List'}</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${isBn ? 'বন্ধক গ্রাহক' : 'Mortgage Customer'} - ${mortgageCustomer.name}`} />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex space-x-2 border-b border-gray-200 bg-white p-2 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTab === 'info' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isBn ? 'গ্রাহক তথ্য' : 'Customer Information'}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTab === 'history' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isBn ? 'বন্ধক ইতিহাস' : 'Mortgage History'}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {activeTab === 'info' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                {isBn ? 'বন্ধক গ্রাহকের বিবরণ' : 'Customer Details'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'কোড' : 'Code'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{isBn ? toBn(mortgageCustomer.code) : mortgageCustomer.code}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'নাম' : 'Name'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{mortgageCustomer.name}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{isBn ? toBn(mortgageCustomer.phone) : mortgageCustomer.phone}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'এনআইডি নম্বর' : 'NID Number'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{mortgageCustomer.nid_number ? (isBn ? toBn(mortgageCustomer.nid_number) : mortgageCustomer.nid_number) : '—'}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 sm:col-span-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'ঠিকানা' : 'Address'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{mortgageCustomer.address || '—'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">{isBn ? 'বন্ধক ইতিহাস' : 'Mortgage History'}</h3>
                            <p className="text-xs text-gray-400 italic">{isBn ? 'কোন বন্ধকের ইতিহাস পাওয়া যায়নি।' : 'No mortgage history available yet.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
