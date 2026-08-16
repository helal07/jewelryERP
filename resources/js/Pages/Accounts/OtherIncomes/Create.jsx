import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';

export default function Create({ accounts, branches }) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        account_id: accounts.length > 0 ? accounts[0].id : '',
        income_date: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('accounts.other-incomes.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-emerald-600" />
                        Record Other Income
                    </h2>
                    <Link
                        href={route('accounts.other-incomes.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Record Other Income" />

            <div className="max-w-2xl mx-auto pb-12">
                <form onSubmit={submit} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Branch *</label>
                        <select
                            value={data.branch_id}
                            onChange={e => setData('branch_id', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            required
                        >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        {errors.branch_id && <p className="text-xs text-rose-600 mt-1">{errors.branch_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Income Account *</label>
                        <select
                            value={data.account_id}
                            onChange={e => setData('account_id', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm font-medium"
                            required
                        >
                            <option value="">Select Income Account</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                            ))}
                        </select>
                        {errors.account_id && <p className="text-xs text-rose-600 mt-1">{errors.account_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Income Date *</label>
                        <input
                            type="date"
                            value={data.income_date}
                            onChange={e => setData('income_date', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            required
                        />
                        {errors.income_date && <p className="text-xs text-rose-600 mt-1">{errors.income_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category / Type</label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            placeholder="e.g. Scrap Gold Sale / Commission / Rental Income"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (BDT) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-lg font-bold text-emerald-800"
                            placeholder="0.00"
                            required
                        />
                        {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes / Remarks</label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                            rows="3"
                            placeholder="Additional details..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Other Income
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
