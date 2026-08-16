import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save, CreditCard } from 'lucide-react';

export default function Create({ accounts, branches }) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        cheque_no: '',
        bank_name: '',
        account_id: accounts.length > 0 ? accounts[0].id : '',
        direction: 'received',
        party_type: '',
        amount: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('accounts.cheques.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                        <CreditCard className="w-7 h-7 text-[#E88A1A]" />
                        Record Cheque Entry
                    </h2>
                    <Link
                        href={route('accounts.cheques.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Register
                    </Link>
                </div>
            }
        >
            <Head title="Record Cheque" />

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cheque Number *</label>
                            <input
                                type="text"
                                value={data.cheque_no}
                                onChange={e => setData('cheque_no', e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm font-mono font-bold"
                                placeholder="e.g. CHQ-994820"
                                required
                            />
                            {errors.cheque_no && <p className="text-xs text-rose-600 mt-1">{errors.cheque_no}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Direction *</label>
                            <select
                                value={data.direction}
                                onChange={e => setData('direction', e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm font-medium"
                                required
                            >
                                <option value="received">Received (Incoming Cheque)</option>
                                <option value="issued">Issued (Outgoing Cheque)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={data.bank_name}
                                onChange={e => setData('bank_name', e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                                placeholder="e.g. Islami Bank Bangladesh"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Associated Bank Account *</label>
                            <select
                                value={data.account_id}
                                onChange={e => setData('account_id', e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm font-medium"
                                required
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                            {errors.account_id && <p className="text-xs text-rose-600 mt-1">{errors.account_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Date *</label>
                            <input
                                type="date"
                                value={data.issue_date}
                                onChange={e => setData('issue_date', e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                                required
                            />
                            {errors.issue_date && <p className="text-xs text-rose-600 mt-1">{errors.issue_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Due / Clearing Date</label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cheque Amount (BDT) *</label>
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
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status *</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm font-medium capitalize"
                                required
                            >
                                <option value="pending">Pending</option>
                                <option value="cleared">Cleared</option>
                                <option value="bounced">Bounced</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes / Remarks</label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                            rows="3"
                            placeholder="Additional details..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#E88A1A] hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Cheque Record
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
