import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Boxes, Plus, Search, Filter, Pencil, Trash2, X, Scale, Calculator } from 'lucide-react';

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

/* ─── Read-only display field ───────────── */
const ROField = ({ label, value, accent }) => (
    <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className={`h-10 flex items-center px-3 rounded-xl border text-sm font-semibold
            ${accent ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
            {value || <span className="text-gray-300 font-normal">—</span>}
        </div>
    </div>
);

/* ─── Label helper ──────────────────────── */
const Lbl = ({ children }) => (
    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>
);

/* ════════════════════════════════════════════════════════════ */
export default function OpeningStockIndex({ openingStocks, branches, purities, products, filters }) {

    const [search,   setSearch]   = useState(filters.search    || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [sel, setSel] = useState(null);          // selected product object

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        product_id:     '',
        branch_id:      branches[0]?.id ?? '',
        quantity:       '',
        weight_in_gm:   '',
        weight_in_vori: '',
        vat_percentage: '',
    });

    /* lookups */
    const productMap = useMemo(() => Object.fromEntries(products.map(p => [String(p.id), p])), [products]);
    const purityMap  = useMemo(() => Object.fromEntries(purities.map(p  => [String(p.id), p])),  [purities]);

    /* weight sync */
    const onGmChange   = v => setData(d => ({ ...d, weight_in_gm: v,       weight_in_vori: toVori(v) }));
    const onVoriChange = v => setData(d => ({ ...d, weight_in_vori: v,     weight_in_gm:   toGram(v) }));

    /* product select */
    const onProductSelect = (id) => {
        const p = productMap[id] ?? null;
        setSel(p);
        setData(d => ({
            ...d,
            product_id:     id,
            weight_in_gm:   p ? fmt(p.net_weight, 3)   : '',
            weight_in_vori: p ? toVori(p.net_weight)    : '',
            vat_percentage: p ? fmt(p.vat_percentage, 2): '',
        }));
    };

    /* live total */
    const liveTotal = useMemo(() => {
        if (!sel || !data.weight_in_vori) return null;
        const rate = Number(sel.rate_per_vori ?? 0);
        const vat  = Number(data.vat_percentage || 0);
        const base = rate * Number(data.weight_in_vori);
        return (base + base * vat / 100).toFixed(2);
    }, [sel, data.weight_in_vori, data.vat_percentage]);

    /* reset */
    const resetForm = () => {
        setSel(null);
        clearErrors();
        setData({ product_id:'', branch_id: branches[0]?.id ?? '', quantity:'', weight_in_gm:'', weight_in_vori:'', vat_percentage:'' });
    };

    const openAdd  = () => { setEditRecord(null); resetForm(); setModalOpen(true); };
    const openEdit = (stock) => {
        setEditRecord(stock);
        const p = productMap[String(stock.product_id)] ?? null;
        setSel(p);
        clearErrors();
        setData({
            product_id:     String(stock.product_id ?? ''),
            branch_id:      String(stock.branch_id  ?? branches[0]?.id ?? ''),
            quantity:       String(stock.quantity_in ?? ''),
            weight_in_gm:   fmt(stock.weight_in, 3),
            weight_in_vori: toVori(stock.weight_in),
            vat_percentage: p ? fmt(p.vat_percentage, 2) : '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cb = { onSuccess: () => { setModalOpen(false); resetForm(); } };
        editRecord ? put(route('inventory.opening.update', editRecord.id), cb)
                   : post(route('inventory.opening.store'), cb);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this opening stock entry?'))
            router.delete(route('inventory.opening.destroy', id));
    };

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('inventory.opening.index'), { search, branch_id: branchId }, { preserveState: true });
    };

    const rowTotal = (stock) => {
        const p = productMap[String(stock.product_id)] ?? stock.product ?? null;
        if (!p) return '—';
        const base = Number(p.rate_per_vori ?? 0) * (Number(stock.weight_in ?? 0) / VORI);
        return (base + base * Number(p.vat_percentage ?? 0) / 100).toFixed(2);
    };

    /* ══════════════ RENDER ══════════════════════════════════════ */
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50/40 via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center gap-4 relative">
                        <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                            <Boxes className="w-6 h-6" style={{ color: 'rgb(177,118,51)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">Opening Stock</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Set initial stock for each product</p>
                        </div>
                    </div>
                    <button
                        onClick={openAdd}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-5 py-2.5 hover:opacity-90 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>
            }
        >
            <Head title="Opening Stock" />

            <div className="space-y-5">

                {/* ── Filters ── */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1">
                            <Lbl>Search</Lbl>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)} type="text"
                                    placeholder="Product name or code…"
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                            </div>
                        </div>
                        <div className="w-full sm:w-44">
                            <Lbl>Branch</Lbl>
                            <select value={branchId} onChange={e => setBranchId(e.target.value)}
                                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5" /> Filter
                        </button>
                    </form>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[1100px]">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    {['SL','Category','Product Name','Product Code','Stock Type','Metal','Purity','Wt/Vori','Wt/gm','VAT%','Total','Action'].map(h => (
                                        <th key={h} className="px-4 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {openingStocks.data.length > 0 ? openingStocks.data.map((stock, idx) => {
                                    const p   = productMap[String(stock.product_id)] ?? stock.product ?? {};
                                    const cat = stock.product?.category ?? null;
                                    const pur = purityMap[String(p.purity_id)]?.name ?? stock.product?.purity?.name ?? '—';
                                    const sl  = (openingStocks.current_page - 1) * openingStocks.per_page + idx + 1;
                                    return (
                                        <tr key={stock.id} className="hover:bg-amber-50/20 transition-colors group">
                                            <td className="px-4 py-3 text-xs font-bold text-gray-400">{sl}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-gray-700">{cat?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900">{p.name ?? '—'}</div>
                                                <div className="text-[10px] text-gray-400">{stock.branch?.name}</div>
                                            </td>
                                            <td className="px-4 py-3"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-700">{p.sku ?? '—'}</code></td>
                                            <td className="px-4 py-3"><Badge label={p.stock_type ?? 'N/A'} /></td>
                                            <td className="px-4 py-3"><Badge label={p.metal_type} color={p.metal_type === 'gold' ? 'gold' : p.metal_type === 'silver' ? 'silver' : 'platinum'} /></td>
                                            <td className="px-4 py-3 text-xs font-semibold text-gray-700">{pur}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-800">{toVori(stock.weight_in)}<span className="text-[10px] text-gray-400 ml-0.5">v</span></td>
                                            <td className="px-4 py-3 text-right font-bold text-amber-900">{fmt(stock.weight_in)}<span className="text-[10px] text-gray-400 ml-0.5">g</span></td>
                                            <td className="px-4 py-3 text-right text-xs font-bold text-gray-600">{fmt(p.vat_percentage ?? 0, 2)}%</td>
                                            <td className="px-4 py-3 text-right font-extrabold text-gray-900 text-sm">৳{rowTotal(stock)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(stock)} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDelete(stock.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="12" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Boxes className="w-12 h-12" />
                                            <p className="text-sm font-semibold text-gray-500">No opening stock entries yet.</p>
                                            <button onClick={openAdd} style={{ color: 'rgb(177,118,51)' }} className="hover:underline text-xs font-bold">+ Add the first entry</button>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {openingStocks.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Showing {openingStocks.from}–{openingStocks.to} of {openingStocks.total}</span>
                            <div className="flex gap-1.5">
                                {openingStocks.links.map((link, i) => (
                                    <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                        style={link.active ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${link.active ? 'text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} disabled:opacity-40`}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ════ MODAL via Portal — renders into document.body ════ */}
            {modalOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,23,42,0.55)' }}
                >
                        {/* modal card */}
                        <div className="relative bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '660px', maxHeight: '90vh' }}>

                            {/* ── HEADER ── */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl"
                                style={{ background: 'linear-gradient(to right, #fdf8f3, #ffffff)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}><Scale className="w-4 h-4" /></div>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-gray-800">
                                            {editRecord ? 'Edit Opening Stock' : 'Add Opening Stock'}
                                        </h3>
                                        <p className="text-[10px] text-gray-400">Fill in all details then click Save</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                    className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* ── BODY (scrolls internally) ── */}
                            <div className="px-6 py-5 overflow-y-auto flex-1">
                                <form id="os-form" onSubmit={handleSubmit} className="space-y-5">

                                    {/* Row 1 — Branch + Product */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Lbl>Branch <span className="text-rose-500">*</span></Lbl>
                                            <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)}
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                                <option value="">— Select Branch —</option>
                                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                            {errors.branch_id && <p className="text-[11px] text-rose-500 mt-1">{errors.branch_id}</p>}
                                        </div>
                                        <div>
                                            <Lbl>Product <span className="text-rose-500">*</span></Lbl>
                                            <select value={data.product_id} onChange={e => onProductSelect(e.target.value)}
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                                <option value="">— Select Product —</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {errors.product_id && <p className="text-[11px] text-rose-500 mt-1">{errors.product_id}</p>}
                                        </div>
                                    </div>

                                    {/* Product Details section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex-1 h-px bg-gray-100" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Product Details</span>
                                            <div className="flex-1 h-px bg-gray-100" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <ROField label="Category"         value={sel?.category?.name} />
                                            <ROField label="Product Code (SKU)" value={sel?.sku} />
                                            <ROField label="Stock Type"        value={sel?.stock_type} />
                                            <ROField label="Metal Type"        value={sel?.metal_type ? sel.metal_type.charAt(0).toUpperCase() + sel.metal_type.slice(1) : ''} />
                                            <ROField label="Purity"            value={sel ? (purityMap[String(sel.purity_id)]?.name ?? '—') : ''} />
                                            <ROField label="Rate / Vori (৳)"   value={sel ? `৳ ${fmt(sel.rate_per_vori, 2)}` : ''} accent />
                                        </div>
                                    </div>

                                    {/* Stock Entry section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex-1 h-px bg-gray-100" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Stock Entry</span>
                                            <div className="flex-1 h-px bg-gray-100" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">

                                            {/* Quantity */}
                                            <div>
                                                <Lbl>Quantity (pcs) <span className="text-rose-500">*</span></Lbl>
                                                <input type="number" min="0" value={data.quantity}
                                                    onChange={e => setData('quantity', e.target.value)}
                                                    placeholder="e.g. 10"
                                                    className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                    required />
                                                {errors.quantity && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity}</p>}
                                            </div>

                                            {/* VAT */}
                                            <div>
                                                <Lbl>VAT %</Lbl>
                                                <div className="relative">
                                                    <input type="number" step="0.01" min="0" max="100" value={data.vat_percentage}
                                                        onChange={e => setData('vat_percentage', e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-8 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">%</span>
                                                </div>
                                            </div>

                                            {/* Weight gm */}
                                            <div>
                                                <Lbl>Weight / gm <span className="text-rose-500">*</span></Lbl>
                                                <div className="relative">
                                                    <input type="number" step="0.001" min="0" value={data.weight_in_gm}
                                                        onChange={e => onGmChange(e.target.value)}
                                                        placeholder="0.000"
                                                        className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-10 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                        required />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">gm</span>
                                                </div>
                                                {errors.weight_in_gm && <p className="text-[11px] text-rose-500 mt-1">{errors.weight_in_gm}</p>}
                                            </div>

                                            {/* Weight vori */}
                                            <div>
                                                <Lbl>Weight / Vori</Lbl>
                                                <div className="relative">
                                                    <input type="number" step="0.0001" min="0" value={data.weight_in_vori}
                                                        onChange={e => onVoriChange(e.target.value)}
                                                        placeholder="0.0000"
                                                        className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-12 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">vori</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Total */}
                                    {liveTotal !== null && (
                                        <div className="flex items-center justify-between rounded-2xl px-5 py-4 text-white shadow-sm"
                                            style={{ background: 'linear-gradient(135deg, rgb(177,118,51), rgb(140,90,35))' }}>
                                            <div className="flex items-center gap-2">
                                                <Calculator className="w-5 h-5 opacity-80" />
                                                <span className="text-xs font-bold opacity-90">Total Amount (incl. VAT)</span>
                                            </div>
                                            <span className="text-2xl font-extrabold tracking-tight">৳ {liveTotal}</span>
                                        </div>
                                    )}

                                </form>
                            </div>

                            {/* ── FOOTER ── */}
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 rounded-b-3xl bg-gray-50/60">
                                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" form="os-form" disabled={processing}
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                    className="px-6 py-2.5 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow transition-all">
                                    {processing ? 'Saving…' : editRecord ? 'Update Stock' : 'Save Opening Stock'}
                                </button>
                            </div>

                        </div>{/* end modal card */}
                </div>
            , document.body)}
        </AuthenticatedLayout>
    );
}
