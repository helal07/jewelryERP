import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import { Gem, Plus, Edit2, Trash2, CheckCircle2, XCircle, Filter, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ purities, filters = {} }) {
    const { t } = useLanguage();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editPurity, setEditPurity] = useState(null);

    const [metalType, setMetalType] = useState(filters.metal_type || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('settings.purities.index'), {
            metal_type: metalType,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setMetalType('');
        router.get(route('settings.purities.index'), {}, { preserveState: true });
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        metal_type: 'gold',
        name: '',
        percentage: '',
        is_active: true,
    });

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
        if (confirm('Are you sure you want to delete this purity setting?')) {
            router.delete(route('settings.purities.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Gem className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('purity') || 'Purity'}
                    </h2>

                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Purity
                    </button>
                </div>
            }
        >
            <Head title="Purity" />

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
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

                    <button
                        type="submit"
                        className="text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Reset Filters"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pb-16">
                <div className="overflow-visible min-h-[350px]">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                <th className="py-3.5 px-4">Metal Type</th>
                                <th className="py-3.5 px-4">Purity Name</th>
                                <th className="py-3.5 px-4 text-right">Fine Content (%)</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {purities.data && purities.data.length > 0 ? (
                                purities.data.map((purity) => (
                                    <tr key={purity.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-gray-800 capitalize">{purity.metal_type}</td>
                                        <td className="py-3.5 px-4 font-semibold text-gray-900">{purity.name}</td>
                                        <td className="py-3.5 px-4 text-right font-black text-amber-900">
                                            {Number(purity.percentage).toFixed(2)}%
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {purity.is_active ? (
                                                <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[11px] font-bold text-gray-500 bg-gray-100 rounded-full border border-gray-200 inline-flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-medium">
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
                                                        onClick={() => openEditModal(purity)}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2 font-bold cursor-pointer transition"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-600" /> Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(purity.id)}
                                                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer transition"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-rose-600" /> Delete
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                        No purity configurations found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {purities.links && purities.links.length > 3 && (
                    <div className="p-4 border-t border-gray-100 flex justify-end">
                        <Pagination links={purities.links} from={purities.from} to={purities.to} total={purities.total} />
                    </div>
                )}
            </div>

            {/* Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 my-8">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Gem className="w-5 h-5" style={{ color: 'rgb(177, 118, 51)' }} />
                            {editPurity ? 'Edit Purity' : 'Add Purity'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Metal Type *</label>
                                <select
                                    value={data.metal_type}
                                    onChange={(e) => setData('metal_type', e.target.value)}
                                    className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 capitalize"
                                    required
                                >
                                    <option value="gold">Gold</option>
                                    <option value="silver">Silver</option>
                                    <option value="platinum">Platinum</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purity Name *</label>
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
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fine Content (%) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.percentage}
                                        onChange={(e) => setData('percentage', e.target.value)}
                                        className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                        placeholder="91.60"
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
                                    <span className="text-xs font-bold text-gray-800">Is Active Purity</span>
                                </label>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
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
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
