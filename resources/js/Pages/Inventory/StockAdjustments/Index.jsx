import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { SlidersHorizontal, Plus, Filter, Trash2, X, ArrowDownRight, ArrowUpRight, Search, ArrowRightLeft } from 'lucide-react';
import Pagination from '@/Components/Pagination';

/* ─── helpers ──────────────────────────── */
const VORI = 11.664;
const fmt     = (v, d = 3) => Number(v ?? 0).toFixed(d);
const toVori  = (gm) => gm !== '' && gm != null ? (Number(gm) / VORI).toFixed(4) : '';
const toGram  = (v)  => v  !== '' && v  != null ? (Number(v)  * VORI).toFixed(3) : '';

/* ─── Label helper ──────────────────────── */
const Lbl = ({ children }) => (
    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>
);

export default function StockAdjustmentsIndex({ adjustments, branches, products, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        branch_id: branches[0]?.id ?? '',
        product_id: products[0]?.id ?? '',
        adjustment_date: new Date().toISOString().split('T')[0],
        type: 'in', // 'in' | 'out'
        quantity: '',
        weight_gm: '',
        weight_vori: '',
        reason: '',
    });

    const productMap = useMemo(() => Object.fromEntries(products.map(p => [String(p.id), p])), [products]);

    /* Weight cross-calculation */
    const onGmChange = (val) => {
        setData(prev => ({
            ...prev,
            weight_gm: val,
            weight_vori: toVori(val),
        }));
    };

    const onVoriChange = (val) => {
        setData(prev => ({
            ...prev,
            weight_vori: val,
            weight_gm: toGram(val),
        }));
    };

    const resetForm = () => {
        clearErrors();
        setData({
            branch_id: branches[0]?.id ?? '',
            product_id: products[0]?.id ?? '',
            adjustment_date: new Date().toISOString().split('T')[0],
            type: 'in',
            quantity: '',
            weight_gm: '',
            weight_vori: '',
            reason: '',
        });
    };

    const openAdd = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('inventory.adjustments.index'), { search, branch_id: branchId }, { preserveState: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert quantity and weight to signed values for backend compatibility
        const qtyVal = Number(data.quantity || 0);
        const wtVal  = Number(data.weight_gm || 0);

        const payload = {
            branch_id: data.branch_id,
            product_id: data.product_id,
            adjustment_date: data.adjustment_date,
            type: data.type,
            quantity_change: data.type === 'out' ? -Math.abs(qtyVal) : Math.abs(qtyVal),
            weight_change: data.type === 'out' ? -Math.abs(wtVal) : Math.abs(wtVal),
            reason: data.reason,
        };

        router.post(route('inventory.adjustments.store'), payload, {
            onSuccess: () => { setModalOpen(false); resetForm(); }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this adjustment? This will also reverse the stock ledger entry.')) {
            router.delete(route('inventory.adjustments.destroy', id));
        }
    };

    const typeBadge = (n) => {
        if (n > 0) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold uppercase rounded-xl shadow-xs">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Stock In
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold uppercase rounded-xl shadow-xs">
                <ArrowUpRight className="w-3.5 h-3.5" /> Stock Out
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50/40 via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center gap-4 relative">
                        <div className="p-3 bg-amber-50 rounded-2xl" style={{ color: 'rgb(177,118,51)' }}>
                            <SlidersHorizontal className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">Stock Adjustment</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Manage stock in & stock out corrections</p>
                        </div>
                    </div>
                    <button
                        onClick={openAdd}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-5 py-2.5 hover:opacity-90 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New Stock Adjustment
                    </button>
                </div>
            }
        >
            <Head title="Stock Adjustment" />

            <div className="space-y-5">
                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1">
                            <Lbl>Search</Lbl>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Adjustment No or Product name/code..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                            </div>
                        </div>
                        <div className="w-full sm:w-48">
                            <Lbl>Branch</Lbl>
                            <select value={branchId} onChange={e => setBranchId(e.target.value)}
                                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5" /> Filter
                        </button>
                    </form>
                </div>

                {/* Adjustments Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4 text-gray-500" /> Stock Adjustment Records
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[950px]">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    {['Adjustment #', 'Date', 'Product', 'Branch', 'Type', 'Qty Change', 'Wt Change (g)', 'Reason', 'Action'].map(h => (
                                        <th key={h} className="px-4 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {adjustments.data.length > 0 ? adjustments.data.map(adj => (
                                    <tr key={adj.id} className="hover:bg-amber-50/20 transition-colors group">
                                        <td className="px-4 py-3.5 font-bold text-gray-900">
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-800">{adj.adjustment_no}</code>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-semibold text-gray-600">{adj.adjustment_date}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-gray-900">{adj.product?.name}</div>
                                            <div className="text-[10px] text-gray-400">{adj.product?.sku}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-600 font-medium">{adj.branch?.name}</td>
                                        <td className="px-4 py-3.5">{typeBadge(adj.quantity_change)}</td>
                                        <td className={`px-4 py-3.5 text-right font-extrabold ${adj.quantity_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {adj.quantity_change >= 0 ? '+' : ''}{adj.quantity_change} pcs
                                        </td>
                                        <td className={`px-4 py-3.5 text-right font-extrabold ${adj.weight_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {adj.weight_change >= 0 ? '+' : ''}{fmt(adj.weight_change)}g
                                            <span className="block text-[10px] font-semibold text-gray-400">
                                                {adj.weight_change >= 0 ? '+' : ''}{toVori(adj.weight_change)}v
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs truncate">{adj.reason}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button onClick={() => handleDelete(adj.id)} title="Delete Adjustment"
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-60 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <SlidersHorizontal className="w-8 h-8 opacity-30" />
                                                <p className="text-sm font-semibold">No stock adjustments recorded yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {adjustments.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-gray-100">
                            <Pagination links={adjustments.links} />
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
                    <div className="relative bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '540px', maxHeight: '90vh' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl"
                            style={{ background: 'linear-gradient(to right, #fdf8f3, #ffffff)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                                    <SlidersHorizontal className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-800">New Stock Adjustment</h3>
                                    <p className="text-[10px] text-gray-400">Select Stock In or Stock Out and fill in quantities</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <form id="adjustment-form" onSubmit={handleSubmit} className="space-y-4">

                                {/* Stock In / Stock Out Switcher */}
                                <div>
                                    <Lbl>Adjustment Type <span className="text-rose-500">*</span></Lbl>
                                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/80">
                                        <button
                                            type="button"
                                            onClick={() => setData('type', 'in')}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                                                data.type === 'in'
                                                    ? 'bg-emerald-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <ArrowDownRight className="w-4 h-4" /> Stock In (Add)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('type', 'out')}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                                                data.type === 'out'
                                                    ? 'bg-rose-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> Stock Out (Deduct)
                                        </button>
                                    </div>
                                </div>

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
                                        <Lbl>Adjustment Date <span className="text-rose-500">*</span></Lbl>
                                        <input type="date" value={data.adjustment_date} onChange={e => setData('adjustment_date', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" required />
                                        {errors.adjustment_date && <p className="text-[11px] text-rose-500 mt-1">{errors.adjustment_date}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Lbl>Product <span className="text-rose-500">*</span></Lbl>
                                    <select value={data.product_id} onChange={e => setData('product_id', e.target.value)}
                                        className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                    </select>
                                    {errors.product_id && <p className="text-[11px] text-rose-500 mt-1">{errors.product_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>Quantity (pcs) <span className="text-rose-500">*</span></Lbl>
                                        <input type="number" min="1" value={data.quantity} onChange={e => setData('quantity', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                            required placeholder="e.g. 5" />
                                        {errors.quantity_change && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity_change}</p>}
                                    </div>

                                    <div>
                                        <Lbl>Weight / gm <span className="text-rose-500">*</span></Lbl>
                                        <div className="relative">
                                            <input type="number" step="0.001" min="0.001" value={data.weight_gm}
                                                onChange={e => onGmChange(e.target.value)}
                                                placeholder="e.g. 12.500"
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-10 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                required />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">gm</span>
                                        </div>
                                        {errors.weight_change && <p className="text-[11px] text-rose-500 mt-1">{errors.weight_change}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Lbl>Weight / Vori</Lbl>
                                    <div className="relative">
                                        <input type="number" step="0.0001" min="0" value={data.weight_vori}
                                            onChange={e => onVoriChange(e.target.value)}
                                            placeholder="e.g. 1.0717"
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-12 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">vori</span>
                                    </div>
                                </div>

                                <div>
                                    <Lbl>Reason / Remarks <span className="text-rose-500">*</span></Lbl>
                                    <textarea value={data.reason} onChange={e => setData('reason', e.target.value)} rows="3" required
                                        className="w-full rounded-xl border border-gray-200 text-sm bg-gray-50 p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        placeholder="Reason for this stock adjustment..." />
                                    {errors.reason && <p className="text-[11px] text-rose-500 mt-1">{errors.reason}</p>}
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 rounded-b-3xl bg-gray-50/60">
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="adjustment-form" disabled={processing}
                                style={data.type === 'in' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                                className={`px-6 py-2.5 text-white rounded-xl text-xs font-extrabold shadow transition-all hover:opacity-90 disabled:opacity-50 ${data.type === 'out' ? 'bg-rose-600 hover:bg-rose-700' : ''}`}>
                                {processing ? 'Saving…' : data.type === 'in' ? 'Save Stock In' : 'Save Stock Out'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
