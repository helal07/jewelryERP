import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import { 
    CreditCard, CheckCircle2, Calendar, 
    FileText, User, DollarSign, X, Printer, Receipt,
    Sparkles, Award, Phone, MapPin, Mail, Eye, Search, Filter, RotateCcw, AlertCircle, Building2, ShoppingBag
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

export default function Payments({ duePurchases, suppliers = [], branches = [], filters = {} }) {
    const { flash } = usePage().props;
    
    // Filter state
    const [search, setSearch] = useState(filters.search || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');

    // Payment Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    // Direct Printable Purchase Invoice Modal State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        purchase_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'cash',
        reference_no: '',
        notes: '',
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('purchases.payments'), {
            search,
            supplier_id: supplierId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleResetFilters = () => {
        setSearch('');
        setSupplierId('');
        router.get(route('purchases.payments'), {}, {
            replace: true,
        });
    };

    const openPaymentModal = (purchase) => {
        setSelectedPurchase(purchase);
        setData({
            purchase_id: purchase ? purchase.id : '',
            payment_date: new Date().toISOString().split('T')[0],
            amount: purchase ? purchase.due_amount : '',
            payment_method: 'cash',
            reference_no: purchase ? purchase.invoice_no : '',
            notes: '',
        });
        setIsModalOpen(true);
    };

    const openInvoiceModal = (purchase) => {
        setSelectedInvoice(purchase);
        setIsInvoiceOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('purchases.store-payment'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setSelectedPurchase(null);
            },
        });
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const dueList = duePurchases?.data || duePurchases || [];
    const totalDue = dueList.reduce((sum, p) => sum + parseFloat(p.due_amount || 0), 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard className="w-7 h-7 text-[#E88A1A]" />
                            Purchase Due Payments
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Settle outstanding supplier invoice balances quickly & track payment history</p>
                    </div>
                </div>
            }
        >
            <Head title="Purchase Due Payments" />

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

                {/* Outstanding Dues Summary Banner */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Total Supplier Outstanding Dues</span>
                        <h3 className="text-2xl font-extrabold text-white mt-1">৳ {fmtBDT(totalDue)}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{duePurchases.total || dueList.length} supplier invoices awaiting payment</p>
                    </div>
                    {dueList.length > 0 && (
                        <button
                            type="button"
                            onClick={() => openPaymentModal(dueList[0])}
                            className="bg-[#E88A1A] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" /> Pay Next Due Invoice
                        </button>
                    )}
                </div>

                {/* Search & Filter Bar Section */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                        {/* ID / Invoice Search */}
                        <div className="sm:col-span-2 relative">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Search Invoice ID / Supplier Name
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by Invoice # (PUR-xxxx), ID, or Supplier Name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 text-xs font-semibold rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E88A1A] focus:ring-1 focus:ring-[#E88A1A]"
                                />
                            </div>
                        </div>

                        {/* Supplier Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Filter By Supplier
                            </label>
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="w-full h-10 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E88A1A] focus:ring-1 focus:ring-[#E88A1A] font-semibold text-gray-800"
                            >
                                <option value="">All Suppliers</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.company_name ? `(${s.company_name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-end gap-2 mt-5 sm:mt-0">
                            <button
                                type="submit"
                                className="flex-1 h-10 bg-[#E88A1A] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filter Search
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="h-10 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors flex items-center justify-center"
                                title="Reset filters"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Outstanding Due Invoices Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pb-16">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Supplier Purchase Invoices Awaiting Payment</h3>
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                            {duePurchases.total || dueList.length} Outstanding Invoices
                        </span>
                    </div>

                    <div className="overflow-visible">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#E88A1A] text-white">
                                <tr>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Invoice #</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Supplier</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Date</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Grand Total</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Paid</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Due Balance</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dueList.map((p) => (
                                    <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                                        <td className="px-4 py-3.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => openInvoiceModal(p)}
                                                className="text-[#E88A1A] hover:underline font-extrabold flex items-center gap-1"
                                            >
                                                <Receipt className="w-3.5 h-3.5" />
                                                {p.invoice_no}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                                            {p.supplier?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                                            {p.purchase_date}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                                            ৳ {fmtBDT(p.grand_total)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                                            ৳ {fmtBDT(p.paid_amount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-extrabold text-rose-600 whitespace-nowrap">
                                            ৳ {fmtBDT(p.due_amount)}
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

                                                <Dropdown.Content align="right" className="w-52 py-1.5 bg-white">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPaymentModal(p)}
                                                        className="w-full text-left px-4 py-2.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 font-bold"
                                                    >
                                                        <CreditCard className="w-4 h-4 text-emerald-600" /> Pay Due Amount
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openInvoiceModal(p)}
                                                        className="w-full text-left px-4 py-2.5 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2.5 font-bold"
                                                    >
                                                        <Printer className="w-4 h-4 text-[#E88A1A]" /> View / Print Invoice
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {dueList.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-emerald-600 font-bold text-xs">
                                            🎉 All supplier purchase invoices are fully paid! No outstanding dues.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {duePurchases.links && (
                        <div className="px-6 py-4 border-t border-gray-100">
                            <Pagination links={duePurchases.links} from={duePurchases.from} to={duePurchases.to} total={duePurchases.total} />
                        </div>
                    )}
                </div>

            </div>

            {/* ── MAKE DUE PAYMENT FORM MODAL (REACT DOM PORTAL) ── */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-left border border-amber-500/20 my-8">
                            
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-amber-600 via-[#E88A1A] to-orange-500 px-6 py-4 flex items-center justify-between text-white shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight text-white">Record Purchase Due Payment</h3>
                                        <p className="text-xs text-white/80">Settle supplier invoice balance</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                
                                {/* Selected Invoice Details Summary Card */}
                                {selectedPurchase && (
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-2xl space-y-1.5 text-xs shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="font-extrabold text-amber-400 uppercase tracking-wider">{selectedPurchase.supplier?.name}</span>
                                            <span className="font-mono text-gray-300">Invoice #{selectedPurchase.invoice_no}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300 font-mono pt-1 border-t border-gray-700/60">
                                            <span>Total: ৳{fmtBDT(selectedPurchase.grand_total)}</span>
                                            <span>Paid: ৳{fmtBDT(selectedPurchase.paid_amount)}</span>
                                            <span className="text-rose-400 font-bold">Due: ৳{fmtBDT(selectedPurchase.due_amount)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Date & Amount */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Payment Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                            className="w-full h-11 rounded-xl border-gray-300 text-xs font-bold text-gray-900 focus:border-[#E88A1A] focus:ring-[#E88A1A]/20"
                                            required
                                        />
                                        {errors.payment_date && <p className="text-xs text-rose-500 mt-1">{errors.payment_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Payment Amount (BDT) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs select-none">৳</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={selectedPurchase ? selectedPurchase.due_amount : undefined}
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                className="w-full h-11 pl-8 pr-3 rounded-xl border-gray-300 text-xs font-bold text-gray-900 focus:border-[#E88A1A] focus:ring-[#E88A1A]/20"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                                    </div>
                                </div>

                                {/* Payment Method & Reference No */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Payment Method <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="w-full h-11 rounded-xl border-gray-300 text-xs font-bold text-gray-900 focus:border-[#E88A1A] focus:ring-[#E88A1A]/20"
                                            required
                                        >
                                            <option value="cash">💵 Cash</option>
                                            <option value="bank">🏦 Bank Transfer</option>
                                            <option value="cheque">📄 Cheque</option>
                                            <option value="mobile_banking">📱 Mobile Banking (bKash/Nagad)</option>
                                        </select>
                                        {errors.payment_method && <p className="text-xs text-rose-500 mt-1">{errors.payment_method}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Reference / Txn No
                                        </label>
                                        <input
                                            type="text"
                                            value={data.reference_no}
                                            onChange={(e) => setData('reference_no', e.target.value)}
                                            className="w-full h-11 rounded-xl border-gray-300 text-xs font-bold text-gray-900 focus:border-[#E88A1A] focus:ring-[#E88A1A]/20"
                                            placeholder="e.g. TXN-998823"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Payment Remarks / Notes
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows="2"
                                        className="w-full rounded-xl border-gray-300 text-xs text-gray-900 p-3 focus:border-[#E88A1A] focus:ring-[#E88A1A]/20"
                                        placeholder="Optional payment description or cheque details..."
                                    ></textarea>
                                </div>

                                {/* Modal Actions */}
                                <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <CreditCard className="w-4 h-4" /> Confirm & Record Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── DIRECT PRINTABLE PURCHASE INVOICE MODAL (REACT DOM PORTAL) ── */}
            {isInvoiceOpen && selectedInvoice && typeof document !== 'undefined' && createPortal(
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
                                            Purchase Invoice #{selectedInvoice.invoice_no}
                                        </h3>
                                        <p className="text-xs text-white/80">Supplier Inward Stock Receipt & Tax Voucher</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrintInvoice}
                                        className="bg-white text-gray-900 hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Printer className="w-4 h-4 text-[#E88A1A]" /> Print Invoice
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsInvoiceOpen(false)}
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
                                            Branch: {selectedInvoice.branch?.name || 'Main Branch'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                            Official Gold & Jewelry Purchase Invoice & Supplier Stock Inward Receipt
                                        </p>
                                    </div>

                                    <div className="text-right sm:text-right w-full sm:w-auto bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
                                        <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest block">PURCHASE INVOICE NO</span>
                                        <span className="text-2xl font-mono font-black text-[#E88A1A]">{selectedInvoice.invoice_no}</span>
                                        <div className="text-xs text-gray-600 mt-1.5 space-y-0.5">
                                            <p><span className="font-semibold text-gray-500">Date:</span> <span className="font-bold text-gray-900">{selectedInvoice.purchase_date}</span></p>
                                            <p><span className="font-semibold text-gray-500">Created By:</span> <span className="font-bold text-gray-800">{selectedInvoice.creator?.name || 'Admin'}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Supplier Info & Branch Info Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                                        <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                            SUPPLIER DETAILS
                                        </span>
                                        <h4 className="text-base font-extrabold text-gray-900">{selectedInvoice.supplier?.name || 'Supplier'}</h4>
                                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                                            {selectedInvoice.supplier?.company_name && (
                                                <p className="font-bold text-gray-800">{selectedInvoice.supplier.company_name}</p>
                                            )}
                                            {selectedInvoice.supplier?.phone && (
                                                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> {selectedInvoice.supplier.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-right sm:text-right">
                                        <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider block mb-2">
                                            BRANCH & STORE ADDRESS
                                        </span>
                                        <h4 className="text-base font-extrabold text-gray-900">{selectedInvoice.branch?.name || 'Head Office'}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{selectedInvoice.branch?.address || 'Jewelry Market, Dhaka'}</p>
                                    </div>
                                </div>

                                {/* 3. Itemized Stock Table */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <Award className="w-4 h-4 text-[#E88A1A]" />
                                        Itemized Purchase Breakdown
                                    </h4>
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-[#E88A1A] text-white font-bold uppercase">
                                                <tr>
                                                    <th className="p-3 text-center w-10">#</th>
                                                    <th className="p-3">Item Name</th>
                                                    <th className="p-3 text-center">Purity</th>
                                                    <th className="p-3 text-center">Gross Wt</th>
                                                    <th className="p-3 text-center">Wastage Wt</th>
                                                    <th className="p-3 text-center">Net Wt</th>
                                                    <th className="p-3 text-center">Vori-Ana-Roti-Pt Breakdown</th>
                                                    <th className="p-3 text-right">Total Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {selectedInvoice.items?.map((item, idx) => (
                                                    <tr key={item.id || idx} className="hover:bg-amber-50/30">
                                                        <td className="p-3 text-center font-bold text-gray-400">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-gray-900">{item.item_name || item.product?.name || 'Jewelry Item'}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase font-mono">{item.stock_type || 'Stock'}</div>
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-amber-700">{item.purity?.name || `${item.metal_type?.toUpperCase()}`}</td>
                                                        <td className="p-3 text-center font-mono font-bold text-gray-700">{item.gross_weight} g</td>
                                                        <td className="p-3 text-center font-mono text-gray-500">{item.wastage_weight} g</td>
                                                        <td className="p-3 text-center font-mono font-black text-amber-900 bg-amber-50/50">{item.net_weight} g</td>
                                                        <td className="p-3 text-center font-mono text-xs font-extrabold text-[#E88A1A] whitespace-nowrap">
                                                            {gramToVoriAnaRotiPoint(item.net_weight)}
                                                        </td>
                                                        <td className="p-3 text-right font-extrabold text-gray-900">৳ {fmtBDT(item.total_amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 4. Grand Totals Summary */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-gray-200 pt-4">
                                    <div className="text-xs text-gray-600 space-y-2 max-w-sm w-full">
                                        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                                            <p className="font-bold text-amber-900 uppercase text-[11px] mb-1">Payment Status Summary</p>
                                            <p className="text-gray-700">
                                                Status: <span className="font-bold uppercase text-emerald-700">{selectedInvoice.status}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-80 space-y-2 text-xs">
                                        <div className="flex justify-between py-1 border-b border-gray-100 font-semibold">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-mono text-gray-900">৳ {fmtBDT(selectedInvoice.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100 font-semibold">
                                            <span className="text-gray-600">Grand Total:</span>
                                            <span className="font-mono font-bold text-gray-900">৳ {fmtBDT(selectedInvoice.grand_total)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-gray-100 font-semibold text-emerald-700">
                                            <span>Paid Amount:</span>
                                            <span className="font-mono font-bold">৳ {fmtBDT(selectedInvoice.paid_amount)}</span>
                                        </div>
                                        <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 flex justify-between items-center text-xs font-bold text-rose-900">
                                            <span>Due Amount Balance:</span>
                                            <span className="text-base font-black text-rose-700">৳ {fmtBDT(selectedInvoice.due_amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Signature Blocks */}
                                <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs font-bold text-gray-600">
                                    <div>
                                        <div className="border-b border-gray-400 w-40 mx-auto mb-2"></div>
                                        <p>Supplier / Receiver Signature</p>
                                    </div>
                                    <div>
                                        <div className="border-b border-gray-400 w-40 mx-auto mb-2"></div>
                                        <p>Authorized Manager Signature</p>
                                    </div>
                                </div>

                                {/* 6. Footer Note */}
                                <div className="border-t border-gray-200 pt-3 text-center text-[10px] text-gray-400">
                                    Computer generated purchase invoice document. Valid with authorized stamp.
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
