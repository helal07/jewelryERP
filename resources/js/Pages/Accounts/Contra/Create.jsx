import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { ArrowLeft, Save, ArrowLeftRight } from 'lucide-react';

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
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <ArrowLeftRight className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'নতুন কন্ট্রা স্থানান্তর' : 'Record Contra Transfer'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'নগদ তহবিল ও ব্যাংক অ্যাকাউন্টের মধ্যে লেনদেন রেকর্ড করুন' : 'Record cash-to-bank and bank-to-bank transfers'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('accounts.contra.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to List'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'নতুন কন্ট্রা স্থানান্তর' : 'New Contra Entry'} />

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

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isBn ? 'স্থানান্তরের তারিখ' : 'Transfer Date'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.entry_date}
                            onChange={e => setData('entry_date', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            required
                        />
                        {errors.entry_date && <p className="text-xs text-rose-600 mt-1">{errors.entry_date}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'উৎস অ্যাকাউন্ট (হতে)' : 'From Account (Source)'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.from_account_id}
                                onChange={e => setData('from_account_id', e.target.value)}
                                className="w-full rounded-xl border border-rose-200 focus:border-rose-500 focus:ring-rose-500 text-xs font-medium bg-rose-50/40 py-2.5 px-3"
                                required
                            >
                                <option value="">{isBn ? 'অ্যাকাউন্ট নির্বাচন করুন' : 'Select Account'}</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                            {errors.from_account_id && <p className="text-xs text-rose-600 mt-1">{errors.from_account_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                                {isBn ? 'গন্তব্য অ্যাকাউন্ট (প্রতি)' : 'To Account (Destination)'} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.to_account_id}
                                onChange={e => setData('to_account_id', e.target.value)}
                                className="w-full rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 text-xs font-medium bg-emerald-50/40 py-2.5 px-3"
                                required
                            >
                                <option value="">{isBn ? 'অ্যাকাউন্ট নির্বাচন করুন' : 'Select Account'}</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                            {errors.to_account_id && <p className="text-xs text-rose-600 mt-1">{errors.to_account_id}</p>}
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

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isBn ? 'মন্তব্য / রেফারেন্স' : 'Notes / Remarks'}
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 p-3"
                            placeholder={isBn ? 'স্থানান্তরের কারণ বা রেফারেন্স...' : 'Transfer reason, reference, or description...'}
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
                            <span>{processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving...') : (isBn ? 'কন্ট্রা এন্ট্রি সংরক্ষণ করুন' : 'Save Contra Transfer')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
