import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Hammer, Plus, ArrowDownToLine, ArrowUpFromLine, X, Filter, Scale, RefreshCw } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

/* ─── helpers ──────────────────────────── */
const VORI = 11.664;
const fmt     = (v, d = 3) => Number(v ?? 0).toFixed(d);
const toVori  = (gm) => gm !== '' && gm != null ? (Number(gm) / VORI).toFixed(4) : '';
const toGram  = (v)  => v  !== '' && v  != null ? (Number(v)  * VORI).toFixed(3) : '';

/* ─── Badge ─────────────────────────────── */
const Badge = ({ label, color = 'gray' }) => {
    const c = {
        gold:    'bg-amber-50 text-amber-700 border-amber-200',
        silver:  'bg-slate-50 text-slate-600 border-slate-200',
        platinum:'bg-purple-50 text-purple-700 border-purple-200',
        gray:    'bg-gray-100 text-gray-500 border-gray-200',
    };
    return <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${c[color] ?? c.gray}`}>{label || '—'}</span>;
};

/* ─── Label helper ──────────────────────── */
const Lbl = ({ children }) => (
    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>
);

export default function ArtisanStockIndex({ artisans = [], branches = [], purities = [], transactions, balanceSummary = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

    const cleanNumber = (val) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        if (/^0+[0-9]/.test(str)) {
            str = str.replace(/^0+/, '');
        }
        return str;
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [txType, setTxType] = useState('issue'); // 'issue' | 'return'
    const [artisanFilter, setArtisanFilter] = useState(filters.artisan_id || '');
    const [branchFilter, setBranchFilter] = useState(filters.branch_id || '');

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        branch_id: branches[0]?.id ?? '',
        artisan_id: artisans[0]?.id ?? '',
        transaction_type: 'issue',
        metal_type: 'gold',
        purity_id: '',
        weight: '',
        weight_vori: '',
        notes: '',
    });

    const purityMap = useMemo(() => Object.fromEntries(purities.map(p => [String(p.id), p])), [purities]);

    /* Weight cross-calc */
    const onGmChange = (val) => {
        const cleaned = cleanNumber(val);
        setData(prev => ({
            ...prev,
            weight: cleaned,
            weight_vori: toVori(cleaned),
        }));
    };

    const onVoriChange = (val) => {
        const cleaned = cleanNumber(val);
        setData(prev => ({
            ...prev,
            weight_vori: cleaned,
            weight: toGram(cleaned),
        }));
    };

    const resetForm = () => {
        clearErrors();
        setData({
            branch_id: branches[0]?.id ?? '',
            artisan_id: artisans[0]?.id ?? '',
            transaction_type: 'issue',
            metal_type: 'gold',
            purity_id: '',
            weight: '',
            weight_vori: '',
            notes: '',
        });
    };

    const openModal = (type) => {
        setTxType(type);
        resetForm();
        setData('transaction_type', type);
        setModalOpen(true);
    };

    useFilter(route('inventory.artisan.index'), {
        artisan_id: artisanFilter,
        branch_id: branchFilter
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.artisan.store'), {
            onSuccess: () => { setModalOpen(false); resetForm(); }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 rounded-2xl" style={{ color: 'rgb(177,118,51)' }}>
                            <Hammer className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                {isBn ? 'কারিগর স্টক হিসাব' : 'Artisan Stock'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isBn ? 'কারিগরদের ধাতু প্রদান ও ফেরত হিসাব ট্র্যাক করুন' : 'Track raw metal issued to & returned by artisans'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => openModal('issue')}
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                            className="flex items-center gap-2 px-4 py-2.5 hover:opacity-90 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                            <ArrowDownToLine className="w-4 h-4" /> {isBn ? 'ধাতু প্রদান (Issue)' : 'Issue Metal'}
                        </button>
                        <button
                            type="button"
                            onClick={() => openModal('return')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                            <ArrowUpFromLine className="w-4 h-4" /> {isBn ? 'ফেরত গ্রহণ (Return)' : 'Receive Return'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? 'কারিগর স্টক' : 'Artisan Stock'} />

            <div className="space-y-6">
                {/* Balance Summary Cards */}
                {balanceSummary.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {balanceSummary.map((b, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50/50 rounded-bl-full -z-10" />
                                <div className="text-xs text-gray-500 font-extrabold uppercase tracking-wider mb-0.5">{b.artisan?.name}</div>
                                <div className="text-[11px] font-bold text-gray-400 capitalize mb-3">{b.metal_type}</div>
                                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                                    <div>
                                        <div className="text-[9px] text-gray-400 font-black uppercase">{isBn ? 'প্রদান' : 'Issued'}</div>
                                        <div className="text-xs font-extrabold text-gray-700 mt-0.5">{isBn ? `${toBn(fmt(b.total_issued))}g` : `${fmt(b.total_issued)}g`}</div>
                                        <div className="text-[10px] font-bold text-gray-400">{isBn ? `${toBn(toVori(b.total_issued))}v` : `${toVori(b.total_issued)}v`}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-gray-400 font-black uppercase">{isBn ? 'ফেরত' : 'Returned'}</div>
                                        <div className="text-xs font-extrabold text-emerald-600 mt-0.5">{isBn ? `${toBn(fmt(b.total_returned))}g` : `${fmt(b.total_returned)}g`}</div>
                                        <div className="text-[10px] font-bold text-emerald-500/70">{isBn ? `${toBn(toVori(b.total_returned))}v` : `${toVori(b.total_returned)}v`}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-gray-400 font-black uppercase">{isBn ? 'অবশিষ্ট' : 'Balance'}</div>
                                        <div className="text-xs font-extrabold mt-0.5" style={{ color: 'rgb(177,118,51)' }}>{isBn ? `${toBn(fmt(b.total_balance))}g` : `${fmt(b.total_balance)}g`}</div>
                                        <div className="text-[10px] font-bold opacity-75" style={{ color: 'rgb(177,118,51)' }}>{isBn ? `${toBn(toVori(b.total_balance))}v` : `${toVori(b.total_balance)}v`}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <Lbl>{isBn ? 'কারিগর দিয়ে ফিল্টার' : 'Filter by Artisan'}</Lbl>
                        <select value={artisanFilter} onChange={e => setArtisanFilter(e.target.value)}
                            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700">
                            <option value="">{isBn ? 'সব কারিগর' : 'All Artisans'}</option>
                            {artisans.map(a => <option key={a.id} value={a.id}>{a.name} ({isBn ? toBn(a.code) : a.code})</option>)}
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <Lbl>{isBn ? 'শাখা দিয়ে ফিল্টার' : 'Filter by Branch'}</Lbl>
                        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
                            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700">
                            <option value="">{isBn ? 'সব শাখা' : 'All Branches'}</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Standard Table Container */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কারিগর' : 'Artisan'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'শাখা' : 'Branch'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ধাতু / ক্যারেট' : 'Metal / Purity'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'প্রদান (গ্রাম)' : 'Issued (g)'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'ফেরত (গ্রাম)' : 'Returned (g)'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অবশিষ্ট ব্যালেন্স' : 'Balance (g)'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'তারিখ' : 'Date'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {transactions.data && transactions.data.length > 0 ? (
                                    transactions.data.map(tx => (
                                        <tr key={tx.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap">{tx.artisan?.name}</td>
                                            <td className="px-3 py-3 text-gray-600 font-medium whitespace-nowrap">{tx.branch?.name}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Badge label={tx.metal_type} color={tx.metal_type === 'gold' ? 'gold' : tx.metal_type === 'silver' ? 'silver' : 'platinum'} />
                                                    {tx.purity && <span className="font-semibold text-gray-700">{tx.purity.name}</span>}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-right font-extrabold text-amber-700 whitespace-nowrap">
                                                {Number(tx.weight_issued) > 0 ? (isBn ? `${toBn(fmt(tx.weight_issued))} গ্রাম` : `${fmt(tx.weight_issued)}g`) : '—'}
                                                {Number(tx.weight_issued) > 0 && <span className="block text-[10px] font-semibold text-gray-400">{isBn ? `${toBn(toVori(tx.weight_issued))}ভরি` : `${toVori(tx.weight_issued)}v`}</span>}
                                            </td>
                                            <td className="px-3 py-3 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                                                {Number(tx.weight_returned) > 0 ? (isBn ? `${toBn(fmt(tx.weight_returned))} গ্রাম` : `${fmt(tx.weight_returned)}g`) : '—'}
                                                {Number(tx.weight_returned) > 0 && <span className="block text-[10px] font-semibold text-emerald-500/70">{isBn ? `${toBn(toVori(tx.weight_returned))}ভরি` : `${toVori(tx.weight_returned)}v`}</span>}
                                            </td>
                                            <td className="px-3 py-3 text-right font-extrabold text-gray-900 whitespace-nowrap">
                                                {isBn ? `${toBn(fmt(tx.balance_weight))} গ্রাম` : `${fmt(tx.balance_weight)}g`}
                                                <span className="block text-[10px] font-bold text-gray-400">{isBn ? `${toBn(toVori(tx.balance_weight))}ভরি` : `${toVori(tx.balance_weight)}v`}</span>
                                            </td>
                                            <td className="px-3 py-3 text-right text-gray-500 font-medium whitespace-nowrap">
                                                {tx.created_at ? (isBn ? toBn(String(tx.created_at).substring(0, 10)) : String(tx.created_at).substring(0, 10)) : '—'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Hammer className="w-8 h-8 opacity-30" />
                                                <p className="text-sm font-semibold">{isBn ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি।' : 'No artisan transactions recorded yet.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="mt-4">
                            <Pagination links={transactions.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal via Portal */}
            {modalOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,23,42,0.55)' }}
                >
                    <div className="relative bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '520px', maxHeight: '90vh' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl"
                            style={{ background: 'linear-gradient(to right, #fdf8f3, #ffffff)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl"
                                    style={{
                                        backgroundColor: txType === 'issue' ? 'rgba(177,118,51,0.12)' : 'rgba(16,185,129,0.12)',
                                        color: txType === 'issue' ? 'rgb(177,118,51)' : 'rgb(16,185,129)'
                                    }}>
                                    {txType === 'issue' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-800">
                                        {txType === 'issue' ? (isBn ? 'কারিগরকে ধাতু প্রদান' : 'Issue Metal to Artisan') : (isBn ? 'কারিগর থেকে ধাতু ফেরত গ্রহণ' : 'Receive Metal from Artisan')}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">{isBn ? 'কাঁচা স্বর্ণ বা রূপার ওজন হিসাব এন্ট্রি' : 'Record raw metal weight movement'}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <form id="artisan-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>{isBn ? 'শাখা *' : 'Branch *'}</Lbl>
                                        <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        {errors.branch_id && <p className="text-[11px] text-rose-500 mt-1">{errors.branch_id}</p>}
                                    </div>
                                    <div>
                                        <Lbl>{isBn ? 'কারিগর *' : 'Artisan *'}</Lbl>
                                        <select value={data.artisan_id} onChange={e => setData('artisan_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            {artisans.map(a => <option key={a.id} value={a.id}>{a.name} ({isBn ? toBn(a.code) : a.code})</option>)}
                                        </select>
                                        {errors.artisan_id && <p className="text-[11px] text-rose-500 mt-1">{errors.artisan_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>{isBn ? 'ধাতু *' : 'Metal Type *'}</Lbl>
                                        <select value={data.metal_type} onChange={e => setData('metal_type', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            <option value="gold">{isBn ? 'স্বর্ণ (Gold)' : 'Gold'}</option>
                                            <option value="silver">{isBn ? 'রূপা (Silver)' : 'Silver'}</option>
                                            <option value="platinum">{isBn ? 'প্লাটিনাম (Platinum)' : 'Platinum'}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Lbl>{isBn ? 'ক্যারেট / বিশুদ্ধতা' : 'Purity'}</Lbl>
                                        <select value={data.purity_id} onChange={e => setData('purity_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            <option value="">{isBn ? '— যেকোনো ক্যারেট —' : '— Any Purity —'}</option>
                                            {purities.map(p => <option key={p.id} value={p.id}>{p.name} ({isBn ? toBn(p.percentage) : p.percentage}%)</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>{isBn ? 'ওজন / গ্রাম *' : 'Weight / gm *'}</Lbl>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="any" 
                                                value={data.weight}
                                                onFocus={handleNumberFocus}
                                                onChange={e => onGmChange(e.target.value)}
                                                placeholder="0"
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-10 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                required 
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">{isBn ? 'গ্রাম' : 'gm'}</span>
                                        </div>
                                        {errors.weight && <p className="text-[11px] text-rose-500 mt-1">{errors.weight}</p>}
                                    </div>

                                    <div>
                                        <Lbl>{isBn ? 'ওজন / ভরি' : 'Weight / Vori'}</Lbl>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="any" 
                                                value={data.weight_vori}
                                                onFocus={handleNumberFocus}
                                                onChange={e => onVoriChange(e.target.value)}
                                                placeholder="0"
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-12 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" 
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">{isBn ? 'ভরি' : 'vori'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Lbl>{isBn ? 'মন্তব্য / নোট' : 'Notes / Remarks'}</Lbl>
                                    <textarea 
                                        value={data.notes} 
                                        onChange={e => setData('notes', e.target.value)}
                                        rows="2" 
                                        placeholder={isBn ? 'লেনদেন সংক্রান্ত বিবরণ...' : 'Optional transaction details...'}
                                        className="w-full rounded-xl border border-gray-200 text-sm bg-gray-50 p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" 
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 rounded-b-3xl bg-gray-50/60">
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button type="submit" form="artisan-form" disabled={processing}
                                style={txType === 'issue' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                                className={`px-6 py-2.5 text-white rounded-xl text-xs font-extrabold shadow transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer ${txType === 'return' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving…') : txType === 'issue' ? (isBn ? 'ধাতু প্রদান সংরক্ষণ' : 'Issue Metal') : (isBn ? 'ফেরত গ্রহণ সংরক্ষণ' : 'Record Return')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
