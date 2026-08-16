import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Wallet, Printer, Filter, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccountsReport({ summary = {}, incomes = [], expenses = [], filters = {} }) {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('reports.accounts'), {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Wallet className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('accountsReport') || 'Accounts Report'}
                    </h2>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer print:hidden"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Printer className="w-4 h-4" />
                        {t('print') || 'Print'}
                    </button>
                </div>
            }
        >
            <Head title="Accounts Report" />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">Accounts & Financial Statement</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        {startDate && endDate && <p>Period: {startDate} to {endDate}</p>}
                        <p>Printed: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full text-white py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        >
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-emerald-800 uppercase">Total Income</p>
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-emerald-900 mt-2">৳ {fmtBDT(summary.total_income)}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        <div className="flex justify-between"><span>Sales:</span><span className="font-semibold text-gray-700">৳ {fmtBDT(summary.sales_revenue)}</span></div>
                        <div className="flex justify-between"><span>Other:</span><span className="font-semibold text-gray-700">৳ {fmtBDT(summary.other_income)}</span></div>
                        <div className="flex justify-between"><span>Mortgage:</span><span className="font-semibold text-gray-700">৳ {fmtBDT(summary.mortgage_interest)}</span></div>
                    </div>
                </div>

                <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-rose-800 uppercase">Total Expenses</p>
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="text-2xl font-black text-rose-900 mt-2">৳ {fmtBDT(summary.total_expenses)}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        <div className="flex justify-between"><span>Purchases:</span><span className="font-semibold text-gray-700">৳ {fmtBDT(summary.purchases_cost)}</span></div>
                        <div className="flex justify-between"><span>Other Expenses:</span><span className="font-semibold text-gray-700">৳ {fmtBDT(summary.other_expenses)}</span></div>
                    </div>
                </div>

                <div className="bg-white border border-amber-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-800 uppercase">Net Profit</p>
                        <DollarSign className="w-5 h-5" style={{ color: 'rgb(177, 118, 51)' }} />
                    </div>
                    <p className={`text-2xl font-black mt-2 ${summary.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        ৳ {fmtBDT(summary.net_profit)}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        {summary.net_profit >= 0 ? 'Net positive earnings' : 'Net deficit balance'}
                    </p>
                </div>
            </div>

            {/* Income & Expense Breakdown Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Other Incomes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50/80 border-b border-gray-100 font-bold text-sm text-gray-800">
                        Income Records
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 font-bold uppercase border-b border-gray-100">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Method</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incomes.length > 0 ? (
                                    incomes.map((inc) => (
                                        <tr key={inc.id} className="hover:bg-gray-50/50">
                                            <td className="p-3 font-medium text-gray-700">{inc.income_date}</td>
                                            <td className="p-3 font-bold text-gray-800">{inc.category || '—'}</td>
                                            <td className="p-3 text-gray-600">{inc.payment_method || '—'}</td>
                                            <td className="p-3 text-right font-bold text-emerald-600">৳ {fmtBDT(inc.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-400">No income records</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Other Expenses */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50/80 border-b border-gray-100 font-bold text-sm text-gray-800">
                        Expense Records
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 font-bold uppercase border-b border-gray-100">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Method</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.length > 0 ? (
                                    expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50/50">
                                            <td className="p-3 font-medium text-gray-700">{exp.expense_date}</td>
                                            <td className="p-3 font-bold text-gray-800">{exp.category || '—'}</td>
                                            <td className="p-3 text-gray-600">{exp.payment_method || '—'}</td>
                                            <td className="p-3 text-right font-bold text-rose-600">৳ {fmtBDT(exp.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-400">No expense records</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
