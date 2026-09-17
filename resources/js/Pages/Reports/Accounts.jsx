import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Wallet, Printer, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

export default function AccountsReport({ summary = {}, incomes = [], expenses = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    useFilter(route('reports.accounts'), {
        start_date: startDate,
        end_date: endDate,
    });

    const fmtMoney = (val) => {
        const formatted = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(formatted)}` : `BDT ${formatted}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Wallet className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('accountsReport')}
                    </h2>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer print:hidden"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Printer className="w-4 h-4" />
                        {t('print')}
                    </button>
                </div>
            }
        >
            <Head title={t('accountsReport')} />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">{t('accountsReport')}</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        {startDate && endDate && (
                            <p>{t('startDate')}: {isBn ? toBn(startDate) : startDate} - {t('endDate')}: {isBn ? toBn(endDate) : endDate}</p>
                        )}
                        <p>{t('Printed') || 'Printed'}: {isBn ? toBn(new Date().toLocaleDateString()) : new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('startDate')}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('endDate')}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-emerald-800 uppercase">{t('totalIncome') || 'Total Income'}</p>
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-emerald-900 mt-2">{fmtMoney(summary.total_income)}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        <div className="flex justify-between">
                            <span>{t('sales')}:</span>
                            <span className="font-semibold text-gray-700">{fmtMoney(summary.sales_revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('otherIncomes')}:</span>
                            <span className="font-semibold text-gray-700">{fmtMoney(summary.other_income)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('mortgage')}:</span>
                            <span className="font-semibold text-gray-700">{fmtMoney(summary.mortgage_interest)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-rose-800 uppercase">{t('totalExpenses') || 'Total Expenses'}</p>
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="text-2xl font-black text-rose-900 mt-2">{fmtMoney(summary.total_expenses)}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        <div className="flex justify-between">
                            <span>{t('purchases')}:</span>
                            <span className="font-semibold text-gray-700">{fmtMoney(summary.purchases_cost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('otherExpenses')}:</span>
                            <span className="font-semibold text-gray-700">{fmtMoney(summary.other_expenses)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-amber-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-800 uppercase">{t('netProfit') || 'Net Profit'}</p>
                        <DollarSign className="w-5 h-5" style={{ color: 'rgb(177, 118, 51)' }} />
                    </div>
                    <p className={`text-2xl font-black mt-2 ${summary.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {fmtMoney(summary.net_profit)}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        {summary.net_profit >= 0 
                            ? (isBn ? 'নিট লাভজনক অবস্থান' : 'Net positive earnings') 
                            : (isBn ? 'নিট ঘাটতি ব্যালেন্স' : 'Net deficit balance')}
                    </p>
                </div>
            </div>

            {/* Income & Expense Breakdown Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Other Incomes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 pb-8">
                    <div className="font-bold text-sm text-gray-800 mb-3 flex items-center justify-between">
                        <span>{t('incomeRecords')}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {isBn ? `${toBn(incomes.length)} টি রেকর্ড` : `${incomes.length} records`}
                        </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('date')}</th>
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('category') || 'Category'}</th>
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('paymentMethod') || 'Method'}</th>
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incomes.length > 0 ? (
                                    incomes.map((inc) => (
                                        <tr key={inc.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-3.5 py-2.5 font-medium text-gray-700 whitespace-nowrap">{isBn ? toBn(inc.income_date) : inc.income_date}</td>
                                            <td className="px-3.5 py-2.5 font-bold text-gray-800">{inc.category || '—'}</td>
                                            <td className="px-3.5 py-2.5 text-gray-600 capitalize">{inc.payment_method || '—'}</td>
                                            <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600 whitespace-nowrap">{fmtMoney(inc.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-400">{t('noIncomeRecords')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Other Expenses */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4 pb-8">
                    <div className="font-bold text-sm text-gray-800 mb-3 flex items-center justify-between">
                        <span>{t('expenseRecords')}</span>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            {isBn ? `${toBn(expenses.length)} টি রেকর্ড` : `${expenses.length} records`}
                        </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('date')}</th>
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('category') || 'Category'}</th>
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('paymentMethod') || 'Method'}</th>
                                    <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.length > 0 ? (
                                    expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-3.5 py-2.5 font-medium text-gray-700 whitespace-nowrap">{isBn ? toBn(exp.expense_date) : exp.expense_date}</td>
                                            <td className="px-3.5 py-2.5 font-bold text-gray-800">{exp.category || '—'}</td>
                                            <td className="px-3.5 py-2.5 text-gray-600 capitalize">{exp.payment_method || '—'}</td>
                                            <td className="px-3.5 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">{fmtMoney(exp.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-400">{t('noExpenseRecords')}</td>
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
