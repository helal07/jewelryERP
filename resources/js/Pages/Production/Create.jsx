import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Layers, 
    ArrowLeft, 
    Save, 
    Plus, 
    UserPlus, 
    PackagePlus, 
    Scale, 
    Calendar,
    DollarSign,
    Percent,
    Hammer,
    Sparkles
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Create({ branches = [], artisans = [], orders = [], categories = [], products = [], purities = [] }) {
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

    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches?.[0]?.id || '1',
        artisan_id: '',
        order_id: '',
        product_category_id: '',
        product_id: '',
        purity_id: '',
        metal_type: 'gold',
        stock_type: 'ready_stock',
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        start_date: new Date().toISOString().split('T')[0],
        expected_end_date: '',
        vori: '',
        ana: '',
        roti: '',
        point: '',
        weight_gm: '',
        artisan_charge: '',
        wastage_percentage: '',
        paid_amount: '0',
        due_amount: '0',
        status: 'pending',
        notes: '',
    });

    // Calculate Grams when Vori, Ana, Roti, or Point input changes
    const updateVoriWeight = (field, val) => {
        const cleaned = cleanNumber(val);
        const nextData = { ...data, [field]: cleaned };
        const v = parseFloat(nextData.vori) || 0;
        const a = parseFloat(nextData.ana) || 0;
        const r = parseFloat(nextData.roti) || 0;
        const p = parseFloat(nextData.point) || 0;

        let computedGm = nextData.weight_gm;
        if (v || a || r || p) {
            computedGm = ((v * 11.664) + (a * (11.664 / 16)) + (r * (11.664 / 96)) + (p * (11.664 / 960))).toFixed(3);
        }

        setData({
            ...nextData,
            weight_gm: computedGm,
        });
    };

    // Calculate Due Amount when Artisan Charge or Paid Amount changes
    const updateChargeOrPaid = (field, val) => {
        const cleaned = cleanNumber(val);
        const nextData = { ...data, [field]: cleaned };
        const charge = parseFloat(nextData.artisan_charge) || 0;
        const paid = parseFloat(nextData.paid_amount) || 0;
        const due = Math.max(0, charge - paid).toFixed(2);

        setData({
            ...nextData,
            due_amount: due,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('production.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Layers className="h-7 w-7" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'নতুন প্রোডাকশন জব কার্ড' : 'Add Production'}
                        </h2>
                    </div>

                    <Link
                        href={route('production.index')}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold shadow-2xs transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        {t('back') || 'Back'}
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'নতুন প্রোডাকশন' : 'Add Production'} />

            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* Unified Single Section Card */}
                    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-amber-200/60 shadow-sm space-y-6">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Layers className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                                {isBn ? '১. অর্ডারের প্রাথমিক তথ্য' : 'Production Details'}
                            </h3>
                        </div>

                        {/* Row 1: Dates & Stock Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {/* Order Date */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'অর্ডারের তারিখ *' : 'Order Date *'}</label>
                                <input
                                    type="date"
                                    required
                                    value={data.order_date}
                                    onChange={(e) => setData('order_date', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {errors.order_date && <p className="text-xs text-rose-500 mt-1">{errors.order_date}</p>}
                            </div>

                            {/* Delivery Date */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'ডেলিভারির তারিখ' : 'Delivery Date'}</label>
                                <input
                                    type="date"
                                    value={data.delivery_date}
                                    onChange={(e) => setData('delivery_date', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {errors.delivery_date && <p className="text-xs text-rose-500 mt-1">{errors.delivery_date}</p>}
                            </div>

                            {/* Stock Type */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'স্টকের ধরণ *' : 'Stock Type *'}</label>
                                <select
                                    value={data.stock_type}
                                    onChange={(e) => setData('stock_type', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="ready_stock">{isBn ? 'রেডিমেড স্টক (Ready Stock)' : 'Ready Stock'}</option>
                                    <option value="order_stock">{isBn ? 'কাস্টমার অর্ডার (Order Stock)' : 'Order Stock'}</option>
                                </select>
                                {errors.stock_type && <p className="text-xs text-rose-500 mt-1">{errors.stock_type}</p>}
                            </div>
                        </div>

                        {/* Row 2: Artisan, Product, Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {/* Artisan */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'কারিগর *' : 'Artisan *'}</label>
                                <select
                                    required
                                    value={data.artisan_id}
                                    onChange={(e) => setData('artisan_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">{isBn ? 'কারিগর নির্বাচন করুন' : 'Select Artisan'}</option>
                                    {artisans.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} ({isBn ? toBn(a.code) : a.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.artisan_id && <p className="text-xs text-rose-500 mt-1">{errors.artisan_id}</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'ক্যাটাগরি' : 'Category'}</label>
                                <select
                                    value={data.product_category_id}
                                    onChange={(e) => setData('product_category_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">{isBn ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select Category'}</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Product / Item */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'পণ্য / মডেল' : 'Product'}</label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">{isBn ? 'পণ্য নির্বাচন করুন' : 'Select Product'}</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Metal, Purity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'ধাতু' : 'Metal'}</label>
                                <select
                                    value={data.metal_type}
                                    onChange={(e) => setData('metal_type', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="gold">{isBn ? 'স্বর্ণ (Gold)' : 'Gold'}</option>
                                    <option value="silver">{isBn ? 'রূপা (Silver)' : 'Silver'}</option>
                                    <option value="platinum">{isBn ? 'প্লাটিনাম (Platinum)' : 'Platinum'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'ক্যারেট / বিশুদ্ধতা' : 'Purity'}</label>
                                <select
                                    value={data.purity_id}
                                    onChange={(e) => setData('purity_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">{isBn ? 'ক্যারেট নির্বাচন করুন' : 'Select Purity'}</option>
                                    {purities.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({isBn ? toBn(p.percentage) : p.percentage}%)</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Section: Metal Weight Calculation */}
                        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-4">
                            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Scale className="w-4 h-4" />
                                {isBn ? 'ইস্যুকৃত ধাতুর ওজন (ভরি-আনা-রতি-পয়েন্ট)' : 'Issued Metal Weight (Traditional)'}
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">{isBn ? 'ভরি' : 'Vori'}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        onFocus={handleNumberFocus}
                                        value={data.vori}
                                        onChange={(e) => updateVoriWeight('vori', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">{isBn ? 'আনা' : 'Ana'}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        onFocus={handleNumberFocus}
                                        value={data.ana}
                                        onChange={(e) => updateVoriWeight('ana', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">{isBn ? 'রতি' : 'Roti'}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        onFocus={handleNumberFocus}
                                        value={data.roti}
                                        onChange={(e) => updateVoriWeight('roti', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">{isBn ? 'পয়েন্ট' : 'Point'}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        onFocus={handleNumberFocus}
                                        value={data.point}
                                        onChange={(e) => updateVoriWeight('point', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[11px] font-bold text-amber-900 mb-1">{isBn ? 'মোট গ্রাম (gm)' : 'Total (gm)'}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        onFocus={handleNumberFocus}
                                        value={data.weight_gm}
                                        onChange={(e) => setData('weight_gm', cleanNumber(e.target.value))}
                                        className="w-full px-3 py-2 border border-amber-300 bg-white rounded-xl text-sm font-black text-amber-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Financials & Wastage */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'কারিগর মজুরি (৳)' : 'Artisan Charge (BDT)'}</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    onFocus={handleNumberFocus}
                                    value={data.artisan_charge}
                                    onChange={(e) => updateChargeOrPaid('artisan_charge', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'ওয়েস্টেজ (%)' : 'Wastage (%)'}</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    onFocus={handleNumberFocus}
                                    value={data.wastage_percentage}
                                    onChange={(e) => setData('wastage_percentage', cleanNumber(e.target.value))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'অগ্রিম পরিশোধ (৳)' : 'Paid Amount (BDT)'}</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    onFocus={handleNumberFocus}
                                    value={data.paid_amount}
                                    onChange={(e) => updateChargeOrPaid('paid_amount', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'অবশিষ্ট বকেয়া (৳)' : 'Due Amount (BDT)'}</label>
                                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-rose-600">
                                    {fmtMoney(data.due_amount)}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">{isBn ? 'কারিগরকে বিশেষ কাজের নির্দেশিকা' : 'Crafting Instructions / Notes'}</label>
                            <textarea
                                rows="3"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder={isBn ? 'যেমন: নকশা নিখুঁত হতে হবে, বিশেষ ফিনিশিং ইত্যাদি...' : 'Special notes for the goldsmith...'}
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Link
                                href={route('production.index')}
                                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                {t('cancel') || 'Cancel'}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-4 h-4" />
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'প্রোডাকশন সংরক্ষণ করুন' : 'Save Production Job')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
