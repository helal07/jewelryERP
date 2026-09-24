import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { ArrowLeft, Save, Layers, Tag } from 'lucide-react';

export default function Edit({ category, parentCategories }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        parent_id: category.parent_id || '',
        metal_type: category.metal_type || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('product-categories.update', category.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800">
                        {t('Edit Category')}
                    </h2>
                    <Link
                        href={route('product-categories.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('Back to List')}
                    </Link>
                </div>
            }
        >
            <Head title={t('Edit Category')} />

            <div className="max-w-3xl mx-auto pb-12">
                {/* Code display */}
                <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <Layers className="w-5 h-5 text-amber-700" />
                    <span className="text-sm text-amber-900 font-medium">
                        {t('Code')}: <span className="font-mono font-bold">{isBn ? toBn(category.code) : category.code}</span>
                    </span>
                </div>

                <form onSubmit={submit}>
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Layers className="w-5 h-5 mr-2 text-amber-600" />
                                {t('Category Details')}
                            </h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="space-y-6">
                                {/* Category Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('Category Name')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Parent Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('Parent Category')}
                                    </label>
                                    <select
                                        value={data.parent_id}
                                        onChange={e => setData('parent_id', e.target.value || null)}
                                        className="block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                    >
                                        <option value="">{t('None (Root Category)')}</option>
                                        {parentCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{t(cat.name)}</option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>}
                                </div>

                                {/* Metal Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('Metal Type')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.metal_type}
                                        onChange={e => setData('metal_type', e.target.value)}
                                        className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm ${errors.metal_type ? 'border-red-500' : ''}`}
                                        required
                                    >
                                        <option value="">{t('Select Metal Type')}</option>
                                        <option value="gold">{t('Gold')}</option>
                                        <option value="silver">{t('Silver')}</option>
                                        <option value="platinum">{t('Platinum')}</option>
                                        <option value="diamond">{t('Diamond')}</option>
                                        <option value="mixed">{t('Mixed')}</option>
                                    </select>
                                    {errors.metal_type && <p className="mt-1 text-sm text-red-600">{errors.metal_type}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? t('Saving...') : t('Update Category')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
