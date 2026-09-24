import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import axios from 'axios';
import { 
    ShoppingBag, Plus, Search, Filter, RotateCcw, Eye, CreditCard, Edit, Trash2,
    CheckCircle2, Clock, AlertCircle, Calendar, Building2, User, FileText, X, Printer, Receipt,
    Award, ShieldCheck, Scale, Phone, MapPin, Mail, Sparkles, ChevronRight
} from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const gramToVoriAnaRotiPoint = (grams, isBn, toBn, t) => {
    let g = parseFloat(grams || 0);
    if (g <= 0) return isBn ? '০ ভরি ০ আনা ০ রতি ০ পয়েন্ট' : '0 vori 0 ana 0 roti 0 pt';

    const vori = Math.floor(g / 11.664);
    let rem = g % 11.664;

    const ana = Math.floor(rem / 0.729);
    rem = rem % 0.729;

    const roti = Math.floor(rem / 0.1215);
    rem = rem % 0.1215;

    const point = Math.round(rem / 0.01215);

    if (isBn) {
        return `${toBn(vori)} ভরি ${toBn(ana)} আনা ${toBn(roti)} রতি ${toBn(point)} পয়েন্ট`;
    }
    return `${vori} vori ${ana} ana ${roti} roti ${point} pt`;
};

export default function Index({ purchases, suppliers = [], branches = [], filters = {}, stats = {} }) {
    const { flash } = usePage().props;
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [search, setSearch] = useState(filters.search || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // View & Print Purchase Invoice Modal State
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    useFilter(route('purchases.index'), {
        search,
        supplier_id: supplierId,
        status,
        date_from: dateFrom,
        date_to: dateTo,
    });

    const handleReset = () => {
        setSearch('');
        setSupplierId('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
    };

    const paymentBadge = (paid, grand, due) => {
        const paidVal = parseFloat(paid || 0);
        const grandVal = parseFloat(grand || 0);
        const dueVal = parseFloat(due || 0);

        if (dueVal <= 0 && grandVal > 0) {
            return { label: t('Full Paid'), bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
        } else if (paidVal > 0 && dueVal > 0) {
            return { label: t('Partial Payment'), bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock };
        } else {
            return { label: t('Unpaid / Due'), bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertCircle };
        }
    };

    const openViewModal = (purchase) => {
        setSelectedPurchase(purchase);
        setIsViewOpen(true);
    };

    const handleDeletePurchase = (purchase) => {
        if (window.confirm(isBn ? `আপনি কি ক্রয় ইনভয়েস #${toBn(purchase.invoice_no)} ডিলিট করতে চান?` : `Are you sure you want to delete Purchase Invoice #${purchase.invoice_no}?`)) {
            router.delete(route('purchases.destroy', purchase.id), {
                preserveScroll: true,
                onError: (errors) => {
                    alert(errors.error || errors.message || t('Failed to delete purchase invoice.'));
                }
            });
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag className="w-7 h-7 text-[#b17633]" />
                            {t('Purchase')}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">{t('Manage supplier purchases, stock receipts & payment settlements')}</p>
                    </div>

                    <Link
                        href={route('purchases.create')}
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        className="text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:opacity-90 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        {t('Add Purchase')}
                    </Link>
                </div>
            }
        >
            <Head title={t('Purchase')} />

            <div className="space-y-4 pb-12">

                {/* Flash Message Banner */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs animate-fade-in">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm font-bold">{flash.success}</span>
                        </div>
                    </div>
                )}

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-[#b17633] flex items-center justify-center font-bold">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Total Purchases')}</span>
                            <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(stats.total_purchases)) : fmtBDT(stats.total_purchases)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Total Paid Amount')}</span>
                            <h3 className="text-lg font-extrabold text-emerald-700 mt-0.5">
                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(stats.total_paid)) : fmtBDT(stats.total_paid)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('Outstanding Dues')}</span>
                            <h3 className="text-lg font-extrabold text-rose-700 mt-0.5">
                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(stats.total_due)) : fmtBDT(stats.total_due)}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                        {/* Search input */}
                        <div className="sm:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('Search by invoice # or supplier...')}
                                    className="w-full pl-10 pr-4 h-10 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#b17633] focus:ring-1 focus:ring-[#b17633] font-medium"
                                />
                            </div>
                        </div>

                        {/* Supplier filter */}
                        <div>
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="w-full h-10 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#b17633] focus:ring-1 focus:ring-[#b17633] font-semibold text-gray-800"
                            >
                                <option value="">{t('All Suppliers')}</option>
                                {suppliers.map(sup => (
                                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status filter */}
                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-10 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#b17633] focus:ring-1 focus:ring-[#b17633] font-semibold text-gray-800"
                            >
                                <option value="">{t('All Status')}</option>
                                <option value="completed">{t('Completed')}</option>
                                <option value="pending">{t('Pending')}</option>
                                <option value="cancelled">{t('Cancelled')}</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="sm:col-span-2 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 h-10 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> {t('Clear')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Purchases Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-xs text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap rounded-l-lg">{t('Invoice #')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Date')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Supplier')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold whitespace-nowrap">{t('Branch')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-right whitespace-nowrap">{t('Grand Total')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-right whitespace-nowrap">{t('Paid')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-right whitespace-nowrap">{t('Due')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-center whitespace-nowrap">{t('Payment Status')}</th>
                                    <th className="px-3 py-2.5 text-[11px] font-bold text-center whitespace-nowrap rounded-r-lg">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                                {purchases.data.map((p) => {
                                    const badge = paymentBadge(p.paid_amount, p.grand_total, p.due_amount);
                                    return (
                                        <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                                            <td className="px-3 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                <button 
                                                    type="button" 
                                                    onClick={() => openViewModal(p)}
                                                    className="text-[#b17633] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
                                                >
                                                    <Receipt className="w-3.5 h-3.5" />
                                                    {isBn ? toBn(p.invoice_no) : p.invoice_no}
                                                </button>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 text-xs whitespace-nowrap">
                                                {p.purchase_date ? (isBn ? toBn(p.purchase_date) : p.purchase_date) : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">{p.supplier?.name || '-'}</div>
                                                {p.supplier?.company_name && <div className="text-[10px] text-gray-400">{p.supplier.company_name}</div>}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600 text-xs whitespace-nowrap">
                                                {p.branch?.name || '-'}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-extrabold text-gray-900 whitespace-nowrap">
                                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(p.grand_total)) : fmtBDT(p.grand_total)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(p.paid_amount)) : fmtBDT(p.paid_amount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">
                                                {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(p.due_amount)) : fmtBDT(p.due_amount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center justify-center gap-1 w-fit mx-auto ${badge.bg}`}>
                                                    <badge.icon className="w-3 h-3" />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-2.5 py-0.5 border border-[#00b4d8] rounded-full text-[11px] font-semibold text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {t('Actions')}
                                                            <svg className="ml-1 -mr-0.5 h-3 w-3 fill-current" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openViewModal(p);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-indigo-50 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-indigo-600" /> {t('View Details')}
                                                        </button>

                                                        <Link
                                                            href={route('purchases.edit', p.id)}
                                                            className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-blue-50 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
                                                        >
                                                            <Edit className="w-3.5 h-3.5 text-blue-600" /> {t('Edit')}
                                                        </Link>

                                                        <div className="border-t border-gray-100"></div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePurchase(p);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> {t('Delete')}
                                                        </button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {purchases.data.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center py-12 text-gray-400">
                                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" />
                                            <p className="font-bold text-sm text-gray-600">{t('No purchases found')}</p>
                                            <p className="text-xs text-gray-400 mt-1">{t('Record your first stock or raw metal purchase.')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {purchases.links && (
                        <div className="mt-4 border-t border-gray-100 pt-3">
                            <Pagination links={purchases.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* View & Print Modal (Portal to body) */}
            {isViewOpen && selectedPurchase && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-xs animate-fade-in print:p-0 print:block print:bg-white print:static">
                    <div className="min-h-screen px-4 text-center flex items-center justify-center p-0 print:block">
                        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-left align-middle border border-amber-500/20 my-8 print:my-0 print:shadow-none print:border-none print:w-full print:rounded-none">
                            
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700 px-6 py-4 flex items-center justify-between text-white shadow-md print:hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg tracking-wide">{t('Purchase Invoice')}</h3>
                                        <p className="text-xs text-amber-100 font-mono">#{isBn ? toBn(selectedPurchase.invoice_no) : selectedPurchase.invoice_no}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="button" 
                                        onClick={handlePrintInvoice}
                                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                        className="px-4 py-2 text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                                    >
                                        <Printer className="w-4 h-4" /> {t('Print')}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsViewOpen(false)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Printable Content */}
                            <div className="p-8 space-y-6 print:p-4 text-gray-800">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-amber-900 tracking-tight flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-amber-600" />
                                            Jewelry ERP
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">{t('Official Purchase Receipt & Stock Transfer Note')}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs uppercase font-extrabold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                                            {selectedPurchase.branch?.name || t('Main Branch')}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-2 font-mono">
                                            {t('Date')}: {isBn ? toBn(selectedPurchase.purchase_date) : selectedPurchase.purchase_date}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                                    <div>
                                        <span className="font-bold text-gray-400 uppercase text-[10px]">{t('Supplier Details')}</span>
                                        <h4 className="font-bold text-gray-900 text-sm mt-0.5">{selectedPurchase.supplier?.name}</h4>
                                        <p className="text-gray-500">{selectedPurchase.supplier?.company_name || '—'}</p>
                                        <p className="text-gray-500">{selectedPurchase.supplier?.phone || ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-400 uppercase text-[10px]">{t('Payment Method')}</span>
                                        <h4 className="font-bold text-gray-900 text-sm capitalize mt-0.5">{t(selectedPurchase.payment_method || 'Cash')}</h4>
                                        <p className="text-gray-500 mt-1">
                                            {t('Status')}: <span className="font-bold capitalize">{t(selectedPurchase.status || 'Completed')}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-[#e68a1d] text-white">
                                            <tr>
                                                <th className="p-3">{t('Product / Item')}</th>
                                                <th className="p-3 text-center">{t('Weight')}</th>
                                                <th className="p-3 text-center">{t('Purity')}</th>
                                                <th className="p-3 text-right">{t('Rate')}</th>
                                                <th className="p-3 text-right">{t('Qty')}</th>
                                                <th className="p-3 text-right">{t('Total (BDT)')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 font-medium">
                                            {selectedPurchase.items?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-amber-50/20">
                                                    <td className="p-3">
                                                        <div className="font-bold text-gray-900">{item.item_name || item.product?.name}</div>
                                                        <div className="text-[10px] text-gray-400 capitalize">{t(item.metal_type)} • {t(item.stock_type || 'readymade')}</div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div>{isBn ? toBn(parseFloat(item.gross_weight || 0)) : parseFloat(item.gross_weight || 0)} {isBn ? 'গ্রাম' : 'g'}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">
                                                            {gramToVoriAnaRotiPoint(item.gross_weight, isBn, toBn, t)}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="font-bold text-gray-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                            {item.purity?.name ? (isBn ? toBn(item.purity.name) : item.purity.name) : (item.metal_type?.toUpperCase() || '—')}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(item.rate_per_gram || item.rate_per_vori)) : fmtBDT(item.rate_per_gram || item.rate_per_vori)}
                                                    </td>
                                                    <td className="p-3 text-right font-bold">{isBn ? toBn(item.quantity) : item.quantity}</td>
                                                    <td className="p-3 text-right font-extrabold text-gray-900">
                                                        {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(item.total_amount)) : fmtBDT(item.total_amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Financial Summary */}
                                <div className="flex justify-end">
                                    <div className="w-72 bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                                        <div className="flex justify-between text-gray-600">
                                            <span>{t('Subtotal')}:</span>
                                            <span className="font-semibold">{isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedPurchase.subtotal)) : fmtBDT(selectedPurchase.subtotal)}</span>
                                        </div>
                                        {Number(selectedPurchase.discount) > 0 && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>{t('Discount')}:</span>
                                                <span>-{isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedPurchase.discount)) : fmtBDT(selectedPurchase.discount)}</span>
                                            </div>
                                        )}
                                        {Number(selectedPurchase.tax) > 0 && (
                                            <div className="flex justify-between text-gray-600">
                                                <span>{t('Tax')}:</span>
                                                <span>+{isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedPurchase.tax)) : fmtBDT(selectedPurchase.tax)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-sm text-gray-900">
                                            <span>{t('Grand Total')}:</span>
                                            <span>{isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedPurchase.grand_total)) : fmtBDT(selectedPurchase.grand_total)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-700 font-bold">
                                            <span>{t('Paid Amount')}:</span>
                                            <span>{isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedPurchase.paid_amount)) : fmtBDT(selectedPurchase.paid_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-rose-700 font-bold border-t border-gray-200 pt-1">
                                            <span>{t('Due Balance')}:</span>
                                            <span>{isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedPurchase.due_amount)) : fmtBDT(selectedPurchase.due_amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedPurchase.notes && (
                                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-xs text-amber-900">
                                        <span className="font-bold">{t('Notes')}:</span> {selectedPurchase.notes}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>,
                document.body
            )}

        </AuthenticatedLayout>
    );
}
