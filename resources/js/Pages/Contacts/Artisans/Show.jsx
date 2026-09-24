import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import { User, Phone, MapPin, Wrench, FileText, ArrowLeft, Edit, Paperclip, DollarSign } from 'lucide-react';

export default function Show({ artisan }) {
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
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">{artisan.name}</h2>
                            <p className="text-xs text-gray-500 font-mono">
                                {isBn ? 'কোড: ' : 'Code: '}{isBn ? toBn(artisan.code) : artisan.code}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('artisans.edit', artisan.id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Edit className="w-4 h-4" />
                            <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                        </Link>
                        <Link 
                            href={route('artisans.index')}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to List'}</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${isBn ? 'কারিগর' : 'Artisan'} - ${artisan.name}`} />

            <div className="space-y-4 max-w-7xl mx-auto">
                <div className="flex space-x-2 border-b border-gray-200 bg-white p-2 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTab === 'info' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isBn ? 'কারিগর তথ্য' : 'Artisan Information'}
                    </button>
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTab === 'assigned' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isBn ? 'বরাদ্দকৃত কাজ' : 'Assigned Work'}
                    </button>
                    <button
                        onClick={() => setActiveTab('payment')}
                        className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer ${activeTab === 'payment' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {isBn ? 'পেমেন্ট হিস্ট্রি' : 'Payment History'}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {activeTab === 'info' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                {isBn ? 'কারিগর বিস্তারিত তথ্য' : 'Artisan Details'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'কোড' : 'Code'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{isBn ? toBn(artisan.code) : artisan.code}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'নাম' : 'Name'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{artisan.name}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'বিশেষত্ব' : 'Specialization'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{artisan.specialization || '—'}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{isBn ? toBn(artisan.phone) : artisan.phone}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'ঠিকানা' : 'Address'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{artisan.address || '—'}</p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'মজুরি ধরন ও রেট' : 'Wage Type & Rate'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">
                                        {artisan.wage_type ? `${artisan.wage_type.replace('_', ' ')} @ ${fmtMoney(artisan.rate)}` : '—'}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'প্রারম্ভিক জের' : 'Opening Balance'}</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{fmtMoney(artisan.opening_balance)}</p>
                                </div>
                                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{isBn ? 'বকেয়া ব্যালেন্স' : 'Due Balance'}</p>
                                    <p className="font-bold text-rose-700 mt-0.5">{fmtMoney(artisan.due_balance)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'assigned' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">{isBn ? 'বরাদ্দকৃত কাজ' : 'Assigned Work'}</h3>
                            <p className="text-xs text-gray-400 italic">{isBn ? 'কোন বরাদ্দের ইতিহাস পাওয়া যায়নি।' : 'No assigned work history available yet.'}</p>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">{isBn ? 'পেমেন্ট হিস্ট্রি' : 'Payment History'}</h3>
                            <p className="text-xs text-gray-400 italic">{isBn ? 'কোন পেমেন্টের ইতিহাস পাওয়া যায়নি।' : 'No payment history available yet.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
