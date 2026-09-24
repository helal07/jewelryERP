import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { Gem, Plus, Edit2, Trash2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ purities = { data: [] }, filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const { flash } = usePage().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editPurity, setEditPurity] = useState(null);

    const [metalType, setMetalType] = useState(filters.metal_type || '');

    useFilter(route('settings.purities.index'), {
        metal_type: metalType,
    });

    const handleReset = () => {
        setMetalType('');
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        metal_type: 'gold',
        name: '',
        percentage: '',
        is_active: true,
    });

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00') {
            e.target.select();
        }
    };

    const openCreateModal = () => {
        reset();
        setEditPurity(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (purity) => {
        setEditPurity(purity);
        setData({
            metal_type: purity.metal_type,
            name: purity.name,
            percentage: purity.percentage,
            is_active: purity.is_active ?? true,
        });
        setIsCreateOpen(true);
    };

    const closeModal = () => {
        setIsCreateOpen(false);
        setEditPurity(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editPurity) {
            put(route('settings.purities.update', editPurity.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('settings.purities.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm(isBn ? 'আপনি কি নিশ্চিত যে এই ক্যারেট/বিশুদ্ধতা সেটিংটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this purity setting?')) {
            router.delete(route('settings.purities.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Gem className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('purity')}
                    </h2>

                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        {isBn ? 'নতুন ক্যারেট যোগ করুন' : 'Add Purity'}
                    </button>
                </div>
            }
        >
            <Head title={t('purity')} />

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

                    {metalType && (
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
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('metal') || 'Metal Type'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('purity') || 'Purity Name'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('finePercentage') || 'Fine Content (%)'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-center">{t('status')}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {purities?.data && purities.data.length > 0 ? (
                                purities.data.map((purity) => (
                                    <tr key={purity.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-2.5 px-3.5 font-bold text-gray-800 capitalize whitespace-nowrap">{t(purity.metal_type) || purity.metal_type}</td>
                                        <td className="py-2.5 px-3.5 font-semibold text-gray-900 whitespace-nowrap">{purity.name}</td>
                                        <td className="py-2.5 px-3.5 text-right font-black text-amber-900 whitespace-nowrap">
                                            {isBn ? `${toBn(Number(purity.percentage).toFixed(2))}%` : `${Number(purity.percentage).toFixed(2)}%`}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                                            {purity.is_active ? (
                                                <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> {t('active')}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[11px] font-bold text-gray-500 bg-gray-100 rounded-full border border-gray-200 inline-flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> {t('inactive')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-right font-medium whitespace-nowrap">
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
                                                            openEditModal(purity);
                                                        }}
                                                        className="block w-full px-4 py-2 text-start text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-blue-600" /> {t('edit')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(purity.id);
                                                        }}
                                                        className="block w-full px-4 py-2 text-start text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-rose-600" /> {t('delete')}
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                        {isBn ? 'কোনো বিশুদ্ধতা কনফিগারেশন পাওয়া যায়নি' : 'No purity configurations found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {purities?.links && purities.links.length > 3 && (
                    <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
                        <Pagination links={purities.links} from={purities.from} to={purities.to} total={purities.total} />
                    </div>
                )}
            </div>

            {/* Modal */}
            {isCreateOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Gem className="w-5 h-5" style={{ color: 'rgb(177, 118, 51)' }} />
                            {editPurity ? (isBn ? 'ক্যারেট সম্পাদনা' : 'Edit Purity') : (isBn ? 'নতুন ক্যারেট যোগ' : 'Add Purity')}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('metal') || 'Metal Type'} *</label>
                                <select
                                    value={data.metal_type}
                                    onChange={(e) => setData('metal_type', e.target.value)}
                                    className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 capitalize"
                                    required
                                >
                                    <option value="gold">{t('gold') || 'Gold'}</option>
                                    <option value="silver">{t('silver') || 'Silver'}</option>
                                    <option value="platinum">{t('platinum') || 'Platinum'}</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('purity') || 'Purity Name'} *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                        placeholder="e.g. 22K"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('finePercentage') || 'Fine Content (%)'} *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        max="100"
                                        value={data.percentage}
                                        onFocus={handleNumberFocus}
                                        onChange={(e) => setData('percentage', e.target.value)}
                                        className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                        placeholder="0"
                                        required
                                    />
                                    {errors.percentage && <p className="text-xs text-rose-600 mt-1">{errors.percentage}</p>}
                                </div>
                            </div>

                            <div className="flex items-center pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-xs font-bold text-gray-800">{isBn ? 'সক্রিয় ক্যারেট/বিশুদ্ধতা' : 'Is Active Purity'}</span>
                                </label>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
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
