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
    Percent
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Create({ branches, artisans, orders, categories, products, purities }) {
    const { t } = useLanguage();

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
        const nextData = { ...data, [field]: val };
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
        const nextData = { ...data, [field]: val };
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
                            {t('addProduction') || 'Add Production'}
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
            <Head title="Add Production" />

            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* Unified Single Section Card */}
                    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-amber-200/60 shadow-sm space-y-6">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Layers className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                                Production Details
                            </h3>
                        </div>

                        {/* Row 1: Dates & Stock Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {/* Order Date */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Order Date *</label>
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
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Delivery Date</label>
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
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Stock Type *</label>
                                <select
                                    value={data.stock_type}
                                    onChange={(e) => setData('stock_type', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="ready_stock">Ready Stock</option>
                                    <option value="order_stock">Order Stock</option>
                                </select>
                                {errors.stock_type && <p className="text-xs text-rose-500 mt-1">{errors.stock_type}</p>}
                            </div>
                        </div>

                        {/* Row 2: Artisan, Product, Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {/* Artisan (with Add Icon) */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold uppercase text-gray-700">Artisan *</label>
                                    <Link 
                                        href={route('artisans.index')} 
                                        target="_blank"
                                        className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 transition"
                                        title="Add New Artisan"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-0.5" /> Add New
                                    </Link>
                                </div>
                                <div className="relative flex items-center">
                                    <select
                                        required
                                        value={data.artisan_id}
                                        onChange={(e) => setData('artisan_id', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10"
                                    >
                                        <option value="">Select Artisan / Goldsmith</option>
                                        {artisans.map((art) => (
                                            <option key={art.id} value={art.id}>
                                                {art.name} ({art.specialization || art.code})
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={route('artisans.index')}
                                        target="_blank"
                                        className="absolute right-2 p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </Link>
                                </div>
                                {errors.artisan_id && <p className="text-xs text-rose-500 mt-1">{errors.artisan_id}</p>}
                            </div>

                            {/* Product (with Add Icon) */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold uppercase text-gray-700">Product</label>
                                    <Link 
                                        href={route('products.create')} 
                                        target="_blank"
                                        className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 transition"
                                        title="Add New Product"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-0.5" /> Add New
                                    </Link>
                                </div>
                                <div className="relative flex items-center">
                                    <select
                                        value={data.product_id}
                                        onChange={(e) => setData('product_id', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-10"
                                    >
                                        <option value="">Select Existing Product (Optional)</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.sku})
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={route('products.create')}
                                        target="_blank"
                                        className="absolute right-2 p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                                    >
                                        <PackagePlus className="w-4 h-4" />
                                    </Link>
                                </div>
                                {errors.product_id && <p className="text-xs text-rose-500 mt-1">{errors.product_id}</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Item Category</label>
                                <select
                                    value={data.product_category_id}
                                    onChange={(e) => setData('product_category_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.product_category_id && <p className="text-xs text-rose-500 mt-1">{errors.product_category_id}</p>}
                            </div>
                        </div>

                        {/* Row 3: Metal Type, Purity, Wastage % */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {/* Metal Type */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Metal Type *</label>
                                <select
                                    value={data.metal_type}
                                    onChange={(e) => setData('metal_type', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="gold">Gold</option>
                                    <option value="silver">Silver</option>
                                    <option value="platinum">Platinum</option>
                                    <option value="diamond">Diamond</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                                {errors.metal_type && <p className="text-xs text-rose-500 mt-1">{errors.metal_type}</p>}
                            </div>

                            {/* Purity */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Purity *</label>
                                <select
                                    value={data.purity_id}
                                    onChange={(e) => setData('purity_id', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">Select Purity</option>
                                    {purities.map((pur) => (
                                        <option key={pur.id} value={pur.id}>
                                            {pur.name} ({pur.percentage}%)
                                        </option>
                                    ))}
                                </select>
                                {errors.purity_id && <p className="text-xs text-rose-500 mt-1">{errors.purity_id}</p>}
                            </div>

                            {/* Wastage % */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Wastage %</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.wastage_percentage}
                                        onChange={(e) => setData('wastage_percentage', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-8"
                                    />
                                    <Percent className="w-4 h-4 text-gray-400 absolute right-3" />
                                </div>
                                {errors.wastage_percentage && <p className="text-xs text-rose-500 mt-1">{errors.wastage_percentage}</p>}
                            </div>
                        </div>

                        {/* Row 4: Vori, Ana, Roti, Point Weight Conversion & Grams */}
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-amber-900 uppercase">
                                    Weight in Vori, Ana, Roti, Point & Grams
                                </label>
                                <span className="text-[11px] font-semibold text-amber-700">1 Vori = 11.664g</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <div>
                                    <span className="block text-[11px] font-bold text-amber-800 mb-1">Vori</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.vori}
                                        onChange={(e) => updateVoriWeight('vori', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>

                                <div>
                                    <span className="block text-[11px] font-bold text-amber-800 mb-1">Ana</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="15.99"
                                        value={data.ana}
                                        onChange={(e) => updateVoriWeight('ana', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>

                                <div>
                                    <span className="block text-[11px] font-bold text-amber-800 mb-1">Roti</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="5.99"
                                        value={data.roti}
                                        onChange={(e) => updateVoriWeight('roti', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>

                                <div>
                                    <span className="block text-[11px] font-bold text-amber-800 mb-1">Point</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="9.99"
                                        value={data.point}
                                        onChange={(e) => updateVoriWeight('point', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <span className="block text-[11px] font-bold text-amber-900 mb-1">Total Weight (g) *</span>
                                    <input
                                        type="number"
                                        step="0.001"
                                        required
                                        value={data.weight_gm}
                                        onChange={(e) => setData('weight_gm', e.target.value)}
                                        placeholder="0.000"
                                        className="w-full px-3 py-2 border border-amber-300 rounded-xl text-sm font-black text-amber-950 bg-white focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 5: Artisan Charge, Paid Amount, Due Payment Calculation Box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            {/* Artisan Charge */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Artisan / Making Charge (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.artisan_charge}
                                    onChange={(e) => updateChargeOrPaid('artisan_charge', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {errors.artisan_charge && <p className="text-xs text-rose-500 mt-1">{errors.artisan_charge}</p>}
                            </div>

                            {/* Paid Amount */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-emerald-700 mb-1">Paid Amount (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.paid_amount}
                                    onChange={(e) => updateChargeOrPaid('paid_amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500/20"
                                />
                                {errors.paid_amount && <p className="text-xs text-rose-500 mt-1">{errors.paid_amount}</p>}
                            </div>
                        </div>

                        {/* Due Payment Breakdown Banner */}
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl text-white flex items-center justify-between shadow-md">
                            <div>
                                <p className="text-xs font-medium text-slate-400">Total Artisan Charge: <span className="font-bold text-white">৳{Number(data.artisan_charge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                                <p className="text-xs font-medium text-emerald-400">Paid Amount: <span className="font-bold">৳{Number(data.paid_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300">Due Payment</p>
                                <p className="text-2xl font-black text-rose-400">
                                    ৳{Number(data.due_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Notes & Design Specifications</label>
                            <textarea
                                rows="2"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Additional crafting instructions or notes..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Link
                                href={route('production.index')}
                                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-7 py-2.5 text-white rounded-xl text-sm font-bold shadow-xs transition flex items-center gap-2 hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Production'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
