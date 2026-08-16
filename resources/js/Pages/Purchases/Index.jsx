import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import axios from 'axios';
import { 
    ShoppingBag, Plus, Search, Filter, RotateCcw, Eye, CreditCard, Edit, Trash2,
    CheckCircle2, Clock, AlertCircle, Calendar, Building2, User, FileText, X, Printer, Receipt,
    Award, ShieldCheck, Scale, Phone, MapPin, Mail, Sparkles, ChevronRight
} from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const gramToVoriAnaRotiPoint = (grams) => {
    let g = parseFloat(grams || 0);
    if (g <= 0) return '0 vori 0 ana 0 roti 0 pt';

    const vori = Math.floor(g / 11.664);
    let rem = g % 11.664;

    const ana = Math.floor(rem / 0.729);
    rem = rem % 0.729;

    const roti = Math.floor(rem / 0.1215);
    rem = rem % 0.1215;

    const point = Math.round(rem / 0.01215);

    return `${vori} vori ${ana} ana ${roti} roti ${point} pt`;
};

const paymentBadge = (paid, grand, due) => {
    const paidVal = parseFloat(paid || 0);
    const grandVal = parseFloat(grand || 0);
    const dueVal = parseFloat(due || 0);

    if (dueVal <= 0 && grandVal > 0) {
        return { label: 'Full Paid', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
    } else if (paidVal > 0 && dueVal > 0) {
        return { label: 'Partial Payment', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock };
    } else {
        return { label: 'Unpaid / Due', bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertCircle };
    }
};

export default function Index({ purchases, suppliers = [], branches = [], filters = {}, stats = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // View & Print Purchase Invoice Modal State
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('purchases.index'), {
            search,
            supplier_id: supplierId,
            status,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setSupplierId('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(route('purchases.index'), {}, { preserveState: true });
    };

    const openViewModal = (purchase) => {
        setSelectedPurchase(purchase);
        setIsViewOpen(true);
    };

    const handleDeletePurchase = (purchase) => {
        if (window.confirm(`Are you sure you want to delete Purchase Invoice #${purchase.invoice_no}?`)) {
            router.delete(route('purchases.destroy', purchase.id), {
                preserveScroll: true,
                onError: (errors) => {
                    alert(errors.error || errors.message || 'Failed to delete purchase invoice.');
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
                            <ShoppingBag className="w-7 h-7 text-[#E88A1A]" />
                            Purchase
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage supplier purchases, stock receipts & payment settlements</p>
                    </div>

                    <Link
                        href={route('purchases.create')}
                        className="bg-gradient-to-r from-[#E88A1A] to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </Link>
                </div>
            }
        >
            <Head title="Purchase" />

            <div className="space-y-6">

                {/* Flash Message Banner */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm font-bold">{flash.success}</span>
                        </div>
                    </div>
                )}

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#E88A1A] flex items-center justify-center font-bold">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Purchases</span>
                            <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">৳ {fmtBDT(stats.total_purchases)}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Paid Amount</span>
                            <h3 className="text-xl font-extrabold text-emerald-700 mt-0.5">৳ {fmtBDT(stats.total_paid)}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Outstanding Dues</span>
                            <h3 className="text-xl font-extrabold text-rose-700 mt-0.5">৳ {fmtBDT(stats.total_due)}</h3>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                        {/* Search input */}
                        <div className="sm:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by invoice # or supplier..."
                                    className="w-full pl-10 pr-4 h-10 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E88A1A] focus:ring-1 focus:ring-[#E88A1A] font-medium"
                                />
                            </div>
                        </div>

                        {/* Supplier filter */}
                        <div>
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="w-full h-10 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E88A1A] focus:ring-1 focus:ring-[#E88A1A] font-semibold text-gray-800"
                            >
                                <option value="">All Suppliers</option>
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
                                className="w-full h-10 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E88A1A] focus:ring-1 focus:ring-[#E88A1A] font-semibold text-gray-800"
                            >
                                <option value="">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="sm:col-span-2 flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 h-10 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="h-10 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors flex items-center justify-center"
                                title="Reset filters"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Purchases Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pb-16">
                    <div className="overflow-visible">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#E88A1A] text-white">
                                <tr>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Invoice #</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Date</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Supplier</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Branch</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Grand Total</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Paid</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Due</th>
                                    <th className="px-4 py-3.5 font-bold text-center whitespace-nowrap">Payment Status</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap rounded-tr-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchases.data.map((p) => {
                                    const badge = paymentBadge(p.paid_amount, p.grand_total, p.due_amount);
                                    return (
                                        <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                                            <td className="px-4 py-3.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                                <button 
                                                    type="button" 
                                                    onClick={() => openViewModal(p)}
                                                    className="text-[#E88A1A] hover:underline flex items-center gap-1.5 font-extrabold"
                                                >
                                                    <Receipt className="w-3.5 h-3.5" />
                                                    {p.invoice_no}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                                                {p.purchase_date}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-gray-900">{p.supplier?.name || '-'}</div>
                                                <div className="text-xs text-gray-400">{p.supplier?.company_name || ''}</div>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                                                {p.branch?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-extrabold text-gray-900 whitespace-nowrap">
                                                ৳ {fmtBDT(p.grand_total)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                                                ৳ {fmtBDT(p.paid_amount)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-rose-600 whitespace-nowrap">
                                                ৳ {fmtBDT(p.due_amount)}
                                            </td>
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center justify-center gap-1 w-fit mx-auto ${badge.bg}`}>
                                                    <badge.icon className="w-3 h-3" />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3.5 py-1.5 border border-[#00b4d8] rounded-xl text-xs font-bold text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 transition-colors shadow-sm"
                                                        >
                                                            Actions
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" className="w-48 py-1.5 bg-white shadow-xl rounded-xl border border-gray-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => openViewModal(p)}
                                                            className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-indigo-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4 text-indigo-600" /> View
                                                        </button>

                                                        <Link
                                                            href={route('purchases.edit', p.id)}
                                                            className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-blue-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" /> Edit
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePurchase(p)}
                                                            className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-600" /> Delete
                                                        </button>

                                                        <Link
                                                            href={route('purchases.returns', { purchase_id: p.id })}
                                                            className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                                                        >
                                                            <RotateCcw className="w-4 h-4 text-amber-600" /> Return
                                                        </Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {purchases.data.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-12 text-center text-gray-400 font-medium">
                                            No purchases found matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100">
                        <Pagination links={purchases.links} from={purchases.from} to={purchases.to} total={purchases.total} />
                    </div>
                </div>

            </div>

            {/* ── PERFECT LUXURY PURCHASE INVOICE MODAL POPUP ── */}
            {isViewOpen && selectedPurchase && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:block print:bg-white print:static">
                    
                    {/* CSS Rules specifically injected for clean A4 printout */}
                    <style>{`
                        @media print {
                            @page {
                                size: A4 portrait;
                                margin: 8mm;
                            }
                            body {
                                background-color: #ffffff !important;
                                color: #000000 !important;
                            }
                            body * {
                                visibility: hidden !important;
                            }
                            #printable-purchase-invoice, #printable-purchase-invoice * {
                                visibility: visible !important;
                            }
                            #printable-purchase-invoice {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                box-shadow: none !important;
                                border: none !important;
                                background: #ffffff !important;
                            }
                            .print-hide {
                                display: none !important;
                            }
                        }
                    `}</style>

                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center print:p-0 print:block">
                        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-left align-middle border border-amber-500/20 my-8 print:my-0 print:shadow-none print:border-none print:w-full print:rounded-none">
                        
                        {/* Modal Action Header (Hidden on Print) */}
                        <div className="bg-gradient-to-r from-amber-600 via-[#E88A1A] to-orange-500 px-6 py-4 flex items-center justify-between text-white shadow-md print-hide">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                                    <Receipt className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                                        Purchase Invoice #{selectedPurchase.invoice_no}
                                    </h3>
                                    <p className="text-xs text-white/80">Official Supplier Inventory Purchase Receipt</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {Number(selectedPurchase.due_amount) > 0 && (
                                    <Link
                                        href={route('purchases.payments')}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                                    >
                                        <CreditCard className="w-3.5 h-3.5" /> Pay Due Balance
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={handlePrintInvoice}
                                    className="bg-white text-gray-900 hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4 text-[#E88A1A]" /> Print Invoice
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsViewOpen(false)}
                                    className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Sheet Container */}
                        <div id="printable-purchase-invoice" className="p-8 sm:p-10 space-y-8 bg-white text-gray-900 print:p-4 print:space-y-6">
                            
                            {/* 1. Header Banner & Store Identity */}
                            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-amber-500/30 pb-6 gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-[#E88A1A]" />
                                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">JEWELRY ERP STORE</h1>
                                    </div>
                                    <p className="text-xs font-bold text-[#E88A1A] tracking-wider uppercase mt-0.5">
                                        Branch: {selectedPurchase.branch?.name || 'Head Office'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                        Official Gold & Jewelry Purchase Invoice & Supplier Stock Inward Receipt
                                    </p>
                                </div>

                                <div className="text-right sm:text-right w-full sm:w-auto bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
                                    <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest block">PURCHASE INVOICE NO</span>
                                    <span className="text-2xl font-mono font-black text-[#E88A1A]">{selectedPurchase.invoice_no}</span>
                                    <div className="text-xs text-gray-600 mt-1.5 space-y-0.5">
                                        <p><span className="font-semibold text-gray-500">Date:</span> <span className="font-bold text-gray-900">{selectedPurchase.purchase_date}</span></p>
                                        <p><span className="font-semibold text-gray-500">Created By:</span> <span className="font-bold text-gray-800">{selectedPurchase.creator?.name || 'Admin'}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Supplier Info & Branch Info Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                                    <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" /> SUPPLIER DETAILS
                                    </span>
                                    <h4 className="text-base font-extrabold text-gray-900">{selectedPurchase.supplier?.name || 'Walk-in Supplier'}</h4>
                                    {selectedPurchase.supplier?.company_name && (
                                        <p className="text-xs font-bold text-gray-700 mt-0.5">{selectedPurchase.supplier.company_name}</p>
                                    )}
                                    <div className="text-xs text-gray-600 mt-2 space-y-1">
                                        <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> {selectedPurchase.supplier?.phone || 'N/A'}</p>
                                        {selectedPurchase.supplier?.email && (
                                            <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400" /> {selectedPurchase.supplier.email}</p>
                                        )}
                                        {selectedPurchase.supplier?.address && (
                                            <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" /> {selectedPurchase.supplier.address}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-right sm:text-right">
                                    <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider block mb-2 flex items-center justify-end gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> RECEIVING INVENTORY BRANCH
                                    </span>
                                    <h4 className="text-base font-extrabold text-gray-900">{selectedPurchase.branch?.name || 'Main Branch'}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Status: <span className="font-extrabold text-emerald-700 uppercase px-2 py-0.5 bg-emerald-100 rounded-md">{selectedPurchase.status}</span></p>
                                    <div className="mt-3 pt-2 border-t border-gray-200 text-xs">
                                        <span className="text-gray-500">Payment Status: </span>
                                        <span className="font-extrabold text-gray-900 uppercase">
                                            {Number(selectedPurchase.due_amount) <= 0 ? 'Full Paid' : Number(selectedPurchase.paid_amount) > 0 ? 'Partial Payment' : 'Unpaid / Due'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Itemized Jewelry Purchase Breakdown Table */}
                            <div>
                                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-[#E88A1A]" />
                                    Purchased Jewelry Breakdown
                                </h4>
                                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-[#E88A1A] text-white font-bold uppercase">
                                            <tr>
                                                <th className="p-3 text-center w-10">#</th>
                                                <th className="p-3">Item / Description</th>
                                                <th className="p-3 text-center">Purity & Hallmark</th>
                                                <th className="p-3 text-right">Net Weight</th>
                                                <th className="p-3 text-right">Traditional Weight</th>
                                                <th className="p-3 text-right">Rate / Gm</th>
                                                <th className="p-3 text-right">Making / Stone</th>
                                                <th className="p-3 text-center">Qty</th>
                                                <th className="p-3 text-right">Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {selectedPurchase.items?.map((item, idx) => {
                                                const itemName = item.product?.name || item.item_name || (item.metal_type ? `${item.metal_type.toUpperCase()} Item` : 'Jewelry Item');
                                                const purityName = item.purity?.name || (item.metal_type ? item.metal_type.toUpperCase() : '-');
                                                const tradWeight = gramToVoriAnaRotiPoint(item.net_weight);

                                                return (
                                                    <tr key={item.id || idx} className="hover:bg-amber-50/30">
                                                        <td className="p-3 text-center font-bold text-gray-400">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-gray-900">{itemName}</div>
                                                            {item.category && (
                                                                <div className="text-[11px] text-gray-500">{item.category.name}</div>
                                                            )}
                                                            {item.stock_type && (
                                                                <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                                                    {item.stock_type.toUpperCase()}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center font-semibold text-gray-700">
                                                            <div className="font-bold text-gray-900">{purityName}</div>
                                                            {item.hallmark_no && (
                                                                <div className="text-[10px] font-mono text-gray-500">HM: {item.hallmark_no}</div>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-gray-900">
                                                            {Number(item.net_weight).toFixed(3)} g
                                                            {Number(item.stone_weight) > 0 && (
                                                                <div className="text-[10px] text-gray-400">Gr: {Number(item.gross_weight).toFixed(3)}g</div>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-xs font-extrabold text-[#E88A1A]">
                                                            {tradWeight}
                                                        </td>
                                                        <td className="p-3 text-right font-mono">
                                                            ৳ {fmtBDT(item.rate_per_gram)}
                                                            <div className="text-[10px] text-gray-400">৳ {fmtBDT(Number(item.rate_per_gram) * 11.664)}/v</div>
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-gray-700">
                                                            ৳ {fmtBDT(Number(item.making_charge || 0) + Number(item.stone_charge || 0))}
                                                            {Number(item.wastage_percentage) > 0 && (
                                                                <div className="text-[10px] text-emerald-600">Wastage: {item.wastage_percentage}%</div>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-gray-900">{item.quantity}</td>
                                                        <td className="p-3 text-right font-extrabold text-gray-900">৳ {fmtBDT(item.total_amount)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 4. Billing & Financial Summary Box */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-gray-200 pt-4">
                                <div className="text-xs text-gray-600 space-y-2 max-w-sm w-full">
                                    <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                                        <p className="font-bold text-amber-900 uppercase text-[11px] mb-1">Notes & Remarks</p>
                                        <p className="italic text-gray-700 text-xs">{selectedPurchase.notes || 'No remarks recorded for this purchase invoice.'}</p>
                                    </div>

                                    {/* Payment Log snippet if exists */}
                                    {selectedPurchase.payments && selectedPurchase.payments.length > 0 && (
                                        <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                                            <p className="font-bold text-gray-800 text-[11px] uppercase mb-1 flex items-center gap-1">
                                                <CreditCard className="w-3 h-3 text-emerald-600" /> Payment History
                                            </p>
                                            <div className="space-y-1">
                                                {selectedPurchase.payments.map(pmt => (
                                                    <div key={pmt.id} className="flex justify-between text-[11px]">
                                                        <span className="text-gray-600">{pmt.payment_date} ({pmt.payment_method?.toUpperCase()}):</span>
                                                        <span className="font-bold text-emerald-700">৳ {fmtBDT(pmt.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full sm:w-72 space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-600 py-0.5">
                                        <span>Items Subtotal:</span>
                                        <span className="font-bold text-gray-900">৳ {fmtBDT(selectedPurchase.subtotal)}</span>
                                    </div>
                                    {Number(selectedPurchase.discount) > 0 && (
                                        <div className="flex justify-between text-rose-600 py-0.5">
                                            <span>Discount:</span>
                                            <span className="font-bold">- ৳ {fmtBDT(selectedPurchase.discount)}</span>
                                        </div>
                                    )}
                                    {Number(selectedPurchase.tax) > 0 && (
                                        <div className="flex justify-between text-gray-600 py-0.5">
                                            <span>VAT / Tax:</span>
                                            <span className="font-bold text-gray-900">+ ৳ {fmtBDT(selectedPurchase.tax)}</span>
                                        </div>
                                    )}
                                    {Number(selectedPurchase.other_charges) > 0 && (
                                        <div className="flex justify-between text-gray-600 py-0.5">
                                            <span>Other Charges:</span>
                                            <span className="font-bold text-gray-900">+ ৳ {fmtBDT(selectedPurchase.other_charges)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-base font-black text-gray-900 border-t-2 border-gray-300 pt-2 pb-1">
                                        <span>Grand Total:</span>
                                        <span className="text-[#E88A1A]">৳ {fmtBDT(selectedPurchase.grand_total)}</span>
                                    </div>

                                    {/* Highlighted Paid Box */}
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-900">
                                        <span>Total Paid Amount:</span>
                                        <span className="text-sm font-extrabold">৳ {fmtBDT(selectedPurchase.paid_amount)}</span>
                                    </div>

                                    {/* Highlighted Due Box */}
                                    <div className={`p-3 rounded-xl border flex justify-between items-center text-xs font-bold ${Number(selectedPurchase.due_amount) > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                        <span>Outstanding Due Balance:</span>
                                        <span className="text-sm font-extrabold">৳ {fmtBDT(selectedPurchase.due_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Signature Blocks for Official Paper Record */}
                            <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs font-bold text-gray-600">
                                <div>
                                    <div className="border-b border-gray-400 w-40 mx-auto mb-2"></div>
                                    <p>Supplier Signature & Stamp</p>
                                </div>
                                <div>
                                    <div className="border-b border-gray-400 w-40 mx-auto mb-2"></div>
                                    <p>Authorized Manager Signature</p>
                                </div>
                            </div>

                            {/* 6. Footer Note */}
                            <div className="border-t border-gray-200 pt-3 text-center text-[10px] text-gray-400">
                                Computer generated purchase invoice receipt. Valid with authorized stamp. Thank you for your business.
                            </div>

                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )}
    </AuthenticatedLayout>
    );
}
