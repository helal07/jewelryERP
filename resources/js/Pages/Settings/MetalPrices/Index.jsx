import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { Scale, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const VORI = 11.664; // 1 Vori = 11.664 grams (Bangladesh standard)

export default function Index({ metalPrices = { data: [] }, purities = [], branches = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
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

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '0.0000') {
            e.target.select();
        }
    };

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
        if (confirm(isBn ? 'আপনি কি নিশ্চিত যে এই দরটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this price record?')) {
            router.delete(route('settings.metal-prices.destroy', id));
        }
    };

    const fmtMoney = (val) => {
        const formatted = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(formatted)}` : `BDT ${formatted}`;
    };

    const metalBadge = (type) => {
        const map = {
            gold: 'bg-amber-100/80 text-amber-900 border border-amber-200',
            silver: 'bg-slate-100 text-slate-700 border border-slate-200',
            platinum: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
        };
        return map[type] || 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Scale className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('metalPrice')}
                    </h2>

                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        {isBn ? 'নতুন দর যোগ করুন' : 'Add Price'}
                    </button>
                </div>
            }
        >
            <Head title={t('metalPrice')} />

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
                            <option value="">{t('allMetals')}</option>
                            <option value="gold">{t('gold') || 'Gold'}</option>
                            <option value="silver">{t('silver') || 'Silver'}</option>
                            <option value="platinum">{t('platinum') || 'Platinum'}</option>
                        </select>
                    </div>

                    <div className="w-48">
                        <select
                            value={purityId}
                            onChange={(e) => setPurityId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">{t('allPurities')}</option>
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
                            <RotateCcw className="w-4 h-4" /> {t('reset')}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 pb-24 min-h-[350px]">
                <div className="overflow-x-visible min-h-[300px]">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('sl') || 'SL'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('updatedBy') || 'Updated By'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('metal') || 'Type'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('purity')}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('ratePerVori') || 'Price / Vori'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('ratePerGram') || 'Price / Gm'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {metalPrices?.data && metalPrices.data.length > 0 ? (
                                metalPrices.data.map((mp, index) => {
                                    const pricePerGm = Number(mp.price_per_gram);
                                    const pricePerVoriVal = pricePerGm * VORI;
                                    const sl = (metalPrices.current_page - 1) * metalPrices.per_page + index + 1;
                                    return (
                                        <tr key={mp.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-2.5 px-3.5 font-bold text-gray-500 whitespace-nowrap">#{isBn ? toBn(sl) : sl}</td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">
                                                    {mp.creator?.name || (isBn ? 'সিস্টেম' : 'System')}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    {isBn ? toBn(new Date(mp.effective_date).toLocaleDateString()) : new Date(mp.effective_date).toLocaleDateString()}
                                                </div>
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${metalBadge(mp.metal_type)}`}>
                                                    {t(mp.metal_type) || mp.metal_type}
                                                </span>
                                            </td>

                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                <span className="font-bold text-gray-900">
                                                    {mp.purity?.name || '-'}
                                                </span>
                                                {mp.purity?.percentage && (
                                                    <span className="ml-1 text-[11px] text-gray-400">({isBn ? toBn(mp.purity.percentage) : mp.purity.percentage}%)</span>
                                                )}
                                            </td>

                                            <td className="py-2.5 px-3.5 text-right font-black text-amber-900 whitespace-nowrap">
                                                {fmtMoney(pricePerVoriVal)}
                                            </td>

                                            <td className="py-2.5 px-3.5 text-right font-bold text-gray-700 whitespace-nowrap">
                                                {fmtMoney(pricePerGm)}
                                            </td>

                                            <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {t('actions')}
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48" className="py-1 bg-white shadow-xl rounded-xl border border-gray-100">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(mp.id);
                                                            }}
                                                            className="block w-full px-4 py-2 text-start text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> {t('delete')}
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
                                        {isBn ? 'কোনো ধাতুর দর পাওয়া যায়নি' : 'No metal prices found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {metalPrices?.links && metalPrices.links.length > 3 && (
                    <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
                        <Pagination links={metalPrices.links} />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden z-10 border border-gray-100">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                            <div className="flex items-center gap-2 text-white">
                                <Scale className="w-5 h-5" />
                                <h3 className="text-sm font-bold">{isBn ? 'নতুন ধাতুর দর যোগ' : 'Add Metal Price'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-white/80 hover:text-white rounded-lg p-1 transition cursor-pointer"
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
                                            {t('metal') || 'Metal Type'} *
                                        </label>
                                        <select
                                            value={data.metal_type}
                                            onChange={(e) => setData('metal_type', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        >
                                            <option value="gold">{t('gold') || 'Gold'}</option>
                                            <option value="silver">{t('silver') || 'Silver'}</option>
                                            <option value="platinum">{t('platinum') || 'Platinum'}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            {t('purity')} *
                                        </label>
                                        <select
                                            value={data.purity_id}
                                            onChange={(e) => setData('purity_id', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        >
                                            <option value="">{t('select')}</option>
                                            {purities.filter(p => p.metal_type === data.metal_type).map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({isBn ? toBn(p.percentage) : p.percentage}%)</option>
                                            ))}
                                        </select>
                                        {errors.purity_id && <p className="text-xs text-rose-500 mt-1">{errors.purity_id}</p>}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-amber-200 p-4 bg-amber-50/40 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            {t('ratePerVori') || 'Price / Vori (BDT)'} *
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={pricePerVori}
                                            onFocus={handleNumberFocus}
                                            onChange={(e) => handleVoriChange(e.target.value)}
                                            className="w-full text-sm font-bold text-amber-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            {t('ratePerGram') || 'Price / Gram (BDT)'} *
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={data.price_per_gram}
                                            onFocus={handleNumberFocus}
                                            onChange={(e) => handleGramChange(e.target.value)}
                                            className="w-full text-sm font-bold text-gray-900 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    {errors.price_per_gram && <p className="text-xs text-rose-500">{errors.price_per_gram}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            {t('date')} *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.effective_date}
                                            onChange={(e) => setData('effective_date', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        >
                                        </input>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                            {t('branch')}
                                        </label>
                                        <select
                                            value={data.branch_id}
                                            onChange={(e) => setData('branch_id', e.target.value)}
                                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="">{t('allBranches')}</option>
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
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                                    style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                >
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            , document.body)}
        </AuthenticatedLayout>
    );
}
