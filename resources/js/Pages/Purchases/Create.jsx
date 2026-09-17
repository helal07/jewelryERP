import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import axios from 'axios';
import { 
    ShoppingBag, Plus, Trash2, Save, ArrowLeft, Building2, User, UserPlus,
    Calendar, FileText, Calculator, Layers, ShieldCheck, X, Camera, Image as ImageIcon,
    CheckCircle2, AlertCircle, Clock, CreditCard, Receipt, Tag, Award, Percent, Box, Sparkles, Scale
} from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const gramToVoriAnaRotiPoint = (grams, isBn, toBn) => {
    let g = parseFloat(grams || 0);
    if (g <= 0) return { 
        vori: 0, ana: 0, roti: 0, point: 0, 
        formatted: isBn ? '০ ভরি ০ আনা ০ রতি ০ পয়েন্ট' : '0 vori 0 ana 0 roti 0 pt' 
    };

    const vori = Math.floor(g / 11.664);
    let rem = g % 11.664;

    const ana = Math.floor(rem / 0.729);
    rem = rem % 0.729;

    const roti = Math.floor(rem / 0.1215);
    rem = rem % 0.1215;

    const point = Math.round(rem / 0.01215);

    return {
        vori,
        ana,
        roti,
        point,
        formatted: isBn 
            ? `${toBn(vori)} ভরি ${toBn(ana)} আনা ${toBn(roti)} রতি ${toBn(point)} পয়েন্ট` 
            : `${vori} vori ${ana} ana ${roti} roti ${point} pt`
    };
};

const voriAnaRotiPointToGram = (vori, ana, roti, point) => {
    const v = parseFloat(vori || 0);
    const a = parseFloat(ana || 0);
    const r = parseFloat(roti || 0);
    const p = parseFloat(point || 0);

    const totalGrams = (v * 11.664) + (a * 0.729) + (r * 0.1215) + (p * 0.01215);
    return totalGrams.toFixed(3);
};

export default function Create({ 
    suppliers = [], 
    products = [], 
    categories = [],
    purities = [], 
    branches = [], 
    metalPrices = [],
    autoInvoiceNo = '' 
}) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [supplierList, setSupplierList] = useState(suppliers);
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    
    // Quick Add Supplier Form State
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        company_name: '',
        phone: '',
        email: '',
        address: '',
        opening_balance: '0',
        credit_limit: '0',
        nid_number: '',
        status: 'active',
        photo: null,
        attachment: null,
    });
    const [supplierSubmitting, setSupplierSubmitting] = useState(false);
    const [supplierError, setSupplierError] = useState('');

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: supplierList.length > 0 ? supplierList[0].id : '',
        branch_id: branches.length > 0 ? branches[0].id : '',
        invoice_no: autoInvoiceNo,
        purchase_date: new Date().toISOString().split('T')[0],
        subtotal: 0,
        discount: 0,
        tax: 0,
        other_charges: 0,
        grand_total: 0,
        paid_amount: 0,
        due_amount: 0,
        payment_method: 'cash',
        notes: '',
        items: [
            {
                is_custom: false,
                product_id: products.length > 0 ? products[0].id : '',
                item_name: products.length > 0 ? products[0].name : '',
                stock_type: 'readymade',
                category_id: categories.length > 0 ? categories[0].id : '',
                metal_type: 'gold',
                purity_id: purities.length > 0 ? purities[0].id : '',
                hallmark_no: '',
                photo: null,
                weight_unit: 'traditional',
                vori: 0,
                ana: 0,
                roti: 0,
                point: 0,
                gross_weight: 0,
                stone_weight: 0,
                net_weight: 0,
                rate_mode: 'per_vori',
                rate_per_vori: 0,
                rate_per_gram: 0,
                making_charge: 0,
                stone_charge: 0,
                wastage_percentage: 0,
                quantity: 1,
                total_amount: 0,
            }
        ]
    });

    // Calculate row item total including wastage % & Rate per Vori / Gram
    const calculateItemTotal = (item) => {
        let gross = parseFloat(item.gross_weight || 0);
        
        if (item.weight_unit === 'traditional') {
            gross = parseFloat(voriAnaRotiPointToGram(item.vori, item.ana, item.roti, item.point));
        }

        const stone = parseFloat(item.stone_weight || 0);
        const net = Math.max(0, gross - stone);
        
        let ratePerGram = parseFloat(item.rate_per_gram || 0);
        if (item.rate_mode === 'per_vori') {
            const rateVori = parseFloat(item.rate_per_vori || 0);
            ratePerGram = rateVori / 11.664;
        }

        const making = parseFloat(item.making_charge || 0);
        const stoneChg = parseFloat(item.stone_charge || 0);
        const wastagePct = parseFloat(item.wastage_percentage || 0);
        const qty = Math.max(1, parseInt(item.quantity || 1));

        const totalNetWithWastage = net * (1 + (wastagePct / 100));
        const total = (totalNetWithWastage * ratePerGram + making + stoneChg) * qty;

        return { 
            gross_weight: gross.toFixed(3),
            net_weight: net.toFixed(3), 
            rate_per_gram: ratePerGram.toFixed(2),
            total_amount: total.toFixed(2) 
        };
    };

    // Update item field and recalculate subtotal/grand_total
    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;

        if (field === 'gross_weight' && newItems[index].weight_unit === 'gram') {
            const varp = gramToVoriAnaRotiPoint(value, false, toBn);
            newItems[index].vori = varp.vori;
            newItems[index].ana = varp.ana;
            newItems[index].roti = varp.roti;
            newItems[index].point = varp.point;
        }

        if (field === 'rate_per_vori' && newItems[index].rate_mode === 'per_vori') {
            newItems[index].rate_per_gram = (parseFloat(value || 0) / 11.664).toFixed(2);
        }

        if (field === 'rate_per_gram' && newItems[index].rate_mode === 'per_gram') {
            newItems[index].rate_per_vori = (parseFloat(value || 0) * 11.664).toFixed(2);
        }

        const calc = calculateItemTotal(newItems[index]);
        newItems[index].gross_weight = calc.gross_weight;
        newItems[index].net_weight = calc.net_weight;
        newItems[index].rate_per_gram = calc.rate_per_gram;
        newItems[index].total_amount = calc.total_amount;

        recalculateOverallTotals(newItems, data.discount, data.tax, data.other_charges, data.paid_amount);
    };

    // Handle Photo upload for purchase item
    const handleItemPhotoUpload = (index, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            updateItem(index, 'photo', reader.result);
        };
        reader.readAsDataURL(file);
    };

    const addItemRow = () => {
        const newItem = {
            is_custom: false,
            product_id: products.length > 0 ? products[0].id : '',
            item_name: products.length > 0 ? products[0].name : '',
            stock_type: 'readymade',
            category_id: categories.length > 0 ? categories[0].id : '',
            metal_type: 'gold',
            purity_id: purities.length > 0 ? purities[0].id : '',
            hallmark_no: '',
            photo: null,
            weight_unit: 'traditional',
            vori: 0,
            ana: 0,
            roti: 0,
            point: 0,
            gross_weight: 0,
            stone_weight: 0,
            net_weight: 0,
            rate_mode: 'per_vori',
            rate_per_vori: 0,
            rate_per_gram: 0,
            making_charge: 0,
            stone_charge: 0,
            wastage_percentage: 0,
            quantity: 1,
            total_amount: 0,
        };
        const updatedItems = [...data.items, newItem];
        recalculateOverallTotals(updatedItems, data.discount, data.tax, data.other_charges, data.paid_amount);
    };

    const removeItemRow = (index) => {
        if (data.items.length === 1) return;
        const updatedItems = data.items.filter((_, i) => i !== index);
        recalculateOverallTotals(updatedItems, data.discount, data.tax, data.other_charges, data.paid_amount);
    };

    const recalculateOverallTotals = (items, disc, taxVal, oth, paid) => {
        const sub = items.reduce((acc, item) => acc + parseFloat(item.total_amount || 0), 0);
        const discountVal = parseFloat(disc || 0);
        const taxAmount = parseFloat(taxVal || 0);
        const otherCharges = parseFloat(oth || 0);
        const grand = Math.max(0, sub - discountVal + taxAmount + otherCharges);
        const paidVal = parseFloat(paid || 0);
        const due = Math.max(0, grand - paidVal);

        setData(prev => ({
            ...prev,
            items,
            subtotal: sub.toFixed(2),
            grand_total: grand.toFixed(2),
            due_amount: due.toFixed(2),
        }));
    };

    const handleDiscountChange = (val) => {
        setData('discount', val);
        recalculateOverallTotals(data.items, val, data.tax, data.other_charges, data.paid_amount);
    };

    const handleTaxChange = (val) => {
        setData('tax', val);
        recalculateOverallTotals(data.items, data.discount, val, data.other_charges, data.paid_amount);
    };

    const handleOtherChargesChange = (val) => {
        setData('other_charges', val);
        recalculateOverallTotals(data.items, data.discount, data.tax, val, data.paid_amount);
    };

    const handlePaidAmountChange = (val) => {
        const paidVal = parseFloat(val || 0);
        const grandVal = parseFloat(data.grand_total || 0);
        const dueVal = Math.max(0, grandVal - paidVal);

        setData(prev => ({
            ...prev,
            paid_amount: val,
            due_amount: dueVal.toFixed(2),
        }));
    };

    const handleQuickAddSupplier = async (e) => {
        e.preventDefault();
        setSupplierSubmitting(true);
        setSupplierError('');

        try {
            const formData = new FormData();
            formData.append('name', newSupplier.name);
            formData.append('company_name', newSupplier.company_name || '');
            formData.append('phone', newSupplier.phone || '');
            formData.append('email', newSupplier.email || '');
            formData.append('address', newSupplier.address || '');
            formData.append('opening_balance', newSupplier.opening_balance || 0);
            formData.append('credit_limit', newSupplier.credit_limit || 0);
            formData.append('nid_number', newSupplier.nid_number || '');
            formData.append('status', newSupplier.status || 'active');
            if (newSupplier.photo) formData.append('photo', newSupplier.photo);
            if (newSupplier.attachment) formData.append('attachment', newSupplier.attachment);
            formData.append('branch_id', data.branch_id || '');

            const res = await axios.post(route('suppliers.store'), formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (res.data && res.data.supplier) {
                const created = res.data.supplier;
                setSupplierList(prev => [created, ...prev]);
                setData('supplier_id', created.id);
                setIsAddSupplierModalOpen(false);
                setNewSupplier({
                    name: '',
                    company_name: '',
                    phone: '',
                    email: '',
                    address: '',
                    opening_balance: '0',
                    credit_limit: '0',
                    nid_number: '',
                    status: 'active',
                    photo: null,
                    attachment: null,
                });
            }
        } catch (err) {
            console.error(err);
            setSupplierError(err.response?.data?.message || t('Failed to save supplier. Please check required fields.'));
        } finally {
            setSupplierSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('purchases.store'));
    };

    const grandVal = parseFloat(data.grand_total || 0);
    const paidVal = parseFloat(data.paid_amount || 0);
    const dueVal = parseFloat(data.due_amount || 0);
    const totalQty = data.items.reduce((acc, item) => acc + (parseInt(item.quantity || 0)), 0);

    const getPaymentBadge = () => {
        if (paidVal >= grandVal && grandVal > 0) {
            return { text: t('Full Paid'), bg: 'bg-emerald-500 text-white', icon: CheckCircle2 };
        } else if (paidVal > 0 && paidVal < grandVal) {
            return { text: t('Partial Payment'), bg: 'bg-amber-500 text-white', icon: Clock };
        } else {
            return { text: t('Unpaid / Due'), bg: 'bg-rose-500 text-white', icon: AlertCircle };
        }
    };

    const paymentBadge = getPaymentBadge();
    const BadgeIcon = paymentBadge.icon;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag className="w-7 h-7 text-[#b17633]" />
                            {t('Add Purchase')}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">{t('Record jewelry stock receipts, weight breakdown and payments')}</p>
                    </div>
                    <Link
                        href={route('purchases.index')}
                        className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> {t('Back to List')}
                    </Link>
                </div>
            }
        >
            <Head title={t('Add Purchase')} />

            <form onSubmit={handleSubmit} className="max-w-6xl space-y-6 pb-16">
                
                {/* ── UNIFIED MASTER FORM CONTAINER ── */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden space-y-6">

                    {/* TOP GRADIENT HEADER BAR */}
                    <div className="bg-gradient-to-r from-amber-600 via-[#b17633] to-orange-600 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-white">{t('Purchase Invoice')}</h3>
                                <p className="text-xs text-white/80">{t('Supplier Purchase & Metal Inward')}</p>
                            </div>
                        </div>

                        {/* Invoice Number Pill & Payment Status */}
                        <div className="flex items-center gap-3">
                            <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs ${paymentBadge.bg}`}>
                                <BadgeIcon className="w-4 h-4" />
                                {paymentBadge.text}
                            </span>

                            <div className="flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-2xl border border-white/30 backdrop-blur-md">
                                <span className="text-xs text-white/90 font-medium">{t('Invoice #')}:</span>
                                <span className="text-sm font-mono font-extrabold text-white">
                                    {isBn ? toBn(data.invoice_no) : data.invoice_no}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* HEADER INPUTS GRID */}
                    <div className="px-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                            {/* Supplier Select + Quick Add */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-[#b17633]" />
                                    {t('Supplier')} <span className="text-rose-500">*</span>
                                </label>

                                <div className="flex gap-2">
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="flex-1 h-11 rounded-xl border-gray-200 bg-white focus:border-[#b17633] focus:ring-2 focus:ring-[#b17633]/20 text-sm font-bold text-gray-900 px-3 shadow-xs"
                                        required
                                    >
                                        <option value="">— {t('Select Supplier')} —</option>
                                        {supplierList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} {s.company_name ? `(${s.company_name})` : ''}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddSupplierModalOpen(true)}
                                        className="h-11 px-3 bg-[#b17633]/10 text-[#b17633] hover:bg-[#b17633] hover:text-white rounded-xl font-bold transition-all flex items-center justify-center border border-[#b17633]/30 gap-1.5 text-xs shadow-xs cursor-pointer"
                                        title={t('Add Supplier')}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span className="hidden sm:inline">+{t('Add')}</span>
                                    </button>
                                </div>
                                {errors.supplier_id && <p className="text-xs text-rose-500 mt-1">{errors.supplier_id}</p>}
                            </div>

                            {/* Receiving Branch */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-[#b17633]" />
                                    {t('Branch')} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.branch_id}
                                    onChange={(e) => setData('branch_id', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-white focus:border-[#b17633] focus:ring-2 focus:ring-[#b17633]/20 text-sm font-semibold text-gray-800 px-3 shadow-xs"
                                    required
                                >
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                {errors.branch_id && <p className="text-xs text-rose-500 mt-1">{errors.branch_id}</p>}
                            </div>

                            {/* Purchase Date */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#b17633]" />
                                    {t('Purchase Date')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) => setData('purchase_date', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-white focus:border-[#b17633] focus:ring-2 focus:ring-[#b17633]/20 text-sm font-semibold text-gray-800 px-3 shadow-xs"
                                    required
                                />
                                {errors.purchase_date && <p className="text-xs text-rose-500 mt-1">{errors.purchase_date}</p>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: MODULAR ITEM CARDS WITH VORI / ANA / ROTI / POINT CALCULATOR */}
                    <div className="px-6 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-3">
                            <div className="flex items-center gap-2">
                                <Scale className="w-5 h-5 text-[#b17633]" />
                                <h4 className="font-bold text-gray-800 text-sm">{t('Purchase Items')}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-200/80">
                                    {t('Total Items')}: {isBn ? toBn(data.items.length) : data.items.length} | {t('Total Qty')}: {isBn ? toBn(totalQty) : totalQty}
                                </span>
                                <button
                                    type="button"
                                    onClick={addItemRow}
                                    style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                    className="hover:opacity-90 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> {t('Add Item Card')}
                                </button>
                            </div>
                        </div>

                        {/* RENDER EACH PURCHASE ITEM CARD */}
                        <div className="space-y-4">
                            {data.items.map((item, index) => {
                                const varp = gramToVoriAnaRotiPoint(item.gross_weight, isBn, toBn);
                                return (
                                    <div key={index} className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 rounded-2xl p-4 border border-amber-200/60 shadow-xs relative space-y-4 hover:border-amber-400/80 transition-all">
                                        
                                        {/* Card Header Tag & Remove Action */}
                                        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-[#b17633] text-white flex items-center justify-center text-xs font-extrabold">
                                                    {isBn ? toBn(index + 1) : index + 1}
                                                </span>
                                                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                                                    {t('Item')} #{isBn ? toBn(index + 1) : index + 1}
                                                </span>
                                                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                                                    ⚖️ {varp.formatted} ({isBn ? toBn(item.gross_weight || '0') : (item.gross_weight || '0')} g)
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(index)}
                                                className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl transition-colors flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                                                disabled={data.items.length === 1}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> {t('Remove Card')}
                                            </button>
                                        </div>

                                        {/* SUB-ROW 1: STOCK TYPE, PRODUCT/CUSTOM NAME, CATEGORY, METAL, HALLMARK, PHOTO */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                                            
                                            {/* Stock Type */}
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t('Stock Type')}</label>
                                                <select
                                                    value={item.stock_type}
                                                    onChange={(e) => updateItem(index, 'stock_type', e.target.value)}
                                                    className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800"
                                                >
                                                    <option value="readymade">📦 {t('Ready Stock')}</option>
                                                    <option value="custom">🛠️ {t('Custom Order')}</option>
                                                    <option value="raw_gold">🪙 {t('Raw Gold / Metal')}</option>
                                                    <option value="scrap">♻️ {t('Scrap / Old Gold')}</option>
                                                </select>
                                            </div>

                                            {/* Item Source & Name Selection */}
                                            <div className="md:col-span-2 space-y-1">
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-600">
                                                    <span>{t('Item Type')}:</span>
                                                    <label className="flex items-center gap-1 cursor-pointer text-[#b17633]">
                                                        <input
                                                            type="radio"
                                                            name={`item_mode_${index}`}
                                                            checked={!item.is_custom}
                                                            onChange={() => updateItem(index, 'is_custom', false)}
                                                            className="text-[#b17633] focus:ring-[#b17633]"
                                                        /> {t('Existing Product')}
                                                    </label>
                                                    <label className="flex items-center gap-1 cursor-pointer text-orange-700">
                                                        <input
                                                            type="radio"
                                                            name={`item_mode_${index}`}
                                                            checked={item.is_custom}
                                                            onChange={() => updateItem(index, 'is_custom', true)}
                                                            className="text-[#b17633] focus:ring-[#b17633]"
                                                        /> {t('Custom Item / Metal')}
                                                    </label>
                                                </div>

                                                {!item.is_custom ? (
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => {
                                                            const pid = e.target.value;
                                                            const found = products.find(p => p.id === parseInt(pid));
                                                            updateItem(index, 'product_id', pid);
                                                            if (found) {
                                                                updateItem(index, 'item_name', found.name);
                                                                updateItem(index, 'metal_type', found.metal_type || 'gold');
                                                                updateItem(index, 'purity_id', found.purity_id || item.purity_id);
                                                            }
                                                        }}
                                                        className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-semibold text-gray-800"
                                                    >
                                                        <option value="">{t('Select Existing Product')}</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} ({p.sku || p.barcode || ''})</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={item.item_name}
                                                        onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                                        placeholder={t('Type custom metal or item name...')}
                                                        className="w-full h-9 rounded-xl border-amber-300 bg-white text-xs font-bold text-amber-900"
                                                    />
                                                )}
                                            </div>

                                            {/* Metal & Purity */}
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t('Metal & Purity')}</label>
                                                <div className="grid grid-cols-2 gap-1">
                                                    <select
                                                        value={item.metal_type}
                                                        onChange={(e) => updateItem(index, 'metal_type', e.target.value)}
                                                        className="h-9 rounded-xl border-gray-200 bg-white text-[11px] font-bold uppercase text-amber-900 px-1"
                                                    >
                                                        <option value="gold">{t('Gold')}</option>
                                                        <option value="silver">{t('Silver')}</option>
                                                        <option value="platinum">{t('Platinum')}</option>
                                                        <option value="diamond">{t('Diamond')}</option>
                                                    </select>

                                                    <select
                                                        value={item.purity_id}
                                                        onChange={(e) => updateItem(index, 'purity_id', e.target.value)}
                                                        className="h-9 rounded-xl border-gray-200 bg-white text-[11px] font-semibold text-gray-800 px-1"
                                                    >
                                                        {purities.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Category */}
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t('Category')}</label>
                                                <select
                                                    value={item.category_id}
                                                    onChange={(e) => updateItem(index, 'category_id', e.target.value)}
                                                    className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-semibold text-gray-800"
                                                >
                                                    <option value="">{t('Select Category')}</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Hallmark / Cert & Photo */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">{t('Hallmark / Cert')}</label>
                                                    <input
                                                        type="text"
                                                        value={item.hallmark_no || ''}
                                                        onChange={(e) => updateItem(index, 'hallmark_no', e.target.value)}
                                                        placeholder="HM / Cert #"
                                                        className="w-full h-9 rounded-xl border-gray-200 bg-white text-[11px] font-mono"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 text-center">{t('Photo')}</label>
                                                    <label className="relative cursor-pointer inline-block">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleItemPhotoUpload(index, e.target.files[0])}
                                                            className="hidden"
                                                        />
                                                        {item.photo ? (
                                                            <img
                                                                src={item.photo}
                                                                alt="preview"
                                                                className="w-9 h-9 object-cover rounded-xl border border-amber-300 shadow-xs"
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-xl bg-white hover:bg-amber-100 text-gray-400 hover:text-amber-700 flex items-center justify-center border border-dashed border-gray-300 transition-colors shadow-xs">
                                                                <Camera className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                        </div>

                                        {/* SUB-ROW 2: TRADITIONAL VORI - ANA - ROTI - POINT WEIGHT & RATE CALCULATOR GRID */}
                                        <div className="bg-white p-3 rounded-2xl border border-gray-100 space-y-3">
                                            
                                            {/* Weight Mode & Rate Mode Selection Header */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b pb-2">
                                                {/* Weight Mode Selector */}
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-500 uppercase text-[10px]">{t('Weight Input Mode')}:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItem(index, 'weight_unit', 'traditional')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${item.weight_unit === 'traditional' ? 'text-white shadow-xs' : 'bg-gray-100 text-gray-600'}`}
                                                        style={item.weight_unit === 'traditional' ? { backgroundColor: 'rgb(177, 118, 51)' } : {}}
                                                    >
                                                        {t('Traditional (Vori-Ana-Roti-Point)')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItem(index, 'weight_unit', 'gram')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${item.weight_unit === 'gram' ? 'text-white shadow-xs' : 'bg-gray-100 text-gray-600'}`}
                                                        style={item.weight_unit === 'gram' ? { backgroundColor: 'rgb(177, 118, 51)' } : {}}
                                                    >
                                                        {t('Gram (g)')}
                                                    </button>
                                                </div>

                                                {/* Rate Mode Selector */}
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-500 uppercase text-[10px]">{t('Rate Mode')}:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItem(index, 'rate_mode', 'per_vori')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${item.rate_mode === 'per_vori' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'}`}
                                                    >
                                                        {t('Rate Per Vori (BDT)')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItem(index, 'rate_mode', 'per_gram')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${item.rate_mode === 'per_gram' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600'}`}
                                                    >
                                                        {t('Rate Per Gram (BDT)')}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* TRADITIONAL WEIGHT & RATE INPUT FIELDS */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-9 gap-2.5 items-end">
                                                
                                                {/* VORI - ANA - ROTI - POINT INPUTS */}
                                                {item.weight_unit === 'traditional' ? (
                                                    <>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">{t('Vori')}</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                min="0"
                                                                value={item.vori}
                                                                onFocus={handleNumberFocus}
                                                                onChange={(e) => updateItem(index, 'vori', e.target.value)}
                                                                placeholder="0"
                                                                className="w-full h-9 text-xs font-bold text-center rounded-lg border-amber-300 bg-amber-50/50"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">{t('Ana')}</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                min="0"
                                                                max="15"
                                                                value={item.ana}
                                                                onFocus={handleNumberFocus}
                                                                onChange={(e) => updateItem(index, 'ana', e.target.value)}
                                                                placeholder="0"
                                                                className="w-full h-9 text-xs font-bold text-center rounded-lg border-amber-300 bg-amber-50/50"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">{t('Roti')}</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                min="0"
                                                                max="5"
                                                                value={item.roti}
                                                                onFocus={handleNumberFocus}
                                                                onChange={(e) => updateItem(index, 'roti', e.target.value)}
                                                                placeholder="0"
                                                                className="w-full h-9 text-xs font-bold text-center rounded-lg border-amber-300 bg-amber-50/50"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">{t('Point')}</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                min="0"
                                                                max="9"
                                                                value={item.point}
                                                                onFocus={handleNumberFocus}
                                                                onChange={(e) => updateItem(index, 'point', e.target.value)}
                                                                placeholder="0"
                                                                className="w-full h-9 text-xs font-bold text-center rounded-lg border-amber-300 bg-amber-50/50"
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="col-span-4">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{t('Gross Weight (Gram)')}</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            value={item.gross_weight}
                                                            onFocus={handleNumberFocus}
                                                            onChange={(e) => updateItem(index, 'gross_weight', e.target.value)}
                                                            placeholder="0"
                                                            className="w-full h-9 text-xs font-mono font-bold text-right rounded-lg border-gray-200"
                                                        />
                                                    </div>
                                                )}

                                                {/* Calculated Grams Badge */}
                                                <div>
                                                    <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">{t('Calculated Grams')}</label>
                                                    <div className="h-9 px-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-end font-mono font-extrabold text-amber-900 text-xs">
                                                        {isBn ? toBn(item.gross_weight || '0') : (item.gross_weight || '0')} g
                                                    </div>
                                                </div>

                                                {/* Rate Input based on Rate Mode */}
                                                {item.rate_mode === 'per_vori' ? (
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">{t('Rate/Vori')}</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            value={item.rate_per_vori}
                                                            onFocus={handleNumberFocus}
                                                            onChange={(e) => updateItem(index, 'rate_per_vori', e.target.value)}
                                                            placeholder="0"
                                                            className="w-full h-9 text-xs font-mono font-bold text-right rounded-lg border-amber-300 bg-amber-50/50"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">{t('Rate/Gram')}</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            value={item.rate_per_gram}
                                                            onFocus={handleNumberFocus}
                                                            onChange={(e) => updateItem(index, 'rate_per_gram', e.target.value)}
                                                            placeholder="0"
                                                            className="w-full h-9 text-xs font-mono font-bold text-right rounded-lg border-amber-300 bg-amber-50/50"
                                                        />
                                                    </div>
                                                )}

                                                {/* Wastage (%) */}
                                                <div>
                                                    <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">{t('Wastage %')}</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        value={item.wastage_percentage || 0}
                                                        onFocus={handleNumberFocus}
                                                        onChange={(e) => updateItem(index, 'wastage_percentage', e.target.value)}
                                                        placeholder="0"
                                                        className="w-full h-9 text-xs font-mono font-bold text-right rounded-lg border-amber-200 bg-amber-50/60 text-amber-900"
                                                    />
                                                </div>

                                                {/* Quantity Input */}
                                                <div>
                                                    <label className="block text-[10px] font-extrabold text-amber-900 uppercase mb-1 text-center">{t('Quantity')} *</label>
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        min="1"
                                                        value={item.quantity}
                                                        onFocus={handleNumberFocus}
                                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                        className="w-full h-9 text-xs font-extrabold text-center rounded-lg border-amber-300 bg-amber-50/80 text-amber-900"
                                                        required
                                                    />
                                                </div>

                                                {/* Item Total Amount */}
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 text-right">{t('Total')}</label>
                                                    <div className="h-9 px-2 bg-gray-900 text-white rounded-lg flex items-center justify-end font-extrabold text-xs whitespace-nowrap">
                                                        {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(item.total_amount)) : fmtBDT(item.total_amount)}
                                                    </div>
                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 3: BOTTOM INLINE REMARKS & PAYMENT BREAKDOWN */}
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Left Remarks (4 cols) */}
                            <div className="lg:col-span-4 space-y-3">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-[#b17633]" />
                                    {t('Purchase Notes / Remarks')}
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="w-full rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#b17633] focus:ring-2 focus:ring-[#b17633]/20 text-xs p-3.5 placeholder:text-gray-400"
                                    rows="4"
                                    placeholder={t('Add supplier terms, purity verification numbers, or notes...')}
                                ></textarea>
                            </div>

                            {/* Right Charges, Paid Amount & Grand Total (8 cols) */}
                            <div className="lg:col-span-8 space-y-4">
                                
                                {/* Charges & Discounts Inline Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                    <div>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase">{t('Subtotal')}</span>
                                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                                            {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(data.subtotal)) : fmtBDT(data.subtotal)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">{t('Discount')} ({isBn ? '৳' : 'BDT'})</label>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={data.discount}
                                            onFocus={handleNumberFocus}
                                            onChange={(e) => handleDiscountChange(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-8 text-xs font-bold text-right rounded-lg border-gray-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">{t('Tax / VAT')} ({isBn ? '৳' : 'BDT'})</label>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={data.tax}
                                            onFocus={handleNumberFocus}
                                            onChange={(e) => handleTaxChange(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-8 text-xs font-bold text-right rounded-lg border-gray-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">{t('Other Charges')} ({isBn ? '৳' : 'BDT'})</label>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={data.other_charges}
                                            onFocus={handleNumberFocus}
                                            onChange={(e) => handleOtherChargesChange(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-8 text-xs font-bold text-right rounded-lg border-gray-200"
                                        />
                                    </div>
                                </div>

                                {/* Payment Method & Writable Paid Amount Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/60">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            {t('Payment Method')}
                                        </label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="w-full h-11 rounded-xl border-gray-200 bg-white font-bold text-xs text-gray-800 px-3 shadow-xs"
                                        >
                                            <option value="cash">💵 {t('Cash')}</option>
                                            <option value="bank">🏦 {t('Bank Transfer')}</option>
                                            <option value="cheque">📜 {t('Cheque')}</option>
                                            <option value="mobile_banking">📱 {t('Mobile Banking')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                            {t('Paid Amount')} ({isBn ? '৳' : 'BDT'}) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-extrabold text-xs select-none">{isBn ? '৳' : 'BDT'}</span>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={data.paid_amount}
                                                onFocus={handleNumberFocus}
                                                onChange={(e) => handlePaidAmountChange(e.target.value)}
                                                className="w-full h-11 pl-12 pr-3 rounded-xl border-2 border-emerald-400 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-extrabold text-emerald-900 shadow-xs"
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Final Totals & Submit */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                    <div className="bg-gradient-to-br from-amber-600 to-[#b17633] text-white p-3.5 rounded-2xl shadow-xs">
                                        <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider">{t('Grand Total')}</span>
                                        <h4 className="text-xl font-extrabold text-white mt-0.5">
                                            {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(data.grand_total)) : fmtBDT(data.grand_total)}
                                        </h4>
                                    </div>

                                    <div className={`p-3.5 rounded-2xl border shadow-xs ${dueVal > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">{t('Due Amount')}</span>
                                        <h4 className="text-xl font-extrabold mt-0.5">
                                            {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(data.due_amount)) : fmtBDT(data.due_amount)}
                                        </h4>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                            className="w-full h-full min-h-[64px] hover:opacity-90 text-white rounded-2xl font-extrabold text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                                        >
                                            <Save className="w-4 h-4" />
                                            {t('Save Invoice')}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </form>

            {/* ── QUICK ADD SUPPLIER MODAL (REACT DOM PORTAL) ── */}
            {isAddSupplierModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-amber-500/20 text-left my-8">
                            
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-amber-600 via-[#b17633] to-orange-600 px-6 py-4 flex items-center justify-between text-white shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                                        <UserPlus className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight text-white">{t('Add Supplier')}</h3>
                                        <p className="text-xs text-white/80">{t('Complete supplier profile without leaving purchase invoice')}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddSupplierModalOpen(false)}
                                    className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleQuickAddSupplier} className="p-6 space-y-6">
                                {supplierError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                                        {supplierError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Column 1 */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                {t('Supplier Name')} <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newSupplier.name}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                                className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                placeholder={t('e.g. Al-Razi Gold Bullion')}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                {t('Company Name')}
                                            </label>
                                            <input
                                                type="text"
                                                value={newSupplier.company_name}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, company_name: e.target.value })}
                                                className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                placeholder={t('e.g. Al-Razi Traders Ltd')}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('Phone')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newSupplier.phone}
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                                    className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                    placeholder="01700000000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('Email')}
                                                </label>
                                                <input
                                                    type="email"
                                                    value={newSupplier.email}
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                                    className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                    placeholder="supplier@company.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                {t('Address')}
                                            </label>
                                            <input
                                                type="text"
                                                value={newSupplier.address}
                                                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                                className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-medium text-gray-900 focus:border-[#b17633]"
                                                placeholder={t('Store address...')}
                                            />
                                        </div>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('Opening Balance')}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={newSupplier.opening_balance}
                                                    onFocus={handleNumberFocus}
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, opening_balance: e.target.value })}
                                                    className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('Credit Limit')}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={newSupplier.credit_limit}
                                                    onFocus={handleNumberFocus}
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, credit_limit: e.target.value })}
                                                    className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('NID / Passport')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newSupplier.nid_number}
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, nid_number: e.target.value })}
                                                    className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                    placeholder="Document No"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('Status')}
                                                </label>
                                                <select
                                                    value={newSupplier.status}
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, status: e.target.value })}
                                                    className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#b17633]"
                                                >
                                                    <option value="active">{t('Active')}</option>
                                                    <option value="inactive">{t('Inactive')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('Photo')}
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, photo: e.target.files[0] })}
                                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#b17633]/10 file:text-[#b17633] hover:file:bg-[#b17633]/20 transition-all cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                    {t('Attachment Doc')}
                                                </label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => setNewSupplier({ ...newSupplier, attachment: e.target.files[0] })}
                                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="pt-4 mt-2 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddSupplierModalOpen(false)}
                                        className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={supplierSubmitting}
                                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                        className="px-6 py-2.5 hover:opacity-90 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                                    >
                                        <UserPlus className="w-4 h-4" /> {t('Save & Select Supplier')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </AuthenticatedLayout>
    );
}
