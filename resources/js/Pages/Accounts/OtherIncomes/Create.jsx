import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';

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
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'নতুন আয় রেকর্ড করুন' : 'Record Other Income'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'বিক্রয় বহির্ভূত আয়, কমিশন বা বিবিধ রাজস্ব লিপিবদ্ধ করুন' : 'Record non-sales revenue & miscellaneous receipts'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('accounts.other-incomes.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to List'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'নতুন আয় রেকর্ড' : 'Record Other Income'} />

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
                            {isBn ? 'আয় অ্যাকাউন্ট' : 'Income Account'} <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.account_id}
                            onChange={e => setData('account_id', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3 font-medium"
                            required
                        >
                            <option value="">{isBn ? 'আয় অ্যাকাউন্ট নির্বাচন করুন' : 'Select Income Account'}</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                            ))}
                        </select>
                        {errors.account_id && <p className="text-xs text-rose-600 mt-1">{errors.account_id}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isBn ? 'আয়ের তারিখ' : 'Income Date'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.income_date}
                            onChange={e => setData('income_date', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            required
                        />
                        {errors.income_date && <p className="text-xs text-rose-600 mt-1">{errors.income_date}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            {isBn ? 'ক্যাটেগরি / ধরন' : 'Category / Type'}
                        </label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 py-2.5 px-3"
                            placeholder={isBn ? 'যেমন: সার্ভিস চার্জ / বিনিয়োগ লাভ / পুরোনো স্ক্র্যাপ বিক্রি' : 'e.g. Service Charges / Investment Return / Old Scrap Sale'}
                        />
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
                            {isBn ? 'বিবরণ / মন্তব্য' : 'Notes / Remarks'}
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50 p-3"
                            placeholder={isBn ? 'আয়ের অতিরিক্ত বিবরণ...' : 'Additional notes regarding the income...'}
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
                            <span>{processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving...') : (isBn ? 'আয় রেকর্ড সংরক্ষণ করুন' : 'Save Income Record')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
