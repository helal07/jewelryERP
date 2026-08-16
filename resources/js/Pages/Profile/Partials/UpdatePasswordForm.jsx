import React, { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Lock, KeyRound, Save, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function UpdatePasswordForm({ className = '' }) {
    const { t } = useLanguage();
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                    <KeyRound className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Change Password</h3>
                </div>
            </div>

            <form onSubmit={updatePassword} className="mt-5 space-y-4">
                {/* Current Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Current Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            type="password"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 pl-10 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {errors.current_password && <p className="text-xs text-rose-600 mt-1">{errors.current_password}</p>}
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        New Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="password"
                            ref={passwordInput}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 pl-10 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            required
                        />
                    </div>
                    {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Confirm New Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 pl-10 rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                            autoComplete="new-password"
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>
                    {errors.password_confirmation && <p className="text-xs text-rose-600 mt-1">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Save className="w-4 h-4" />
                        Update Password
                    </button>

                    {recentlySuccessful && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            Password Updated!
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
