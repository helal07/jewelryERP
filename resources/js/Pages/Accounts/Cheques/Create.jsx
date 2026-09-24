import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { ArrowLeft, Save, CreditCard } from 'lucide-react';

export default function Create({ accounts = [], branches = [] }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

    const cleanNumber = (val) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        if (/^0+[0-9]/.test(str)) {
            str = str.replace(/^0+/, '');
        }
        return str;
    };

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
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'নতুন চেক এন্ট্রি' : 'Record Cheque Entry'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'চেকের বিবরণ, ব্যাংক এবং ইস্যু তারিখ পূরণ করুন' : 'Fill in cheque number, bank, direction and amount'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('accounts.cheques.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to Register'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'নতুন চেক এন্ট্রি' : 'Record Cheque'} />

            <div className="max-w-2xl mx-auto pb-12 mt-4">
                <form onSubmit={submit} className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isBn ? 'শাখা' : 'Branch'} <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.branch_id}
                            onChange={e => setData('branch_id', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
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
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'চেক নম্বর' : 'Cheque Number'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.cheque_no}
                                onChange={e => setData('cheque_no', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-mono font-bold"
                                placeholder="e.g. CHQ-994820"
                                required
                            />
                            {errors.cheque_no && <p className="text-xs text-rose-600 mt-1">{errors.cheque_no}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'চেকের ধরন' : 'Direction'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.direction}
                                onChange={e => setData('direction', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-medium"
                                required
                            >
                                <option value="received">{isBn ? 'প্রাপ্ত চেক (Incoming Cheque)' : 'Received (Incoming Cheque)'}</option>
                                <option value="issued">{isBn ? 'প্রদত্ত চেক (Outgoing Cheque)' : 'Issued (Outgoing Cheque)'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'ব্যাংকের নাম' : 'Bank Name'}
                            </label>
                            <input
                                type="text"
                                value={data.bank_name}
                                onChange={e => setData('bank_name', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                placeholder={isBn ? 'যেমন: ইসলামী ব্যাংক বাংলাদেশ' : 'e.g. Islami Bank Bangladesh'}
                            />
                            {errors.bank_name && <p className="text-xs text-rose-600 mt-1">{errors.bank_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'অ্যাকাউন্ট লিঙ্ক' : 'Linked Account'}
                            </label>
                            <select
                                value={data.account_id}
                                onChange={e => setData('account_id', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            >
                                <option value="">{isBn ? 'অ্যাকাউন্ট নির্বাচন করুন' : 'Select Account'}</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isBn ? 'পরিমাণ (BDT)' : 'Amount (BDT)'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={data.amount}
                            onFocus={handleNumberFocus}
                            onChange={e => setData('amount', cleanNumber(e.target.value))}
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-bold text-gray-900"
                            placeholder="0"
                            required
                        />
                        {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'ইস্যু তারিখ' : 'Issue Date'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.issue_date}
                                onChange={e => setData('issue_date', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                                required
                            />
                            {errors.issue_date && <p className="text-xs text-rose-600 mt-1">{errors.issue_date}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'পরিশোধের তারিখ (Due Date)' : 'Due / Clearing Date'}
                            </label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            />
                            {errors.due_date && <p className="text-xs text-rose-600 mt-1">{errors.due_date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isBn ? 'মন্তব্য / বিবরণ' : 'Notes / Remarks'}
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 p-3"
                            placeholder={isBn ? 'চেকের উদ্দেশ্য বা অতিরিক্ত তথ্য...' : 'Purpose of cheque, party reference, etc.'}
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                            className="text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving...') : (isBn ? 'চেক রেকর্ড সংরক্ষণ করুন' : 'Save Cheque Record')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
