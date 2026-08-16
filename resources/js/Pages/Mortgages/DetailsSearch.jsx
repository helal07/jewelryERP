import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Landmark, Search, ArrowRight, User, Phone, Calendar, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (status) => {
    switch (status) {
        case 'active':
            return <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><CheckCircle2 className="w-4 h-4" /> Active</span>;
        case 'redeemed':
            return <span className="px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><Clock className="w-4 h-4" /> Redeemed</span>;
        case 'overdue':
            return <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><AlertCircle className="w-4 h-4" /> Overdue</span>;
        case 'forfeited':
            return <span className="px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><AlertCircle className="w-4 h-4" /> Forfeited</span>;
        default:
            return <span className="px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-sm font-bold w-max">{status}</span>;
    }
};

export default function DetailsSearch({ mortgages = [], searchQuery = '' }) {
    const [search, setSearch] = useState(searchQuery || '');
    const [isSearching, setIsSearching] = useState(false);

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                                Mortgage Details
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Mortgage Details" />

            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Search Box */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
                    <div className="max-w-xl mx-auto space-y-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by Name, Amount, Mortgage No, or Phone..."
                                className="w-full h-14 pl-12 pr-32 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 focus:ring-amber-500 text-base font-medium text-gray-800 transition-all placeholder:text-gray-400"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <button 
                                type="submit" 
                                disabled={isSearching || !search.trim()}
                                className="absolute right-2 top-2 bottom-2 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Search Results */}
                {searchQuery && (
                    <div className="space-y-6 animate-fade-in">
                        {mortgages && mortgages.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600 px-2">
                                    <span>Found {mortgages.length} matching record{mortgages.length > 1 ? 's' : ''}</span>
                                </div>
                                {mortgages.map((item) => (
                                    <div key={item.id} className="bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden relative transition-all hover:border-emerald-400 hover:shadow-md">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#E88A1A] flex items-center justify-center font-bold">
                                                        <Landmark className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">Mortgage #{item.mortgage_no}</h3>
                                                        <p className="text-xs text-gray-500 font-medium">Created on {item.mortgage_date}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    {statusBadge(item.status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/70 rounded-2xl p-4 border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Customer</div>
                                                        <div className="text-sm font-bold text-gray-900">{item.customer?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">{item.customer?.phone || ''}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Principal Amount</div>
                                                        <div className="text-base font-extrabold text-[#E88A1A]">৳ {fmtBDT(item.principal_amount)}</div>
                                                        <div className="text-xs text-gray-500">{item.interest_rate}% ({item.interest_type})</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Due Date</div>
                                                        <div className="text-sm font-bold text-gray-800">{item.due_date ? String(item.due_date).split('T')[0].split(' ')[0] : 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex justify-end">
                                                <Link 
                                                    href={route('mortgages.show', item.id)}
                                                    className="px-5 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer"
                                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                                >
                                                    View Details <ArrowRight className="w-4 h-4" />
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
                                    <h3 className="text-xl font-bold text-gray-900">No Record Found</h3>
                                    <p className="text-gray-600 font-medium leading-relaxed">
                                        We couldn't find any mortgage matching "{searchQuery}". Try searching by customer name, principal amount, mortgage number, or phone number.
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
