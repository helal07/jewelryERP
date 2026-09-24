import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { SlidersHorizontal, Plus, Trash2, X, ArrowDownRight, ArrowUpRight, Search, ArrowRightLeft } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

/* ─── helpers ──────────────────────────── */
const VORI = 11.664;
const fmt     = (v, d = 3) => Number(v ?? 0).toFixed(d);
const toVori  = (gm) => gm !== '' && gm != null ? (Number(gm) / VORI).toFixed(4) : '';
const toGram  = (v)  => v  !== '' && v  != null ? (Number(v)  * VORI).toFixed(3) : '';

/* ─── Label helper ──────────────────────── */
const Lbl = ({ children }) => (
    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>
);

export default function StockAdjustmentsIndex({ adjustments, branches = [], products = [], filters = {} }) {
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
        const cleaned = cleanNumber(val);
        setData(prev => ({
            ...prev,
            weight_gm: cleaned,
            weight_vori: toVori(cleaned),
        }));
    };

    const onVoriChange = (val) => {
        const cleaned = cleanNumber(val);
        setData(prev => ({
            ...prev,
            weight_vori: cleaned,
            weight_gm: toGram(cleaned),
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

    useFilter(route('inventory.adjustments.index'), {
        search,
        branch_id: branchId
    });

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
        if (confirm(isBn ? 'এই স্টক অ্যাডজাস্টমেন্ট মুছে ফেলতে চান? এটি স্টক লেজার এন্ট্রিও বিপরীত করবে।' : 'Delete this adjustment? This will also reverse the stock ledger entry.')) {
            router.delete(route('inventory.adjustments.destroy', id));
        }
    };

    const typeBadge = (n) => {
        if (n > 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase rounded-lg">
                    <ArrowDownRight className="w-3 h-3" /> {isBn ? 'স্টক ইন' : 'Stock In'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase rounded-lg">
                <ArrowUpRight className="w-3 h-3" /> {isBn ? 'স্টক আউট' : 'Stock Out'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <SlidersHorizontal className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'স্টক অ্যাডজাস্টমেন্ট' : 'Stock Adjustment'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'স্টক ইন ও আউট সংশোধন পরিচালনা করুন' : 'Manage stock in & stock out corrections'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openAdd}
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                        className="flex items-center gap-2 px-4 py-2 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isBn ? 'নতুন অ্যাডজাস্টমেন্ট' : 'New Stock Adjustment'}</span>
                    </button>
                </div>
            }
        >
            <Head title={isBn ? 'স্টক অ্যাডজাস্টমেন্ট' : 'Stock Adjustment'} />

            <div className="space-y-4">
                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Lbl>{isBn ? 'অনুসন্ধান' : 'Search'}</Lbl>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={isBn ? 'অ্যাডজাস্টমেন্ট নং বা পণ্যের নাম/কোড...' : 'Adjustment No or Product name/code...'}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>
                        </div>
                        <div>
                            <Lbl>{isBn ? 'শাখা' : 'Branch'}</Lbl>
                            <select
                                value={branchId}
                                onChange={e => setBranchId(e.target.value)}
                                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="">{isBn ? 'সকল শাখা' : 'All Branches'}</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Adjustments Table Container */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                            {isBn ? 'স্টক অ্যাডজাস্টমেন্ট তালিকা' : 'Stock Adjustment Records'}
                        </h3>
                    </div>

                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অ্যাডজাস্টমেন্ট #' : 'Adjustment #'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'তারিখ' : 'Date'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পণ্য' : 'Product'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'শাখা' : 'Branch'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ধরন' : 'Type'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'পরিমাণ পরিবর্তন' : 'Qty Change'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'ওজন পরিবর্তন' : 'Wt Change (g)'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কারণ' : 'Reason'}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {adjustments.data && adjustments.data.length > 0 ? (
                                    adjustments.data.map(adj => (
                                        <tr key={adj.id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2.5 font-bold text-gray-900">
                                                <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-800">
                                                    {isBn ? toBn(adj.adjustment_no) : adj.adjustment_no}
                                                </code>
                                            </td>
                                            <td className="px-3 py-2.5 text-[11px] text-gray-600 font-medium whitespace-nowrap">
                                                {isBn ? toBn(adj.adjustment_date) : adj.adjustment_date}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="font-bold text-gray-900">{adj.product?.name || '—'}</div>
                                                <div className="text-[10px] text-gray-400">{adj.product?.sku}</div>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">{adj.branch?.name || '—'}</td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">{typeBadge(adj.quantity_change)}</td>
                                            <td className={`px-3 py-2.5 text-right font-bold whitespace-nowrap ${adj.quantity_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {adj.quantity_change >= 0 ? '+' : ''}{isBn ? toBn(adj.quantity_change) : adj.quantity_change} {isBn ? 'টি' : 'pcs'}
                                            </td>
                                            <td className={`px-3 py-2.5 text-right font-bold whitespace-nowrap ${adj.weight_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                <div>
                                                    {adj.weight_change >= 0 ? '+' : ''}{isBn ? toBn(fmt(adj.weight_change)) : fmt(adj.weight_change)} g
                                                </div>
                                                <span className="block text-[10px] font-normal text-gray-400">
                                                    {adj.weight_change >= 0 ? '+' : ''}{isBn ? toBn(toVori(adj.weight_change)) : toVori(adj.weight_change)} v
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500 max-w-xs truncate">{adj.reason || '—'}</td>
                                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {isBn ? 'অ্যাকশন' : 'Actions'}
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(adj.id);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>{isBn ? 'মুছে ফেলুন' : 'Delete'}</span>
                                                        </button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <SlidersHorizontal className="w-8 h-8 opacity-30" />
                                                <p className="text-xs font-semibold">{isBn ? 'কোন স্টক অ্যাডজাস্টমেন্ট পাওয়া যায়নি।' : 'No stock adjustments recorded yet.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {adjustments.links && (
                        <div className="mt-4">
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
                                    <h3 className="text-sm font-extrabold text-gray-800">
                                        {isBn ? 'নতুন স্টক অ্যাডজাস্টমেন্ট' : 'New Stock Adjustment'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">
                                        {isBn ? 'স্টক ইন বা স্টক আউট নির্বাচন করুন এবং তথ্য প্রদান করুন' : 'Select Stock In or Stock Out and fill in quantities'}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 overflow-y-auto flex-1">
                            <form id="adjustment-form" onSubmit={handleSubmit} className="space-y-4">

                                {/* Stock In / Stock Out Switcher */}
                                <div>
                                    <Lbl>{isBn ? 'অ্যাডজাস্টমেন্ট ধরন' : 'Adjustment Type'} <span className="text-rose-500">*</span></Lbl>
                                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/80">
                                        <button
                                            type="button"
                                            onClick={() => setData('type', 'in')}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                                data.type === 'in'
                                                    ? 'bg-emerald-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <ArrowDownRight className="w-4 h-4" /> {isBn ? 'স্টক ইন (যোগ)' : 'Stock In (Add)'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('type', 'out')}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                                data.type === 'out'
                                                    ? 'bg-rose-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <ArrowUpRight className="w-4 h-4" /> {isBn ? 'স্টক আউট (বাদ)' : 'Stock Out (Deduct)'}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>{isBn ? 'শাখা' : 'Branch'} <span className="text-rose-500">*</span></Lbl>
                                        <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-xs bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        {errors.branch_id && <p className="text-[11px] text-rose-500 mt-1">{errors.branch_id}</p>}
                                    </div>
                                    <div>
                                        <Lbl>{isBn ? 'তারিখ' : 'Adjustment Date'} <span className="text-rose-500">*</span></Lbl>
                                        <input type="date" value={data.adjustment_date} onChange={e => setData('adjustment_date', e.target.value)}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-xs bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" required />
                                        {errors.adjustment_date && <p className="text-[11px] text-rose-500 mt-1">{errors.adjustment_date}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Lbl>{isBn ? 'পণ্য' : 'Product'} <span className="text-rose-500">*</span></Lbl>
                                    <select value={data.product_id} onChange={e => setData('product_id', e.target.value)}
                                        className="w-full h-10 rounded-xl border border-gray-200 text-xs bg-gray-50 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                    </select>
                                    {errors.product_id && <p className="text-[11px] text-rose-500 mt-1">{errors.product_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Lbl>{isBn ? 'পরিমাণ (টি)' : 'Quantity (pcs)'} <span className="text-rose-500">*</span></Lbl>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.quantity}
                                            onFocus={handleNumberFocus}
                                            onChange={e => setData('quantity', cleanNumber(e.target.value))}
                                            className="w-full h-10 rounded-xl border border-gray-200 text-xs bg-gray-50 px-3 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                            required
                                            placeholder="0"
                                        />
                                        {errors.quantity_change && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity_change}</p>}
                                    </div>

                                    <div>
                                        <Lbl>{isBn ? 'ওজন / গ্রাম' : 'Weight / gm'} <span className="text-rose-500">*</span></Lbl>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="any"
                                                min="0.001"
                                                value={data.weight_gm}
                                                onFocus={handleNumberFocus}
                                                onChange={e => onGmChange(e.target.value)}
                                                placeholder="0"
                                                className="w-full h-10 rounded-xl border border-gray-200 text-xs bg-gray-50 px-3 pr-10 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">gm</span>
                                        </div>
                                        {errors.weight_change && <p className="text-[11px] text-rose-500 mt-1">{errors.weight_change}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Lbl>{isBn ? 'ওজন / ভরি' : 'Weight / Vori'}</Lbl>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={data.weight_vori}
                                            onFocus={handleNumberFocus}
                                            onChange={e => onVoriChange(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-10 rounded-xl border border-gray-200 text-xs bg-gray-50 px-3 pr-12 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">vori</span>
                                    </div>
                                </div>

                                <div>
                                    <Lbl>{isBn ? 'কারণ / মন্তব্য' : 'Reason / Remarks'} <span className="text-rose-500">*</span></Lbl>
                                    <textarea
                                        value={data.reason}
                                        onChange={e => setData('reason', e.target.value)}
                                        rows="3"
                                        required
                                        className="w-full rounded-xl border border-gray-200 text-xs bg-gray-50 p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        placeholder={isBn ? 'এই স্টক অ্যাডজাস্টমেন্টের কারণ...' : 'Reason for this stock adjustment...'}
                                    />
                                    {errors.reason && <p className="text-[11px] text-rose-500 mt-1">{errors.reason}</p>}
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 rounded-b-3xl bg-gray-50/60">
                            <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                                className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                                {isBn ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button type="submit" form="adjustment-form" disabled={processing}
                                style={data.type === 'in' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                                className={`px-6 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer ${data.type === 'out' ? 'bg-rose-600 hover:bg-rose-700' : ''}`}>
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving…') : data.type === 'in' ? (isBn ? 'স্টক ইন সংরক্ষণ করুন' : 'Save Stock In') : (isBn ? 'স্টক আউট সংরক্ষণ করুন' : 'Save Stock Out')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
