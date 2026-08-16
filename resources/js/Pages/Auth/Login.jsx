import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login({ status, canResetPassword, branches = [] }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        branch_id: branches.length === 1 ? String(branches[0].id) : '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Branch Selection Dropdown */}
                {branches && branches.length > 0 && (
                    <div>
                        <label htmlFor="branch_id" className="flex items-center gap-1.5 text-xs font-bold text-amber-200 mb-1.5 uppercase tracking-wider">
                            <Building2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Branch</span>
                        </label>

                        <div className="relative">
                            <select
                                id="branch_id"
                                name="branch_id"
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                className="block w-full bg-white/95 border border-amber-500/40 rounded-xl py-2.5 px-3.5 text-gray-900 text-sm font-semibold focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner cursor-pointer"
                            >
                                <option value="">Select Branch</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id} className="text-gray-900 font-medium">
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <InputError message={errors.branch_id} className="mt-1.5 text-rose-400 text-xs" />
                    </div>
                )}

                {/* Email Address */}
                <div>
                    <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-bold text-amber-200 mb-1.5 uppercase tracking-wider">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>Email Address</span>
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-white/95 border border-amber-500/30 rounded-xl py-2.5 px-3.5 text-gray-900 placeholder-gray-400 text-sm font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="admin@jewelry.test"
                        required
                    />

                    <InputError message={errors.email} className="mt-1.5 text-rose-400 text-xs" />
                </div>

                {/* Password */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-bold text-amber-200 uppercase tracking-wider">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Password</span>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-amber-300 hover:text-amber-100 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="block w-full bg-white/95 border border-amber-500/30 rounded-xl py-2.5 px-3.5 pr-11 text-gray-900 placeholder-gray-400 text-sm font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600 focus:outline-none transition-colors cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                                <Eye className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1.5 text-rose-400 text-xs" />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer group select-none">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 bg-black/40 border-white/20 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-900 cursor-pointer"
                        />
                        <span className="ms-2.5 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                            Remember me
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button 
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-black py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed tracking-wider uppercase text-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                        {processing ? 'Authenticating...' : 'Sign In'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
