import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useLanguage } from '@/Context/LanguageContext';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';

export default function Create({ branches, roles }) {
    const { t } = useLanguage();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        branch_id: '',
        role: '',
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <UserPlus className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('addNew')} {t('users')}
                    </h2>
                    <Link
                        href={route('users.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition shadow-xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {t('backToList')}
                    </Link>
                </div>
            }
        >
            <Head title={t('addNew')} />

            <div className="max-w-2xl mx-auto py-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value={t('fullName') + ' *'} />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                autoComplete="name"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value={t('emailAddress') + ' *'} />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value={t('contactPhoneNumber')} />
                            <TextInput
                                id="phone"
                                type="text"
                                name="phone"
                                value={data.phone}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder={t('phonePlaceholder')}
                            />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value={t('newPassword') + ' *'} />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t('min8Chars')}
                                required
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value={t('confirmNewPassword') + ' *'} />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder={t('reEnterNewPassword')}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value={t('role') || 'Role'} />
                            <select
                                id="role"
                                name="role"
                                value={data.role}
                                className="mt-1 block w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-xl shadow-xs text-sm"
                                onChange={(e) => setData('role', e.target.value)}
                                required
                            >
                                <option value="">{t('select') || 'Select a role'}</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.name}>{t(r.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())) || r.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.role} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="branch_id" value={t('branch') || 'Branch'} />
                            <select
                                id="branch_id"
                                name="branch_id"
                                value={data.branch_id}
                                className="mt-1 block w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-xl shadow-xs text-sm"
                                onChange={(e) => setData('branch_id', e.target.value)}
                            >
                                <option value="">{t('headOffice') || 'No Branch (Global)'}</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.branch_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value={t('status') || 'Status'} />
                            <select
                                id="status"
                                name="status"
                                value={data.status}
                                className="mt-1 block w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-xl shadow-xs text-sm"
                                onChange={(e) => setData('status', e.target.value)}
                                required
                            >
                                <option value="active">{t('active') || 'Active'}</option>
                                <option value="inactive">{t('inactive') || 'Inactive'}</option>
                            </select>
                            <InputError message={errors.status} className="mt-1" />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Link
                                href={route('users.index')}
                                className="text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition"
                            >
                                {t('cancel')}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                                style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                            >
                                <Save className="w-4 h-4" />
                                {t('save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
