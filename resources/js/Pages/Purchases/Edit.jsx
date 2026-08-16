import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    ShoppingBag, Plus, Trash2, Save, ArrowLeft, Building2, User,
    Calendar, FileText, Scale, CreditCard
} from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const voriAnaRotiPointToGram = (vori, ana, roti, point) => {
    const v = parseFloat(vori || 0);
    const a = parseFloat(ana || 0);
    const r = parseFloat(roti || 0);
    const p = parseFloat(point || 0);

    const totalGrams = (v * 11.664) + (a * 0.729) + (r * 0.1215) + (p * 0.01215);
    return totalGrams.toFixed(3);
};

export default function Edit({ 
    purchase,
    suppliers = [], 
    products = [], 
    categories = [],
    purities = [], 
    branches = [], 
    metalPrices = []
}) {
    const initialItems = purchase.items && purchase.items.length > 0 
        ? purchase.items.map(item => ({
            id: item.id,
            is_custom: !item.product_id,
            product_id: item.product_id || '',
            item_name: item.item_name || (item.product?.name ?? 'Item'),
            stock_type: item.stock_type || 'readymade',
            category_id: item.category_id || '',
            metal_type: item.metal_type || 'gold',
            purity_id: item.purity_id || (purities[0]?.id ?? ''),
            hallmark_no: item.hallmark_no || '',
            weight_unit: 'gram',
            gross_weight: parseFloat(item.gross_weight || 0),
            stone_weight: parseFloat(item.stone_weight || 0),
            net_weight: parseFloat(item.net_weight || item.gross_weight || 0),
            rate_mode: 'per_gram',
            rate_per_gram: parseFloat(item.rate_per_gram || 0),
            rate_per_vori: (parseFloat(item.rate_per_gram || 0) * 11.664).toFixed(2),
            making_charge: parseFloat(item.making_charge || 0),
            stone_charge: parseFloat(item.stone_charge || 0),
            wastage_percentage: parseFloat(item.wastage_percentage || 0),
            quantity: parseInt(item.quantity || 1),
            total_amount: parseFloat(item.total_amount || 0),
        }))
        : [];

    const { data, setData, put, processing, errors } = useForm({
        supplier_id: purchase.supplier_id || '',
        branch_id: purchase.branch_id || (branches[0]?.id ?? ''),
        invoice_no: purchase.invoice_no || '',
        purchase_date: purchase.purchase_date ? purchase.purchase_date.split('T')[0] : '',
        subtotal: parseFloat(purchase.subtotal || 0),
        discount: parseFloat(purchase.discount || 0),
        tax: parseFloat(purchase.tax || 0),
        other_charges: parseFloat(purchase.other_charges || 0),
        grand_total: parseFloat(purchase.grand_total || 0),
        paid_amount: parseFloat(purchase.paid_amount || 0),
        due_amount: parseFloat(purchase.due_amount || 0),
        payment_method: purchase.payment_method || 'cash',
        notes: purchase.notes || '',
        items: initialItems,
    });

    const calculateItemTotal = (item) => {
        const gross = parseFloat(item.gross_weight || 0);
        const stone = parseFloat(item.stone_weight || 0);
        const net = Math.max(0, gross - stone);
        
        let ratePerGram = parseFloat(item.rate_per_gram || 0);
        if (item.rate_mode === 'per_vori') {
            const rateVori = parseFloat(item.rate_per_vori || 0);
            ratePerGram = rateVori / 11.664;
        }

        const wastagePct = parseFloat(item.wastage_percentage || 0);
        const effectiveWeight = net * (1 + wastagePct / 100);
        const metalCost = effectiveWeight * ratePerGram;
        const making = parseFloat(item.making_charge || 0);
        const stoneCost = parseFloat(item.stone_charge || 0);
        const qty = parseInt(item.quantity || 1);

        const singleItemPrice = metalCost + making + stoneCost;
        return (singleItemPrice * qty).toFixed(2);
    };

    const updateItem = (index, field, value) => {
        const updated = [...data.items];
        const currentItem = { ...updated[index], [field]: value };

        if (field === 'gross_weight' || field === 'stone_weight') {
            const g = parseFloat(field === 'gross_weight' ? value : currentItem.gross_weight) || 0;
            const s = parseFloat(field === 'stone_weight' ? value : currentItem.stone_weight) || 0;
            currentItem.net_weight = Math.max(0, g - s).toFixed(3);
        }

        if (field === 'rate_per_vori') {
            const vRate = parseFloat(value || 0);
            currentItem.rate_per_gram = (vRate / 11.664).toFixed(2);
        } else if (field === 'rate_per_gram') {
            const gRate = parseFloat(value || 0);
            currentItem.rate_per_vori = (gRate * 11.664).toFixed(2);
        }

        currentItem.total_amount = calculateItemTotal(currentItem);
        updated[index] = currentItem;

        recalculateTotals(updated, data.discount, data.tax, data.other_charges, data.paid_amount);
    };

    const recalculateTotals = (itemsList, disc, tx, ochg, paid) => {
        const sub = itemsList.reduce((acc, it) => acc + parseFloat(it.total_amount || 0), 0);
        const d = parseFloat(disc || 0);
        const t = parseFloat(tx || 0);
        const o = parseFloat(ochg || 0);
        const grand = Math.max(0, sub - d + t + o);
        const p = parseFloat(paid || 0);
        const due = Math.max(0, grand - p);

        setData(prev => ({
            ...prev,
            items: itemsList,
            subtotal: sub.toFixed(2),
            grand_total: grand.toFixed(2),
            due_amount: due.toFixed(2),
        }));
    };

    const addItemRow = () => {
        const newItem = {
            is_custom: true,
            product_id: '',
            item_name: 'Gold Item',
            stock_type: 'readymade',
            category_id: categories[0]?.id || '',
            metal_type: 'gold',
            purity_id: purities[0]?.id || '',
            hallmark_no: '',
            weight_unit: 'gram',
            gross_weight: 11.664,
            stone_weight: 0,
            net_weight: 11.664,
            rate_mode: 'per_gram',
            rate_per_gram: 10000,
            rate_per_vori: 116640,
            making_charge: 0,
            stone_charge: 0,
            wastage_percentage: 0,
            quantity: 1,
            total_amount: 116640,
        };

        const updated = [...data.items, newItem];
        recalculateTotals(updated, data.discount, data.tax, data.other_charges, data.paid_amount);
    };

    const removeItemRow = (index) => {
        if (data.items.length === 1) return;
        const updated = data.items.filter((_, i) => i !== index);
        recalculateTotals(updated, data.discount, data.tax, data.other_charges, data.paid_amount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('purchases.update', purchase.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Purchase #${purchase.invoice_no}`} />

            <div className="py-6 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <Link
                                href={route('purchases.index')}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Edit Purchase Invoice #{purchase.invoice_no}</h1>
                                <p className="text-xs text-gray-500 mt-0.5">Modify purchase details, items and financial settlement</p>
                            </div>
                        </div>

                        <Link
                            href={route('purchases.index')}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Back to Purchases
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* SECTION 1: SUPPLIER & INVOICE DETAILS */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier *</label>
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white"
                                        required
                                    >
                                        <option value="">— Select Supplier —</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} {s.company_name ? `(${s.company_name})` : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch *</label>
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => setData('branch_id', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white"
                                        required
                                    >
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Invoice No</label>
                                    <input
                                        type="text"
                                        value={data.invoice_no}
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purchase Date *</label>
                                    <input
                                        type="date"
                                        value={data.purchase_date}
                                        onChange={(e) => setData('purchase_date', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: ITEMS LIST */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-amber-600" />
                                    Purchase Items ({data.items.length})
                                </h2>
                                <button
                                    type="button"
                                    onClick={addItemRow}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                >
                                    <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-amber-900">Item #{index + 1}</span>
                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItemRow(index)}
                                                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Product Name</label>
                                                <input
                                                    type="text"
                                                    value={item.item_name}
                                                    onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Metal</label>
                                                <select
                                                    value={item.metal_type}
                                                    onChange={(e) => updateItem(index, 'metal_type', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                                >
                                                    <option value="gold">Gold</option>
                                                    <option value="silver">Silver</option>
                                                    <option value="platinum">Platinum</option>
                                                    <option value="diamond">Diamond</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Purity</label>
                                                <select
                                                    value={item.purity_id}
                                                    onChange={(e) => updateItem(index, 'purity_id', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                                >
                                                    {purities.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Gross Wt (g)</label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={item.gross_weight}
                                                    onChange={(e) => updateItem(index, 'gross_weight', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Net Wt (g)</label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={item.net_weight}
                                                    onChange={(e) => updateItem(index, 'net_weight', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Rate / Gram (৳)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.rate_per_gram}
                                                    onChange={(e) => updateItem(index, 'rate_per_gram', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-right"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Making Charge (৳)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.making_charge}
                                                    onChange={(e) => updateItem(index, 'making_charge', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-right"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Qty (Pcs)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-center"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 text-right">Item Total</label>
                                                <div className="h-8 px-3 bg-gray-900 text-white rounded-lg flex items-center justify-end font-bold text-xs">
                                                    ৳ {fmtBDT(item.total_amount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 3: TOTALS & SAVE */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-6 space-y-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase">Notes / Remarks</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows="3"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:bg-white"
                                        placeholder="Purchase notes..."
                                    />
                                </div>

                                <div className="lg:col-span-6 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</span>
                                            <p className="text-xs font-bold text-gray-900">৳ {fmtBDT(data.subtotal)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Discount</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.discount}
                                                onChange={(e) => setData('discount', e.target.value)}
                                                className="w-full h-7 text-xs font-bold text-right rounded border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Tax</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.tax}
                                                onChange={(e) => setData('tax', e.target.value)}
                                                className="w-full h-7 text-xs font-bold text-right rounded border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Grand Total</label>
                                            <p className="text-xs font-extrabold text-amber-900">৳ {fmtBDT(data.grand_total)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <Link
                                            href={route('purchases.index')}
                                            className="px-6 py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </Link>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-8 py-2.5 rounded-xl font-bold text-xs text-white shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                                        >
                                            <Save className="w-4 h-4" />
                                            {processing ? 'Saving...' : 'Update Purchase'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
