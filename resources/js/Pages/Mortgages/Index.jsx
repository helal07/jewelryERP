import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { 
    Landmark, 
    Plus, 
    Search, 
    Eye, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    Phone, 
    Building2,
    SearchCode
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ mortgages, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    useFilter(route('mortgages.index'), {
        search,
        status,
    });

    const handleReset = () => {
        setSearch('');
        setStatus('');
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {isBn ? 'সচল' : 'Active'}</span>;
            case 'redeemed':
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-bold inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {isBn ? 'খালাসকৃত' : 'Redeemed'}</span>;
            case 'overdue':
                return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-bold inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {isBn ? 'মেয়াদোত্তীর্ণ' : 'Overdue'}</span>;
            case 'forfeited':
                return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-xs font-bold inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {isBn ? 'বাজেয়াপ্ত' : 'Forfeited'}</span>;
            default:
                return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'বন্ধকী জুয়েলারি / মর্টগেজ তালিকা' : 'Mortgages'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mortgages.details')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold shadow-2xs transition"
                        >
                            <SearchCode className="w-4 h-4 mr-2" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'মর্টগেজ সন্ধান' : 'Search Details'}
                        </Link>
                        <Link
                            href={route('mortgages.create')}
                            className="text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer flex items-center gap-2"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4" />
                            {isBn ? 'নতুন বন্ধক যোগ করুন' : 'Add Mortgage'}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? 'মর্টগেজ তালিকা' : 'Mortgages'} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-sm">{flash.success}</span>
                    </div>
                )}

                {/* Filter Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={isBn ? 'মর্টগেজ নং, গ্রাহকের নাম বা মোবাইল দিয়ে খুঁজুন...' : 'Search Mortgage No, Customer...'}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-[#E88A1A] focus:border-[#E88A1A] transition-all"
                                />
                            </div>

                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full sm:w-48 px-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-[#E88A1A] focus:border-[#E88A1A] transition-all text-gray-700"
                            >
                                <option value="">{isBn ? 'সব স্ট্যাটাস' : 'All Status'}</option>
                                <option value="active">{isBn ? 'সচল (Active)' : 'Active'}</option>
                                <option value="redeemed">{isBn ? 'খালাসকৃত (Redeemed)' : 'Redeemed'}</option>
                                <option value="overdue">{isBn ? 'মেয়াদোত্তীর্ণ (Overdue)' : 'Overdue'}</option>
                                <option value="forfeited">{isBn ? 'বাজেয়াপ্ত (Forfeited)' : 'Forfeited'}</option>
                            </select>

                            {(search || status) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                    {isBn ? 'ক্লিয়ার' : 'Clear'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মর্টগেজ নং' : 'Mortgage No'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'গ্রাহক' : 'Customer'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মোবাইল' : 'Mobile'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'শাখা' : 'Branch'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মূল ঋণ (৳)' : 'Principal (BDT)'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'সুদের হার' : 'Interest Rate'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {mortgages.data && mortgages.data.length > 0 ? (
                                    mortgages.data.map((mortgage) => (
                                        <tr key={mortgage.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Mortgage No */}
                                            <td className="px-3 py-3 font-bold text-amber-800 whitespace-nowrap">
                                                <Link href={route('mortgages.show', mortgage.id)} className="hover:underline">
                                                    {isBn ? toBn(mortgage.mortgage_no) : mortgage.mortgage_no}
                                                </Link>
                                            </td>

                                            {/* Date */}
                                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                                                {mortgage.mortgage_date ? (isBn ? toBn(String(mortgage.mortgage_date).substring(0, 10)) : String(mortgage.mortgage_date).substring(0, 10)) : '—'}
                                            </td>

                                            {/* Customer */}
                                            <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap">
                                                {mortgage.customer?.name || (isBn ? 'অজ্ঞাত' : 'Unknown')}
                                            </td>

                                            {/* Phone */}
                                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                                                {mortgage.customer?.phone ? (isBn ? toBn(mortgage.customer.phone) : mortgage.customer.phone) : '—'}
                                            </td>

                                            {/* Branch */}
                                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                                                {mortgage.branch?.name || '—'}
                                            </td>

                                            {/* Principal Amount */}
                                            <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap">
                                                {fmtMoney(mortgage.principal_amount)}
                                            </td>

                                            {/* Interest Rate */}
                                            <td className="px-3 py-3 font-medium text-gray-700 whitespace-nowrap">
                                                {isBn ? `${toBn(mortgage.interest_rate)}% (${mortgage.interest_type === 'monthly' ? 'মাসিক' : mortgage.interest_type === 'yearly' ? 'বার্ষিক' : 'ফ্ল্যাট'})` : `${mortgage.interest_rate}% (${mortgage.interest_type})`}
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                {getStatusBadge(mortgage.status)}
                                            </td>

                                            {/* Action Dropdown */}
                                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {t('actions') || 'Actions'}
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48">
                                                        <Dropdown.Link
                                                            href={route('mortgages.show', mortgage.id)}
                                                            className="flex items-center gap-2 text-xs text-gray-700"
                                                        >
                                                            <Eye className="w-4 h-4 text-[#00b4d8]" /> {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Landmark className="w-12 h-12 text-gray-200 mb-3" />
                                                <p className="text-sm">{isBn ? 'কোনো মর্টগেজ পাওয়া যায়নি।' : 'No mortgages found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {mortgages.links && mortgages.links.length > 3 && (
                        <div className="mt-4">
                            <Pagination links={mortgages.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
