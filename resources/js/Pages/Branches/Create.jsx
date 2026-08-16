import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Create() {
    const { t } = useLanguage();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        is_head_office: false,
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('branches.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Building2 className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        Add Branch
                    </h2>

                    <Link
                        href={route('branches.index')}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('back') || 'Back'}
                    </Link>
                </div>
            }
        >
            <Head title="Add Branch" />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                required
                            />
                            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch Code *</label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                required
                            />
                            {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            />
                            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            />
                            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={2}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                        {errors.address && <p className="text-xs text-rose-600 mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_head_office}
                                    onChange={(e) => setData('is_head_office', e.target.checked)}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-xs font-bold text-gray-800">Is Head Office</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer hover:opacity-90 active:opacity-100"
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        >
                            <Save className="w-4 h-4" /> Save Branch
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
