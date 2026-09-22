import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import { 
    Wallet, Printer, TrendingUp, TrendingDown, DollarSign, Filter, RotateCcw
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import AccountReportsNav from './Components/AccountReportsNav';

export default function AccountsReport({ summary = {}, incomes = [], expenses = [], filters = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    useFilter(route('reports.accounts'), {
        start_date: startDate,
        end_date: endDate,
    });

    const setQuickDate = (period) => {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        if (period === 'today') {
            const str = toYmd(today);
            setStartDate(str);
            setEndDate(str);
        } else if (period === 'this_month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setStartDate(toYmd(start));
            setEndDate(toYmd(end));
        } else if (period === 'last_month') {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            setStartDate(toYmd(start));
            setEndDate(toYmd(end));
        } else if (period === 'this_year') {
            const start = new Date(today.getFullYear(), 0, 1);
            const end = new Date(today.getFullYear(), 11, 31);
            setStartDate(toYmd(start));
            setEndDate(toYmd(end));
        }
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
    };

    const fmtMoney = (val) => {
        const formatted = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(formatted)}` : `BDT ${formatted}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Wallet className="w-6 h-6" style={{ color: 'rgb(177, 118, 51)' }} />
                            {t('accountsReport')}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">{t('overviewOfRevenuesAndExpenses') || 'Financial performance overview across all income & expense streams'}</p>
                    </div>

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

            {/* Account Reports Navigation */}
            <AccountReportsNav activeTab="day-book" />

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

            {/* Fresh Filter Bar */}
            <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-4 mb-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-amber-600" />
                        {t('quickDateRange') || 'Quick Presets'}:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setQuickDate('today')}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition"
                        >
                            {t('today') || 'Today'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuickDate('this_month')}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition"
                        >
                            {t('thisMonth') || 'This Month'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuickDate('last_month')}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition"
                        >
                            {t('lastMonth') || 'Last Month'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuickDate('this_year')}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition"
                        >
                            {t('thisYear') || 'This Year'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" />
                            {t('reset') || 'Reset'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('startDate') || 'From Date'}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('endDate') || 'To Date'}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        />
                    </div>
                </div>
            </div>

            {/* Fresh Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{t('totalIncome') || 'Total Income'}</p>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xl font-black text-emerald-900 mt-1.5">{fmtMoney(summary.total_income)}</p>
                    <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
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

                <div className="bg-white border border-rose-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">{t('totalExpenses') || 'Total Expenses'}</p>
                        <TrendingDown className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-xl font-black text-rose-900 mt-1.5">{fmtMoney(summary.total_expenses)}</p>
                    <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
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

                <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{t('netProfit') || 'Net Profit'}</p>
                        <DollarSign className="w-4 h-4" style={{ color: 'rgb(177, 118, 51)' }} />
                    </div>
                    <p className={`text-xl font-black mt-1.5 ${summary.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {fmtMoney(summary.net_profit)}
                    </p>
                    <p className="mt-2 text-[10px] text-gray-400">
                        {summary.net_profit >= 0 
                            ? (isBn ? 'নিট লাভজনক অবস্থান' : 'Net positive earnings') 
                            : (isBn ? 'নিট ঘাটতি ব্যালেন্স' : 'Net deficit balance')}
                    </p>
                </div>
            </div>

            {/* Income & Expense Breakdown Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-24">
                {/* Other Incomes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden p-4">
                    <div className="font-bold text-xs text-gray-900 mb-2.5 flex items-center justify-between">
                        <span>{t('incomeRecords')}</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {isBn ? `${toBn(incomes.length)} টি রেকর্ড` : `${incomes.length} records`}
                        </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap">{t('date')}</th>
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap">{t('category') || 'Category'}</th>
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap">{t('paymentMethod') || 'Method'}</th>
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incomes.length > 0 ? (
                                    incomes.map((inc) => (
                                        <tr key={inc.id} className="hover:bg-gray-50/80 transition">
                                            <td className="px-3.5 py-2 font-medium text-gray-700 whitespace-nowrap">{isBn ? toBn(inc.income_date) : inc.income_date}</td>
                                            <td className="px-3.5 py-2 font-bold text-gray-800">{inc.category || '—'}</td>
                                            <td className="px-3.5 py-2 text-gray-600 capitalize">{inc.payment_method || '—'}</td>
                                            <td className="px-3.5 py-2 text-right font-bold text-emerald-600 whitespace-nowrap">{fmtMoney(inc.amount)}</td>
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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden p-4">
                    <div className="font-bold text-xs text-gray-900 mb-2.5 flex items-center justify-between">
                        <span>{t('expenseRecords')}</span>
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            {isBn ? `${toBn(expenses.length)} টি রেকর্ড` : `${expenses.length} records`}
                        </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap">{t('date')}</th>
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap">{t('category') || 'Category'}</th>
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap">{t('paymentMethod') || 'Method'}</th>
                                    <th className="px-3.5 py-2 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.length > 0 ? (
                                    expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50/80 transition">
                                            <td className="px-3.5 py-2 font-medium text-gray-700 whitespace-nowrap">{isBn ? toBn(exp.expense_date) : exp.expense_date}</td>
                                            <td className="px-3.5 py-2 font-bold text-gray-800">{exp.category || '—'}</td>
                                            <td className="px-3.5 py-2 text-gray-600 capitalize">{exp.payment_method || '—'}</td>
                                            <td className="px-3.5 py-2 text-right font-bold text-rose-600 whitespace-nowrap">{fmtMoney(exp.amount)}</td>
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

