import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import { 
    Calendar, Printer, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, RotateCcw, Filter, CheckCircle2
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import AccountReportsNav from './Components/AccountReportsNav';

export default function DayBook({ 
    transactions = [], 
    summary = {}, 
    branches = [], 
    filters = {} 
}) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [paymentCategory, setPaymentCategory] = useState(filters.payment_category || '');

    useFilter(route('reports.day-book'), {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        payment_category: paymentCategory,
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
        setBranchId('');
        setPaymentCategory('');
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
                            <Calendar className="w-6 h-6" style={{ color: 'rgb(177, 118, 51)' }} />
                            {t('dayBook') || 'Day Book'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">{t('chronologicalFinancialMovement') || 'Complete daily financial transaction register & audit ledger'}</p>
                    </div>

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
            <Head title={t('dayBook') || 'Day Book'} />

            {/* Account Reports Navigation */}
            <AccountReportsNav activeTab="day-book" />

            {/* Print Letterhead */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">{t('dayBook') || 'Day Book'} (Daily Transaction Register)</h2>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('branch') || 'Outlet / Branch'}</label>
                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        >
                            <option value="">{t('allBranches') || 'All Outlets'}</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('paymentMethod') || 'Payment Mode'}</label>
                        <select
                            value={paymentCategory}
                            onChange={(e) => setPaymentCategory(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        >
                            <option value="">{t('allModes') || 'All Modes (Cash, Bank, Mobile)'}</option>
                            <option value="cash">{t('cash') || 'Cash in Hand'}</option>
                            <option value="bank">{t('bank') || 'Bank Accounts'}</option>
                            <option value="mobile">{t('mobileBanking') || 'Mobile Banking (bKash/Nagad)'}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Fresh Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-2xs">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('openingBalance') || 'Opening Balance'}</p>
                    <p className="text-lg font-black text-gray-900 mt-1.5">{fmtMoney(summary.opening_balance)}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{t('startOfPeriod') || 'Start of selected period'}</p>
                </div>

                <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{t('totalInflow') || 'Total Inflows'}</p>
                        <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                    <p className="text-lg font-black text-emerald-700 mt-1.5">{fmtMoney(summary.total_inflow)}</p>
                    <p className="text-[10px] text-emerald-600 mt-1">{t('allReceipts') || 'Collections & Income'}</p>
                </div>

                <div className="bg-white border border-rose-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">{t('totalOutflow') || 'Total Outflows'}</p>
                        <span className="p-1 rounded-md bg-rose-50 text-rose-700">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                    <p className="text-lg font-black text-rose-700 mt-1.5">{fmtMoney(summary.total_outflow)}</p>
                    <p className="text-[10px] text-rose-600 mt-1">{t('allDisbursements') || 'Payments & Expenses'}</p>
                </div>

                <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-2xs">
                    <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">{t('netMovement') || 'Net Flow'}</p>
                    <p className={`text-lg font-black mt-1.5 ${summary.net_movement >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {fmtMoney(summary.net_movement)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{summary.net_movement >= 0 ? 'Net Inflow Gain' : 'Net Outflow Deficit'}</p>
                </div>

                <div className="bg-white border border-blue-200 p-4 rounded-2xl shadow-2xs bg-blue-50/20">
                    <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">{t('closingBalance') || 'Closing Balance'}</p>
                    <p className="text-lg font-black text-blue-950 mt-1.5">{fmtMoney(summary.closing_balance)}</p>
                    <p className="text-[10px] text-blue-700 mt-1">{isBn ? `${toBn(transactions.length)} টি লেনদেন` : `${transactions.length} entries`}</p>
                </div>
            </div>

            {/* Day Book Table Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4 pb-24 overflow-x-visible">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{t('dayBookLedger') || 'Day Book Ledger Register'}</h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {isBn ? `রেকর্ড: ${toBn(transactions.length)}` : `Entries: ${transactions.length}`}
                    </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('date') || 'Date'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('voucherNo') || 'Voucher / Ref'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('type') || 'Type'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('particulars') || 'Particulars / Party'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('mode') || 'Mode'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right text-emerald-100">{t('inflowReceipt') || 'Inflow (Debit)'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right text-rose-100">{t('outflowPayment') || 'Outflow (Credit)'}</th>
                                <th className="px-3.5 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('balance') || 'Balance'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                                        <td className="px-3.5 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                                            <div>{isBn ? toBn(tx.date) : tx.date}</div>
                                            {tx.time && tx.time !== '00:00' && (
                                                <div className="text-[10px] text-gray-400">{isBn ? toBn(tx.time) : tx.time}</div>
                                            )}
                                        </td>
                                        <td className="px-3.5 py-2.5 font-mono text-[11px] font-semibold text-gray-800 whitespace-nowrap">
                                            {tx.voucher_no || '—'}
                                        </td>
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                                tx.debit > 0 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                            }`}>
                                                {tx.type_label || tx.type}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2.5 font-medium text-gray-800">
                                            <div>{tx.particulars}</div>
                                            {tx.notes && (
                                                <div className="text-[10px] text-gray-400 italic">{tx.notes}</div>
                                            )}
                                        </td>
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 capitalize">
                                                {tx.payment_method_label || tx.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                                            {tx.debit > 0 ? fmtMoney(tx.debit) : '—'}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">
                                            {tx.credit > 0 ? fmtMoney(tx.credit) : '—'}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap bg-gray-50/40">
                                            {fmtMoney(tx.balance)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400">
                                        {t('noTransactionsFound') || 'No transactions found for the selected period.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {transactions.length > 0 && (
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                                <tr>
                                    <td colSpan="5" className="px-3.5 py-2.5 text-right uppercase text-gray-700">
                                        {t('total') || 'Total'}:
                                    </td>
                                    <td className="px-3.5 py-2.5 text-right text-emerald-700 whitespace-nowrap">
                                        {fmtMoney(summary.total_inflow)}
                                    </td>
                                    <td className="px-3.5 py-2.5 text-right text-rose-700 whitespace-nowrap">
                                        {fmtMoney(summary.total_outflow)}
                                    </td>
                                    <td className="px-3.5 py-2.5 text-right text-blue-900 whitespace-nowrap">
                                        {fmtMoney(summary.closing_balance)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

