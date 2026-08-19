import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { Scale, Plus, Trash2, Filter, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const VORI = 11.664; // 1 Vori = 11.664 grams (Bangladesh standard)

const fmtBDT = (val) =>
    Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Index({ metalPrices, purities = [], branches = [], filters = {} }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [pricePerVori, setPricePerVori] = useState('');

    const [metalType, setMetalType] = useState(filters.metal_type || '');
    const [purityId, setPurityId] = useState(filters.purity_id || '');

    useFilter(route('settings.metal-prices.index'), {
        metal_type: metalType,
        purity_id: purityId,
    });

    const handleReset = () => {
        setMetalType('');
        setPurityId('');
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        metal_type: 'gold',
        purity_id: '',
        price_per_gram: '',
        effective_date: new Date().toISOString().split('T')[0],
        branch_id: '',
    });

    const openCreateModal = () => {
        reset();
        setPricePerVori('');
        if (purities.length > 0) {
            setData('purity_id', purities[0].id);
        }
        setIsCreateOpen(true);
    };

    const closeModal = () => {
        setIsCreateOpen(false);
        setPricePerVori('');
        reset();
    };

    // Two-way price sync helpers
    const handleVoriChange = (val) => {
        setPricePerVori(val);
        if (val && !isNaN(val)) {
            setData('price_per_gram', (parseFloat(val) / VORI).toFixed(4));
        } else {
            setData('price_per_gram', '');
        }
    };

    const handleGramChange = (val) => {
        setData('price_per_gram', val);
        if (val && !isNaN(val)) {
            setPricePerVori((parseFloat(val) * VORI).toFixed(2));
        } else {
            setPricePerVori('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.metal-prices.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this price record?')) {
            router.delete(route('settings.metal-prices.destroy', id));
        }
    };

    const metalBadge = (type) => {
        const map = {
            gold: 'bg-amber-100/80 text-amber-900',
            silver: 'bg-slate-100 text-slate-700',
            platinum: 'bg-indigo-100 text-indigo-800',
        };
        return map[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Scale className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('metalPrice') || 'Metal Price'}
                    </h2>

                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Price
                    </button>
                </div>
            }
        >
            <Head title="Metal Price" />

            {flash?.success && (
                <div className="mb-4 font-semibold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                    {flash.success}
                </div>
            )}

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-44">
                        <select
                            value={metalType}
                            onChange={(e) => setMetalType(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 capitalize"
                        >
                            <option value="">All Metal Types</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="platinum">Platinum</option>
                        </select>
                    </div>

                    <div className="w-48">
                        <select
                            value={purityId}
                            onChange={(e) => setPurityId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Purities</option>
                            {purities.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.metal_type})</option>
                            ))}
                        </select>
                    </div>

                    {(metalType || purityId) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 text-rose-600 bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 hover:bg-rose-100 cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pb-16">
                <div className="overflow-visible min-h-[350px]">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                <th className="py-3.5 px-4">SL</th>
                                <th className="py-3.5 px-4">Updated By</th>
                                <th className="py-3.5 px-4">Type</th>
                                <th className="py-3.5 px-4">Purity</th>
                                <th className="py-3.5 px-4 text-right">Price / Vori</th>
                                <th className="py-3.5 px-4 text-right">Price / Gm</th>
                                <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {metalPrices.data && metalPrices.data.length > 0 ? (
                                metalPrices.data.map((mp, index) => {
                                    const pricePerGm = Number(mp.price_per_gram);
                                    const pricePerVori = pricePerGm * VORI;
                                    const sl = (metalPrices.current_page - 1) * metalPrices.per_page + index + 1;
                                    return (
                                        <tr key={mp.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-gray-500">#{sl}</td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-gray-900">
                                                    {mp.creator?.name || 'System'}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    {new Date(mp.effective_date).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${metalBadge(mp.metal_type)}`}>
                                                    {mp.metal_type}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-gray-900">
                                                    {mp.purity?.name || '-'}
                                                </span>
                                                {mp.purity?.percentage && (
                                                    <span className="ml-1 text-[11px] text-gray-400">({mp.purity.percentage}%)</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-black text-amber-900">
                                                ৳ {fmtBDT(pricePerVori)}
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-bold text-gray-700">
                                                ৳ {fmtBDT(pricePerGm)}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border rounded-xl text-xs font-bold bg-white hover:bg-amber-50 transition cursor-pointer shadow-2xs"
                                                            style={{ color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.4)' }}
                                                        >
                                                            Actions
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48" className="py-1 bg-white shadow-xl rounded-xl border border-gray-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(mp.id)}
                                                            className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer transition"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-600" /> Delete
                                                        </button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        No metal prices found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {metalPrices.links && metalPrices.links.length > 3 && (
                    <div className="p-4 border-t border-gray-100 flex justify-end">
                        <Pagination links={metalPrices.links} />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={closeModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden z-10 border border-gray-100">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                            <div className="flex items-center gap-2 text-white">
                                <Scale className="w-5 h-5" />
                                <h3 className="text-sm font-bold">Add Metal Price</h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-white/80 hover:text-white rounded-lg p-1 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            Metal Type *
                                        </label>
                                        <select
                                            value={data.metal_type}
                                            onChange={(e) => setData('metal_type', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        >
                                            <option value="gold">Gold</option>
                                            <option value="silver">Silver</option>
                                            <option value="platinum">Platinum</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            Purity *
                                        </label>
                                        <select
                                            value={data.purity_id}
                                            onChange={(e) => setData('purity_id', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        >
                                            <option value="">Select Purity</option>
                                            {purities.filter(p => p.metal_type === data.metal_type).map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.percentage}%)</option>
                                            ))}
                                        </select>
                                        {errors.purity_id && <p className="text-xs text-rose-500 mt-1">{errors.purity_id}</p>}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-amber-200 p-4 bg-amber-50/40 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            Price / Vori (BDT) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={pricePerVori}
                                            onChange={(e) => handleVoriChange(e.target.value)}
                                            className="w-full text-sm font-bold text-amber-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            placeholder="e.g. 134000.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            Price / Gram (BDT) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            min="0"
                                            value={data.price_per_gram}
                                            onChange={(e) => handleGramChange(e.target.value)}
                                            className="w-full text-sm font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            placeholder="e.g. 11500.00"
                                            required
                                        />
                                    </div>
                                    {errors.price_per_gram && <p className="text-xs text-rose-500">{errors.price_per_gram}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            Effective Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.effective_date}
                                            onChange={(e) => setData('effective_date', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            Branch
                                        </label>
                                        <select
                                            value={data.branch_id}
                                            onChange={(e) => setData('branch_id', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-3.5 flex items-center justify-end gap-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                                    style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                >
                                    Save Price
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            , document.body)}
        </AuthenticatedLayout>
    );
}
