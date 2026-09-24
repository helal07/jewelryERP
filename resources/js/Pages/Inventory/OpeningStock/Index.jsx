import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Boxes, Plus, Search, Filter, Pencil, Trash2, X, Scale, Calculator } from 'lucide-react';
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

export default function OpeningStockIndex({ openingStocks, branches = [], purities = [], products = [], filters = {} }) {
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

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

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
    const onGmChange   = v => {
        const cleaned = cleanNumber(v);
        setData(d => ({ ...d, weight_in_gm: cleaned, weight_in_vori: toVori(cleaned) }));
    };
    const onVoriChange = v => {
        const cleaned = cleanNumber(v);
        setData(d => ({ ...d, weight_in_vori: cleaned, weight_in_gm: toGram(cleaned) }));
    };

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
        if (confirm(isBn ? 'আপনি কি এই প্রারম্ভিক স্টকটি মুছে ফেলতে চান?' : 'Delete this opening stock entry?'))
            router.delete(route('inventory.opening.destroy', id));
    };

    useFilter(route('inventory.opening.index'), {
        search,
        branch_id: branchId
    });

    const rowTotal = (stock) => {
        const p = productMap[String(stock.product_id)] ?? stock.product ?? null;
        if (!p) return '—';
        const base = Number(p.rate_per_vori ?? 0) * (Number(stock.weight_in ?? 0) / VORI);
        const total = (base + base * Number(p.vat_percentage ?? 0) / 100).toFixed(2);
        return fmtMoney(total);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                            <Boxes className="w-6 h-6" style={{ color: 'rgb(177,118,51)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">
                                {isBn ? 'প্রারম্ভিক স্টক (Opening Stock)' : 'Opening Stock'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isBn ? 'পণ্যসমূহের প্রারম্ভিক মজুদ ও বিবরণ নির্ধারণ করুন' : 'Set initial stock for each product'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={openAdd}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-5 py-2.5 hover:opacity-90 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> {isBn ? 'নতুন প্রারম্ভিক স্টক' : 'Add New'}
                    </button>
                </div>
            }
        >
            <Head title={isBn ? 'প্রারম্ভিক স্টক' : 'Opening Stock'} />

            <div className="space-y-6">

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                            <Lbl>{isBn ? 'পণ্য বা SKU দিয়ে খুঁজুন' : 'Search'}</Lbl>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} 
                                    placeholder={isBn ? 'পণ্যের নাম বা কোড লিখুন...' : 'Product name or SKU...'}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                            </div>
                        </div>
                        <div className="w-full sm:w-56">
                            <Lbl>{isBn ? 'শাখা' : 'Branch'}</Lbl>
                            <select value={branchId} onChange={e => setBranchId(e.target.value)}
                                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700">
                                <option value="">{isBn ? 'সব শাখা' : 'All Branches'}</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Standard Table Container */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ক্রমিক' : 'SL'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পণ্যের নাম ও শাখা' : 'Product Name'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কোড' : 'Code'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'স্টক ধরণ' : 'Stock Type'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ধাতু' : 'Metal'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ক্যারেট' : 'Purity'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'ওজন (ভরি)' : 'Wt/Vori'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'ওজন (গ্রাম)' : 'Wt/gm'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'ভ্যাট (%)' : 'VAT%'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'মোট মূল্য' : 'Total'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {openingStocks.data && openingStocks.data.length > 0 ? openingStocks.data.map((stock, idx) => {
                                    const p   = productMap[String(stock.product_id)] ?? stock.product ?? {};
                                    const cat = stock.product?.category ?? null;
                                    const pur = purityMap[String(p.purity_id)]?.name ?? stock.product?.purity?.name ?? '—';
                                    const sl  = (openingStocks.current_page - 1) * openingStocks.per_page + idx + 1;
                                    return (
                                        <tr key={stock.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-3 font-bold text-gray-400 whitespace-nowrap">{isBn ? toBn(sl) : sl}</td>
                                            <td className="px-3 py-3 font-bold text-gray-700 whitespace-nowrap">{cat?.name ?? '—'}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{p.name ?? '—'}</div>
                                                <div className="text-[10px] text-gray-400">{stock.branch?.name}</div>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap"><code className="bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-700">{p.sku ?? '—'}</code></td>
                                            <td className="px-3 py-3 whitespace-nowrap"><Badge label={p.stock_type ?? 'N/A'} /></td>
                                            <td className="px-3 py-3 whitespace-nowrap"><Badge label={p.metal_type} color={p.metal_type === 'gold' ? 'gold' : p.metal_type === 'silver' ? 'silver' : 'platinum'} /></td>
                                            <td className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap">{pur}</td>
                                            <td className="px-3 py-3 text-right font-bold text-gray-800 whitespace-nowrap">{isBn ? `${toBn(toVori(stock.weight_in))} ভরি` : `${toVori(stock.weight_in)}v`}</td>
                                            <td className="px-3 py-3 text-right font-bold text-amber-900 whitespace-nowrap">{isBn ? `${toBn(fmt(stock.weight_in))} গ্রাম` : `${fmt(stock.weight_in)}g`}</td>
                                            <td className="px-3 py-3 text-right font-bold text-gray-600 whitespace-nowrap">{isBn ? `${toBn(fmt(p.vat_percentage ?? 0, 2))}%` : `${fmt(p.vat_percentage ?? 0, 2)}%`}</td>
                                            <td className="px-3 py-3 text-right font-extrabold text-gray-900 whitespace-nowrap">{rowTotal(stock)}</td>
                                            <td className="px-3 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button type="button" onClick={() => openEdit(stock)} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer" title={isBn ? 'এডিট' : 'Edit'}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDelete(stock.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer" title={isBn ? 'মুছুন' : 'Delete'}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="12" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Boxes className="w-12 h-12" />
                                            <p className="text-sm font-semibold text-gray-500">{isBn ? 'কোনো প্রারম্ভিক স্টক এন্ট্রি নেই।' : 'No opening stock entries yet.'}</p>
                                            <button type="button" onClick={openAdd} style={{ color: 'rgb(177,118,51)' }} className="hover:underline text-xs font-bold cursor-pointer">
                                                {isBn ? '+ প্রথম প্রারম্ভিক স্টক যোগ করুন' : '+ Add the first entry'}
                                            </button>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {openingStocks.links && openingStocks.links.length > 3 && (
                        <div className="mt-4">
                            <Pagination links={openingStocks.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL via Portal */}
            {modalOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(15,23,42,0.55)' }}
                >
                    <div className="relative bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '660px', maxHeight: '90vh' }}>

                        {/* HEADER */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl"
                            style={{ background: 'linear-gradient(to right, #fdf8f3, #ffffff)' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}><Scale className="w-4 h-4" /></div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-gray-800">
                                        {editRecord ? (isBn ? 'প্রারম্ভিক স্টক এডিট' : 'Edit Opening Stock') : (isBn ? 'নতুন প্রারম্ভিক স্টক যোগ' : 'Add Opening Stock')}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">{isBn ? 'সব বিবরণ পূরণ করে সেভ বাটনে চাপুন' : 'Fill in all details then click Save'}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <form id="os-form" onSubmit={handleSubmit} className="space-y-5">

                                {/* Row 1 — Branch + Product */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>{isBn ? 'শাখা *' : 'Branch *'}</Lbl>
                                        <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            <option value="">{isBn ? '— শাখা নির্বাচন করুন —' : '— Select Branch —'}</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        {errors.branch_id && <p className="text-[11px] text-rose-500 mt-1">{errors.branch_id}</p>}
                                    </div>
                                    <div>
                                        <Lbl>{isBn ? 'পণ্য *' : 'Product *'}</Lbl>
                                        <select value={data.product_id} onChange={e => onProductSelect(e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            <option value="">{isBn ? '— পণ্য নির্বাচন করুন —' : '— Select Product —'}</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        {errors.product_id && <p className="text-[11px] text-rose-500 mt-1">{errors.product_id}</p>}
                                    </div>
                                </div>

                                {/* Product Details section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex-1 h-px bg-gray-100" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{isBn ? 'পণ্যের বিবরণ' : 'Product Details'}</span>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ROField label={isBn ? 'ক্যাটাগরি' : 'Category'}         value={sel?.category?.name} />
                                        <ROField label={isBn ? 'পণ্য কোড (SKU)' : 'Product Code (SKU)'} value={sel?.sku} />
                                        <ROField label={isBn ? 'স্টকের ধরণ' : 'Stock Type'}        value={sel?.stock_type} />
                                        <ROField label={isBn ? 'ধাতুর ধরণ' : 'Metal Type'}        value={sel?.metal_type ? sel.metal_type.charAt(0).toUpperCase() + sel.metal_type.slice(1) : ''} />
                                        <ROField label={isBn ? 'ক্যারেট' : 'Purity'}            value={sel ? (purityMap[String(sel.purity_id)]?.name ?? '—') : ''} />
                                        <ROField label={isBn ? 'ভরি প্রতি দর (৳)' : 'Rate / Vori (BDT)'}   value={sel ? fmtMoney(sel.rate_per_vori) : ''} accent />
                                    </div>
                                </div>

                                {/* Stock Entry section */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex-1 h-px bg-gray-100" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{isBn ? 'স্টক পরিমাণ ও ওজন' : 'Stock Entry'}</span>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">

                                        {/* Quantity */}
                                        <div>
                                            <Lbl>{isBn ? 'পরিমাণ (পিস) *' : 'Quantity (pcs) *'}</Lbl>
                                            <input 
                                                type="number" 
                                                step="any"
                                                min="0" 
                                                value={data.quantity}
                                                onFocus={handleNumberFocus}
                                                onChange={e => setData('quantity', cleanNumber(e.target.value))}
                                                placeholder="0"
                                                className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                required 
                                            />
                                            {errors.quantity && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity}</p>}
                                        </div>

                                        {/* VAT */}
                                        <div>
                                            <Lbl>{isBn ? 'ভ্যাট %' : 'VAT %'}</Lbl>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="any" 
                                                    min="0" 
                                                    value={data.vat_percentage}
                                                    onFocus={handleNumberFocus}
                                                    onChange={e => setData('vat_percentage', cleanNumber(e.target.value))}
                                                    placeholder="0"
                                                    className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-8 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" 
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">%</span>
                                            </div>
                                        </div>

                                        {/* Weight Gram */}
                                        <div>
                                            <Lbl>{isBn ? 'মোট ওজন / গ্রাম *' : 'Weight / gm *'}</Lbl>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="any" 
                                                    min="0" 
                                                    value={data.weight_in_gm}
                                                    onFocus={handleNumberFocus}
                                                    onChange={e => onGmChange(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-10 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                    required 
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">{isBn ? 'গ্রাম' : 'gm'}</span>
                                            </div>
                                            {errors.weight_in_gm && <p className="text-[11px] text-rose-500 mt-1">{errors.weight_in_gm}</p>}
                                        </div>

                                        {/* Weight Vori */}
                                        <div>
                                            <Lbl>{isBn ? 'ওজন / ভরি' : 'Weight / Vori'}</Lbl>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="any" 
                                                    min="0" 
                                                    value={data.weight_in_vori}
                                                    onFocus={handleNumberFocus}
                                                    onChange={e => onVoriChange(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full h-10 rounded-xl border border-gray-200 text-sm bg-gray-50 px-3 pr-12 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" 
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">{isBn ? 'ভরি' : 'vori'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live total calculation banner */}
                                {liveTotal && (
                                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                            <Calculator className="w-4 h-4 text-amber-700" />
                                            <span>{isBn ? 'আনুমানিক মোট মূল্য (ভ্যাটসহ):' : 'Estimated Total (incl. VAT):'}</span>
                                        </div>
                                        <span className="text-base font-black text-amber-900">{fmtMoney(liveTotal)}</span>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* FOOTER */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 rounded-b-3xl bg-gray-50/60">
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button type="submit" form="os-form" disabled={processing}
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                                className="px-6 py-2.5 text-white rounded-xl text-xs font-extrabold shadow transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer">
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving…') : editRecord ? (isBn ? 'আপডেট করুন' : 'Update Stock') : (isBn ? 'সংরক্ষণ করুন' : 'Save Stock')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
