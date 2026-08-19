import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { Landmark, Plus, Search, Filter, Eye, AlertCircle, CheckCircle2, Clock, MapPin, Phone, Building2 } from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (status) => {
    switch (status) {
        case 'active':
            return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3" /> Active</span>;
        case 'redeemed':
            return <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Redeemed</span>;
        case 'overdue':
            return <span className="px-2 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 w-max"><AlertCircle className="w-3 h-3" /> Overdue</span>;
        case 'forfeited':
            return <span className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-xs font-bold flex items-center gap-1 w-max"><AlertCircle className="w-3 h-3" /> Forfeited</span>;
        default:
            return <span className="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold w-max">{status}</span>;
    }
};

export default function Index({ mortgages, filters = {} }) {
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2" />
                    
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                            Mortgages
                        </h2>
                    </div>

                    <Link
                        href={route('mortgages.create')}
                        className="text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer flex items-center gap-2"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Mortgage
                    </Link>
                </div>
            }
        >
            <Head title="Mortgages" />

            <div className="space-y-6">

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-sm">{flash.success}</span>
                    </div>
                )}

                {/* Filter Section */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Search Mortgage No, Customer</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-[#E88A1A] focus:border-[#E88A1A] transition-all"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-[#E88A1A] focus:border-[#E88A1A] transition-all"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="redeemed">Redeemed</option>
                                <option value="overdue">Overdue</option>
                                <option value="forfeited">Forfeited</option>
                            </select>
                        </div>

                        {(search || status) && (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-5 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 transition-colors h-10"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Mortgage Info</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Principal & Interest</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mortgages.data.length > 0 ? (
                                    mortgages.data.map((mortgage) => (
                                        <tr key={mortgage.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{mortgage.mortgage_no}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{mortgage.mortgage_date}</div>
                                                {mortgage.branch && (
                                                    <div className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 mt-1 w-max">
                                                        {mortgage.branch.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {mortgage.customer ? (
                                                    <div>
                                                        <div className="font-bold text-gray-900">{mortgage.customer.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-3 h-3" /> {mortgage.customer.phone}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Unknown</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">৳ {fmtBDT(mortgage.principal_amount)}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {mortgage.interest_rate}% ({mortgage.interest_type})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {statusBadge(mortgage.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48" className="bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                                                        <Link
                                                            href={route('mortgages.show', mortgage.id)}
                                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#E88A1A] transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" /> View Details
                                                        </Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Landmark className="w-12 h-12 text-gray-200 mb-3" />
                                                <p className="text-sm">No mortgages found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {mortgages.data.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <Pagination links={mortgages.links} />
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
