import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Hammer, Printer
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

export default function ArtisanReport({ artisans = [], summary = {}, branches = [], artisanList = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [artisanId, setArtisanId] = useState(filters.artisan_id || '');

    useFilter(route('reports.artisan'), {
        branch_id: branchId,
        artisan_id: artisanId,
    });

    const fmtMoney = (val) => {
        const formatted = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(formatted)}` : `BDT ${formatted}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Hammer className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('artisanReport')}
                    </h2>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer print:hidden"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Printer className="w-4 h-4" />
                        {t('print')}
                    </button>
                </div>
            }
        >
            <Head title={t('artisanReport')} />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">{t('artisanReport')}</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        <p>{t('Printed') || 'Printed'}: {isBn ? toBn(new Date().toLocaleDateString()) : new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('branch')}</label>
                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">{t('allBranches')}</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('artisans')}</label>
                        <select
                            value={artisanId}
                            onChange={(e) => setArtisanId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">{t('allArtisans')}</option>
                            {artisanList.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({isBn ? toBn(a.code) : a.code})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('totalArtisans') || 'Total Artisans'}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{isBn ? toBn(summary.total_artisans || 0) : (summary.total_artisans || 0)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('activeJobs') || 'Active Jobs'}</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">{isBn ? toBn(summary.active_jobs_count || 0) : (summary.active_jobs_count || 0)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('holdingWeight') || 'Holding Weight'}</p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{isBn ? `${toBn(summary.total_holding_gm || 0)} গ্রাম` : `${summary.total_holding_gm || 0} g`}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('payableDue') || 'Payable Due'}</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{fmtMoney(summary.total_payable_due)}</p>
                </div>
            </div>

            {/* Artisan Table */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12">
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('artisan') || 'Artisan'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('phone') || 'Phone'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('specialization') || 'Specialization'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{t('activeJobs') || 'Active Jobs'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{t('completed') || 'Completed'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('holdingWeight') || 'Holding (g)'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('makingCharge') || 'Charges'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('paidAmount')}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('dueBalance')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {artisans.length > 0 ? (
                                artisans.map((art) => (
                                    <tr key={art.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{art.name}</div>
                                            <div className="text-[11px] text-gray-400 font-semibold">{isBn ? toBn(art.code) : art.code}</div>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-gray-600 whitespace-nowrap">{art.phone ? (isBn ? toBn(art.phone) : art.phone) : '—'}</td>
                                        <td className="px-3.5 py-2.5 text-gray-700 capitalize">{art.specialization || '—'}</td>
                                        <td className="px-3.5 py-2.5 text-center font-bold text-amber-700">{isBn ? toBn(art.active_jobs) : art.active_jobs}</td>
                                        <td className="px-3.5 py-2.5 text-center font-semibold text-emerald-600">{isBn ? toBn(art.completed_jobs) : art.completed_jobs}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-indigo-900 whitespace-nowrap">{isBn ? `${toBn(art.holding_weight_gm)} গ্রাম` : `${art.holding_weight_gm} g`}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">{fmtMoney(art.total_charges)}</td>
                                        <td className="px-3.5 py-2.5 text-right font-semibold text-emerald-600 whitespace-nowrap">{fmtMoney(art.total_paid)}</td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">{fmtMoney(art.total_due)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-12 text-center text-gray-400">
                                        {t('noArtisanRecords')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
