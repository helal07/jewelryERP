import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Hammer, Plus, ArrowDownToLine, ArrowUpFromLine, X, Filter, Scale, RefreshCw } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';

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

export default function ArtisanStockIndex({ artisans, branches, purities, transactions, balanceSummary, filters }) {
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
        setData(prev => ({
            ...prev,
            weight: val,
            weight_vori: toVori(val),
        }));
    };

    const onVoriChange = (val) => {
        setData(prev => ({
            ...prev,
            weight_vori: val,
            weight: toGram(val),
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
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50/40 via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center gap-4 relative">
                        <div className="p-3 bg-amber-50 rounded-2xl" style={{ color: 'rgb(177,118,51)' }}>
                            <Hammer className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">Artisan Stock</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Track raw metal issued to & returned by artisans</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => openModal('issue')}
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                            className="flex items-center gap-2 px-4 py-2.5 hover:opacity-90 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
                        >
                            <ArrowDownToLine className="w-4 h-4" /> Issue Metal
                        </button>
                        <button
                            onClick={() => openModal('return')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
                        >
                            <ArrowUpFromLine className="w-4 h-4" /> Receive Return
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Artisan Stock" />

            <div className="space-y-5">
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
                                        <div className="text-[9px] text-gray-400 font-black uppercase">Issued</div>
                                        <div className="text-xs font-extrabold text-gray-700 mt-0.5">{fmt(b.total_issued)}g</div>
                                        <div className="text-[10px] font-bold text-gray-400">{toVori(b.total_issued)}v</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-gray-400 font-black uppercase">Returned</div>
                                        <div className="text-xs font-extrabold text-emerald-600 mt-0.5">{fmt(b.total_returned)}g</div>
                                        <div className="text-[10px] font-bold text-emerald-500/70">{toVori(b.total_returned)}v</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-gray-400 font-black uppercase">Balance</div>
                                        <div className="text-xs font-extrabold mt-0.5" style={{ color: 'rgb(177,118,51)' }}>{fmt(b.total_balance)}g</div>
                                        <div className="text-[10px] font-bold opacity-75" style={{ color: 'rgb(177,118,51)' }}>{toVori(b.total_balance)}v</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <Lbl>Filter by Artisan</Lbl>
                        <select value={artisanFilter} onChange={e => setArtisanFilter(e.target.value)}
                            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                            <option value="">All Artisans</option>
                            {artisans.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <Lbl>Filter by Branch</Lbl>
                        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
                            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Transaction Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-gray-500" /> Transaction History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3.5">Artisan</th>
                                    <th className="px-5 py-3.5">Branch</th>
                                    <th className="px-5 py-3.5">Metal / Purity</th>
                                    <th className="px-5 py-3.5 text-right">Issued (g)</th>
                                    <th className="px-5 py-3.5 text-right">Returned (g)</th>
                                    <th className="px-5 py-3.5 text-right">Balance (g)</th>
                                    <th className="px-5 py-3.5 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.data.length > 0 ? transactions.data.map(tx => (
                                    <tr key={tx.id} className="hover:bg-amber-50/20 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-gray-900">{tx.artisan?.name}</td>
                                        <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{tx.branch?.name}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <Badge label={tx.metal_type} color={tx.metal_type === 'gold' ? 'gold' : tx.metal_type === 'silver' ? 'silver' : 'platinum'} />
                                                {tx.purity && <span className="text-xs font-semibold text-gray-700">{tx.purity.name}</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-extrabold text-amber-700">
                                            {Number(tx.weight_issued) > 0 ? `${fmt(tx.weight_issued)}g` : '—'}
                                            {Number(tx.weight_issued) > 0 && <span className="block text-[10px] font-semibold text-gray-400">{toVori(tx.weight_issued)}v</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600">
                                            {Number(tx.weight_returned) > 0 ? `${fmt(tx.weight_returned)}g` : '—'}
                                            {Number(tx.weight_returned) > 0 && <span className="block text-[10px] font-semibold text-emerald-500/70">{toVori(tx.weight_returned)}v</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-extrabold text-gray-900">
                                            {fmt(tx.balance_weight)}g
                                            <span className="block text-[10px] font-bold text-gray-400">{toVori(tx.balance_weight)}v</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-xs text-gray-400 font-medium">{tx.created_at}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Hammer className="w-8 h-8 opacity-30" />
                                                <p className="text-sm font-semibold">No artisan transactions recorded yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-gray-100">
                            <Pagination links={transactions.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* ════ MODAL via Portal ════ */}
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
                                        {txType === 'issue' ? 'Issue Metal to Artisan' : 'Receive Metal from Artisan'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">Record raw metal weight movement</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <form id="artisan-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>Branch <span className="text-rose-500">*</span></Lbl>
                                        <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        {errors.branch_id && <p className="text-[11px] text-rose-500 mt-1">{errors.branch_id}</p>}
                                    </div>
                                    <div>
                                        <Lbl>Artisan <span className="text-rose-500">*</span></Lbl>
                                        <select value={data.artisan_id} onChange={e => setData('artisan_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            {artisans.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                        {errors.artisan_id && <p className="text-[11px] text-rose-500 mt-1">{errors.artisan_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>Metal Type <span className="text-rose-500">*</span></Lbl>
                                        <select value={data.metal_type} onChange={e => setData('metal_type', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            <option value="gold">Gold</option>
                                            <option value="silver">Silver</option>
                                            <option value="platinum">Platinum</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Lbl>Purity</Lbl>
                                        <select value={data.purity_id} onChange={e => setData('purity_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            <option value="">— Any Purity —</option>
                                            {purities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>Weight / gm <span className="text-rose-500">*</span></Lbl>
                                        <div className="relative">
                                            <input type="number" step="0.001" min="0.001" value={data.weight}
                                                onChange={e => onGmChange(e.target.value)}
                                                placeholder="0.000"
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-10 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                required />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">gm</span>
                                        </div>
                                        {errors.weight && <p className="text-[11px] text-rose-500 mt-1">{errors.weight}</p>}
                                    </div>

                                    <div>
                                        <Lbl>Weight / Vori</Lbl>
                                        <div className="relative">
                                            <input type="number" step="0.0001" min="0" value={data.weight_vori}
                                                onChange={e => onVoriChange(e.target.value)}
                                                placeholder="0.0000"
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-12 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">vori</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Lbl>Notes / Remarks</Lbl>
                                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                                        rows="2" placeholder="Optional transaction details..."
                                        className="w-full rounded-xl border border-gray-200 text-sm bg-gray-50 p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 rounded-b-3xl bg-gray-50/60">
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="artisan-form" disabled={processing}
                                style={txType === 'issue' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                                className={`px-6 py-2.5 text-white rounded-xl text-xs font-extrabold shadow transition-all hover:opacity-90 disabled:opacity-50 ${txType === 'return' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                                {processing ? 'Saving…' : txType === 'issue' ? 'Issue Metal' : 'Record Return'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
