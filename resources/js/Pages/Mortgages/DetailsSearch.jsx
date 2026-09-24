import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Landmark, 
    Search, 
    ArrowRight, 
    User, 
    Phone, 
    Calendar, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    ArrowLeft,
    Layers
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function DetailsSearch({ mortgages = [], searchQuery = '' }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [search, setSearch] = useState(searchQuery || '');
    const [isSearching, setIsSearching] = useState(false);

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {isBn ? 'সচল (Active)' : 'Active'}</span>;
            case 'redeemed':
                return <span className="px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {isBn ? 'খালাসকৃত (Redeemed)' : 'Redeemed'}</span>;
            case 'overdue':
                return <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {isBn ? 'মেয়াদোত্তীর্ণ (Overdue)' : 'Overdue'}</span>;
            case 'forfeited':
                return <span className="px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {isBn ? 'বাজেয়াপ্ত (Forfeited)' : 'Forfeited'}</span>;
            default:
                return <span className="px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold">{status}</span>;
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        setIsSearching(true);
        router.get(route('mortgages.details'), { search }, {
            preserveState: true,
            onFinish: () => setIsSearching(false)
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mortgages.index')}
                            className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl shadow-xs transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                                {isBn ? 'মর্টগেজ বিস্তারিত সন্ধান' : 'Search Mortgage Details'}
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? 'মর্টগেজ সন্ধান' : 'Mortgage Search'} />

            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Search Box */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
                    <div className="max-w-xl mx-auto space-y-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isBn ? 'গ্রাহকের নাম, পরিমাণ, বন্ধক নং অথবা মোবাইল দিয়ে খুঁজুন...' : 'Search by Name, Amount, Mortgage No, or Phone...'}
                                className="w-full h-14 pl-12 pr-32 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 focus:ring-amber-500 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-400"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <button 
                                type="submit" 
                                disabled={isSearching || !search.trim()}
                                className="absolute right-2 top-2 bottom-2 text-white px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {isSearching ? (isBn ? 'খোঁজা হচ্ছে...' : 'Searching...') : (isBn ? 'সন্ধান করুন' : 'Search')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Search Results */}
                {searchQuery && (
                    <div className="space-y-6">
                        {mortgages && mortgages.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600 px-2">
                                    <span>
                                        {isBn 
                                            ? `${toBn(mortgages.length)} টি রেকর্ড পাওয়া গেছে` 
                                            : `Found ${mortgages.length} matching record${mortgages.length > 1 ? 's' : ''}`}
                                    </span>
                                </div>
                                {mortgages.map((item) => (
                                    <div key={item.id} className="bg-white rounded-3xl border border-amber-200/80 shadow-sm overflow-hidden relative transition-all hover:border-amber-400 hover:shadow-md">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                                                        <Landmark className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {isBn ? `মর্টগেজ #${toBn(item.mortgage_no)}` : `Mortgage #${item.mortgage_no}`}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            {isBn ? 'তারিখ' : 'Created on'} {item.mortgage_date ? (isBn ? toBn(String(item.mortgage_date).substring(0, 10)) : String(item.mortgage_date).substring(0, 10)) : '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/70 rounded-2xl p-4 border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">{isBn ? 'গ্রাহক' : 'Customer'}</div>
                                                        <div className="text-sm font-bold text-gray-900">{item.customer?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">{item.customer?.phone ? (isBn ? toBn(item.customer.phone) : item.customer.phone) : ''}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">{isBn ? 'মূল ঋণ' : 'Principal Amount'}</div>
                                                        <div className="text-base font-extrabold text-amber-800">{fmtMoney(item.principal_amount)}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {isBn ? `${toBn(item.interest_rate)}% (${item.interest_type === 'monthly' ? 'মাসিক' : item.interest_type === 'yearly' ? 'বার্ষিক' : 'ফ্ল্যাট'})` : `${item.interest_rate}% (${item.interest_type})`}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">{isBn ? 'পরিশোধের শেষ তারিখ' : 'Due Date'}</div>
                                                        <div className="text-sm font-bold text-gray-800">
                                                            {item.due_date ? (isBn ? toBn(String(item.due_date).substring(0, 10)) : String(item.due_date).substring(0, 10)) : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex justify-end">
                                                <Link 
                                                    href={route('mortgages.show', item.id)}
                                                    className="px-5 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer"
                                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                                >
                                                    {isBn ? 'বিস্তারিত দেখুন' : 'View Details'} <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 text-center relative overflow-hidden">
                                <div className="max-w-md mx-auto space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 opacity-50" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{isBn ? 'কোনো রেকর্ড পাওয়া যায়নি' : 'No Record Found'}</h3>
                                    <p className="text-gray-600 font-medium leading-relaxed text-sm">
                                        {isBn 
                                            ? `"${searchQuery}" দিয়ে কোনো মর্টগেজ পাওয়া যায়নি। গ্রাহকের নাম, মোবাইল নম্বর অথবা বন্ধক নম্বর দিয়ে পুনরায় চেষ্টা করুন।`
                                            : `We couldn't find any mortgage matching "${searchQuery}". Try searching by customer name, principal amount, mortgage number, or phone number.`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
