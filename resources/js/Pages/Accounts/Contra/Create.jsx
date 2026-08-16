import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save, ArrowLeftRight } from 'lucide-react';

export default function Create({ accounts, branches }) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        entry_date: new Date().toISOString().split('T')[0],
        from_account_id: '',
        to_account_id: '',
        amount: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('accounts.contra.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                        <ArrowLeftRight className="w-7 h-7 text-[#E88A1A]" />
                        Record Contra Transfer
                    </h2>
                    <Link
                        href={route('accounts.contra.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="New Contra Entry" />

            <div className="max-w-2xl mx-auto pb-12">
                <form onSubmit={submit} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Branch *</label>
                        <select
                            value={data.branch_id}
                            onChange={e => setData('branch_id', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                            required
                        >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        {errors.branch_id && <p className="text-xs text-rose-600 mt-1">{errors.branch_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Transfer Date *</label>
                        <input
                            type="date"
                            value={data.entry_date}
                            onChange={e => setData('entry_date', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                            required
                        />
                        {errors.entry_date && <p className="text-xs text-rose-600 mt-1">{errors.entry_date}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-rose-700 mb-1">From Account (Source) *</label>
                            <select
                                value={data.from_account_id}
                                onChange={e => setData('from_account_id', e.target.value)}
                                className="w-full rounded-xl border-rose-300 focus:border-rose-500 focus:ring-rose-500 text-sm font-medium bg-rose-50/30"
                                required
                            >
                                <option value="">Select Account</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                            {errors.from_account_id && <p className="text-xs text-rose-600 mt-1">{errors.from_account_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-emerald-700 mb-1">To Account (Destination) *</label>
                            <select
                                value={data.to_account_id}
                                onChange={e => setData('to_account_id', e.target.value)}
                                className="w-full rounded-xl border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm font-medium bg-emerald-50/30"
                                required
                            >
                                <option value="">Select Account</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                            {errors.to_account_id && <p className="text-xs text-rose-600 mt-1">{errors.to_account_id}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Transfer Amount (BDT) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-lg font-bold text-gray-900"
                            placeholder="0.00"
                            required
                        />
                        {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes / Description</label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                            rows="3"
                            placeholder="e.g. Deposited cash into City Bank account"
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#E88A1A] hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Contra Transfer
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
