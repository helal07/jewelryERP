import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import { 
    PieChart, Printer, TrendingUp, TrendingDown, DollarSign, 
    Filter, RotateCcw, Package, Search
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';
import AccountReportsNav from './Components/AccountReportsNav';

export default function ProfitLoss({ 
    products = { data: [] }, 
    summary = {}, 
    categories = [],
    purities = [],
    branches = [], 
    filters = {} 
}) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [purityId, setPurityId] = useState(filters.purity_id || '');
    const [search, setSearch] = useState(filters.search || '');

    useFilter(route('reports.profit-loss'), {
        start_date: startDate,
        end_date: endDate,
        branch_id: branchId,
        category_id: categoryId,
        purity_id: purityId,
        search: search,
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
        setCategoryId('');
        setPurityId('');
        setSearch('');
    };

    const fmtMoney = (val) => {
        const formatted = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(formatted)}` : `BDT ${formatted}`;
    };

    const fmtNum = (val, decimals = 3) => {
        const num = Number(val || 0).toFixed(decimals);
        return isBn ? toBn(num) : num;
    };

    const productList = products.data || [];
    const isProfitTotal = summary.total_profit_loss >= 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <PieChart className="w-6 h-6" style={{ color: 'rgb(177, 118, 51)' }} />
                            {t('profitLoss') || 'Profit & Loss'}
                        </h2>
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
            <Head title={t('profitLoss') || 'Profit & Loss'} />

            {/* Account Reports Navigation */}
            <AccountReportsNav activeTab="profit-loss" />

            {/* Print Header */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">{t('profitLoss') || 'Profit & Loss'}</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        {startDate && endDate && (
                            <p>{isBn ? toBn(startDate) : startDate} - {isBn ? toBn(endDate) : endDate}</p>
                        )}
                        <p>{isBn ? toBn(new Date().toLocaleDateString()) : new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-4 mb-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                        <Filter className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('filter') || 'Filter'}:</span>
                    </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('startDate') || 'From'}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('endDate') || 'To'}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('category') || 'Category'}</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        >
                            <option value="">{t('allCategories') || 'All Categories'}</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('purity') || 'Purity'}</label>
                        <select
                            value={purityId}
                            onChange={(e) => setPurityId(e.target.value)}
                            className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 px-3"
                        >
                            <option value="">{t('allPurities') || 'All Purities'}</option>
                            {purities.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('branch') || 'Outlet'}</label>
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
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">{t('search') || 'Search'}</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder') || 'SKU, name, barcode...'}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-xs rounded-xl border-gray-200 focus:ring-amber-500 focus:border-amber-500 py-2 pl-8 pr-3"
                            />
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Fresh Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
                {/* 1. Ready Stock */}
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('readyStock') || 'Ready Stock'}</p>
                        <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xl font-black text-gray-900 mt-1.5">
                        {isBn ? `${toBn(summary.total_products_count)} টি` : `${summary.total_products_count || 0} Pcs`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">
                        {fmtNum(summary.total_weight_gm)} gm <span className="text-gray-400 font-normal">({fmtNum(summary.total_weight_vori)} vori)</span>
                    </p>
                </div>

                {/* 2. Total Cost */}
                <div className="bg-white border border-rose-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">{t('costPrice') || 'Total Cost'}</p>
                        <TrendingDown className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-xl font-black text-rose-900 mt-1.5">{fmtMoney(summary.total_cost_value)}</p>
                    <p className="text-xs text-rose-600/80 mt-1 font-medium">
                        {t('costValuation') || 'Cost valuation'}
                    </p>
                </div>

                {/* 3. Selling / Market Value */}
                <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{t('sellingValue') || 'Selling Value'}</p>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xl font-black text-emerald-900 mt-1.5">{fmtMoney(summary.total_selling_value)}</p>
                    <p className="text-xs text-emerald-600/80 mt-1 font-medium">
                        {t('marketValuation') || 'Market valuation'}
                    </p>
                </div>

                {/* 4. Total Profit / (Loss) */}
                <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-2xs bg-gradient-to-b from-white to-amber-50/20">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{t('profitLoss') || 'Profit / Loss'}</p>
                        <DollarSign className="w-4 h-4" style={{ color: 'rgb(177, 118, 51)' }} />
                    </div>
                    <p className={`text-xl font-black mt-1.5 ${isProfitTotal ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isProfitTotal ? '+' : ''}{fmtMoney(summary.total_profit_loss)}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-gray-500">{t('margin') || 'Margin'}:</span>
                        <span className={`font-bold ${isProfitTotal ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {summary.overall_margin_percent >= 0 ? '+' : ''}{isBn ? toBn(summary.overall_margin_percent) : summary.overall_margin_percent}%
                        </span>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-x-visible pb-24 mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap">{t('codeSku') || 'Code / SKU'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap">{t('productName') || 'Product Name'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap">{t('category') || 'Category'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap">{t('purity') || 'Purity'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('netWeight') || 'Net Weight'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('costPrice') || 'Cost Price'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('sellingValue') || 'Selling Value'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('profitLoss') || 'Profit / Loss'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap text-center">{t('margin') || 'Margin'}</th>
                                <th className="px-3.5 py-3 text-[11px] font-bold uppercase whitespace-nowrap">{t('branch') || 'Outlet'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {productList.length > 0 ? (
                                productList.map((p) => {
                                    const isProfit = p.profit_loss_amount >= 0;
                                    return (
                                        <tr key={p.id} className="hover:bg-amber-50/30 transition">
                                            <td className="px-3.5 py-2.5 whitespace-nowrap font-bold text-gray-900">
                                                {p.sku}
                                            </td>
                                            <td className="px-3.5 py-2.5 whitespace-nowrap font-bold text-gray-800">
                                                {p.name}
                                            </td>
                                            <td className="px-3.5 py-2.5 whitespace-nowrap text-gray-700">
                                                {p.category_name}
                                            </td>
                                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                    {p.purity_name}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap font-medium text-gray-700">
                                                {fmtNum(p.net_weight)} gm <span className="text-[10px] text-gray-400">({fmtNum(p.net_weight_vori)} vori)</span>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap font-medium text-gray-700">
                                                {fmtMoney(p.cost_price)}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap font-bold text-gray-900">
                                                {fmtMoney(p.selling_value)}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                                <span className={`font-black text-xs ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {isProfit ? '+' : ''}{fmtMoney(p.profit_loss_amount)}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                                    isProfit 
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                        : 'bg-rose-50 text-rose-800 border-rose-200'
                                                }`}>
                                                    {isProfit ? '+' : ''}{isBn ? toBn(p.margin_percent) : p.margin_percent}%
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2.5 whitespace-nowrap text-gray-600">
                                                {p.branch_name}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" className="p-8 text-center text-gray-400">
                                        <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        {t('noData') || 'No records found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {productList.length > 0 && (
                            <tfoot>
                                <tr className="bg-amber-100/70 font-black text-gray-900 border-t-2 border-amber-300">
                                    <td colSpan="4" className="px-3.5 py-3 uppercase tracking-wider text-xs">
                                        {t('total') || 'Total'} ({isBn ? `${toBn(summary.total_products_count)} টি` : `${summary.total_products_count || 0} Items`})
                                    </td>
                                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                                        {fmtNum(summary.total_weight_gm)} gm <span className="text-[10px] text-gray-600 font-semibold">({fmtNum(summary.total_weight_vori)} vori)</span>
                                    </td>
                                    <td className="px-3.5 py-3 text-right whitespace-nowrap text-rose-950 font-black">
                                        {fmtMoney(summary.total_cost_value)}
                                    </td>
                                    <td className="px-3.5 py-3 text-right whitespace-nowrap text-emerald-950 font-black">
                                        {fmtMoney(summary.total_selling_value)}
                                    </td>
                                    <td className="px-3.5 py-3 text-right whitespace-nowrap text-amber-950 font-black">
                                        {summary.total_profit_loss >= 0 ? '+' : ''}{fmtMoney(summary.total_profit_loss)}
                                    </td>
                                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                                        <span className="font-bold text-amber-900">
                                            {summary.overall_margin_percent >= 0 ? '+' : ''}{isBn ? toBn(summary.overall_margin_percent) : summary.overall_margin_percent}%
                                        </span>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                <Pagination 
                    links={products.links} 
                    from={products.from} 
                    to={products.to} 
                    total={products.total} 
                />
            </div>
        </AuthenticatedLayout>
    );
}
