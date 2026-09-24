import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, Building2, Calendar, CheckCircle2, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Edit({ mustVerifyEmail, status, profileUser }) {
    const { t, lang, toBn } = useLanguage();
    const authUser = usePage().props.auth.user;
    const user = profileUser || authUser;

    const rawRole = user.roles && user.roles.length > 0 
        ? user.roles[0].name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'User';
    const roleName = t(rawRole) || rawRole;

    const formattedDate = user.created_at ? (() => {
        const d = new Date(user.created_at);
        const day = d.getDate();
        const month = d.toLocaleDateString('en-GB', { month: 'short' });
        const year = d.getFullYear();
        if (lang === 'bn') {
            return `${toBn(day)} ${t(month) || month} ${toBn(year)}`;
        }
        return `${day} ${month} ${year}`;
    })() : '';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <User className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('profile')}
                    </h2>
                </div>
            }
        >
            <Head title={t('profile')} />

            <div className="space-y-6 max-w-5xl">
                {/* 1. Profile Overview Banner Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div 
                                className="w-16 h-16 rounded-2xl text-white font-black text-2xl flex items-center justify-center shadow-md flex-shrink-0"
                                style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                        {roleName}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {t('active')}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {user.email}
                                    </span>
                                    {user.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {user.phone}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-gray-400" /> {user.branch?.name || t('headOffice')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {user.created_at && (
                            <div className="text-right text-xs text-gray-400 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0">
                                <span>{t('memberSince')}</span>
                                <span className="font-semibold text-gray-700">
                                    {formattedDate}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Main Forms Grid (Name / Gmail / Contact on left, Password on right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal & Contact Info Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <UpdateProfileInformationForm
                            key={`profile-info-${lang}`}
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <UpdatePasswordForm key={`profile-pwd-${lang}`} />
                    </div>
                </div>

                {/* 3. Delete Account / Danger Zone */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
                    <DeleteUserForm key={`profile-del-${lang}`} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
