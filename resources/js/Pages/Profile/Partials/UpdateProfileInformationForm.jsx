import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { User, Mail, Phone, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const { t } = useLanguage();
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                    <User className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Personal & Contact Info</h3>
                </div>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Full Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full text-sm font-bold text-gray-900 pl-10 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            required
                        />
                    </div>
                    {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Email / Gmail Address */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Email / Gmail Address *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 pl-10 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            required
                        />
                    </div>
                    {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                {/* Contact Phone Number */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Contact Phone Number
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 pl-10 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="+880 1XXXXXXXXX"
                        />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                        Your email address is unverified.
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>

                    {recentlySuccessful && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            Saved!
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
