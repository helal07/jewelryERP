import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import Modal from '@/Components/Modal';
import useFilter from '@/Hooks/useFilter';
import axios from 'axios';
import { 
    ShoppingBag, Plus, Search, Filter, RotateCcw, Eye, CheckCircle2, Clock, Edit,
    Printer, X, Receipt, Sparkles, Award, Phone, MapPin, Mail, CreditCard,
    Trash2, CornerUpLeft, DollarSign, AlertCircle, Gem
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

export default function Index({ sales = { data: [] }, branches = [], filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');

    // View & Print Sales Invoice Modal State
    const [selectedSale, setSelectedSale] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Add Payment Pop-Up Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentSale, setPaymentSale] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_method: 'cash',
        reference_no: '',
        notes: '',
        payment_date: new Date().toISOString().split('T')[0]
    });

    // Return Sale Pop-Up Modal State
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnSale, setReturnSale] = useState(null);
    const [returnForm, setReturnForm] = useState({
        return_date: new Date().toISOString().split('T')[0],
        reason: '',
        refund_amount: '0',
        items: [],
    });
    const [returnProcessing, setReturnProcessing] = useState(false);

    // Auto open sales invoice pop up if redirected from sales creation or query param
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('invoice_id') || flash?.sale_id;

        if (invoiceId) {
            const found = sales?.data?.find(s => s.id == invoiceId || s.invoice_no == invoiceId);
            if (found) {
                setSelectedSale(found);
                setIsViewOpen(true);
            } else {
                axios.get(route('sales.show', invoiceId))
                    .then(res => {
                        if (res.data) {
                            setSelectedSale(res.data);
                            setIsViewOpen(true);
                        }
                    })
                    .catch(err => console.error(err));
            }
        }
    }, [flash, sales]);

    useFilter(route('sales.index'), {
        search,
        status,
        branch_id: branchId
    });

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setBranchId('');
    };

    const openViewModal = (sale) => {
        setSelectedSale(sale);
        setIsViewOpen(true);
    };

    const handleDirectPrint = (sale) => {
        setSelectedSale(sale);
        setIsViewOpen(true);
        setTimeout(() => {
            window.print();
        }, 350);
    };

    const openPaymentModal = (sale) => {
        setPaymentSale(sale);
        setPaymentForm({
            amount: sale.due_amount || (sale.grand_total - sale.paid_amount),
            payment_method: 'cash',
            reference_no: '',
            notes: '',
            payment_date: new Date().toISOString().split('T')[0]
        });
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!paymentSale) return;

        router.post(route('sales.payments.store'), {
            sale_id: paymentSale.id,
            payment_date: paymentForm.payment_date,
            amount: paymentForm.amount,
            payment_method: paymentForm.payment_method,
            reference_no: paymentForm.reference_no,
            notes: paymentForm.notes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setPaymentSale(null);
            }
        });
    };

    const openReturnModal = (sale) => {
        setReturnSale(sale);
        const mappedItems = (sale.items || []).map(item => {
            const unitPrice = Number(item.rate_per_gram || (item.total_amount / (item.quantity || 1)) || 0);
            const qty = Number(item.quantity || 1);
            return {
                sale_item_id: item.id,
                product_id: item.product_id,
                product_name: item.product?.name || 'Jewelry Item',
                max_qty: qty,
                quantity: qty,
                unit_price: unitPrice,
                total: unitPrice * qty,
            };
        });
        const initialRefund = mappedItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);

        setReturnForm({
            return_date: new Date().toISOString().split('T')[0],
            reason: '',
            refund_amount: initialRefund > 0 ? initialRefund.toFixed(2) : Number(sale.grand_total || 0).toFixed(2),
            items: mappedItems,
        });
        setIsReturnModalOpen(true);
    };

    const handleReturnQtyChange = (index, qty) => {
        const newItems = [...returnForm.items];
        const item = newItems[index];
        const validQty = Math.max(0, Math.min(item.max_qty, parseInt(qty) || 0));
        newItems[index].quantity = validQty;
        newItems[index].total = validQty * item.unit_price;

        const computedRefund = newItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
        setReturnForm({
            ...returnForm,
            items: newItems,
            refund_amount: computedRefund.toFixed(2),
        });
    };

    const handleReturnSubmit = (e) => {
        e.preventDefault();
        if (!returnSale) return;

        const activeItems = returnForm.items.filter(i => i.quantity > 0);
        if (returnForm.items.length > 0 && activeItems.length === 0) {
            alert('Please specify at least 1 item quantity to return.');
            return;
        }

        setReturnProcessing(true);
        router.post(route('sales.returns.store'), {
            sale_id: returnSale.id,
            return_date: returnForm.return_date,
            reason: returnForm.reason || 'Customer Item Return',
            refund_amount: returnForm.refund_amount,
            items: (activeItems.length > 0 ? activeItems : returnForm.items).map(i => ({
                sale_item_id: i.sale_item_id,
                product_id: i.product_id,
                quantity: i.quantity || 1,
                unit_price: i.unit_price,
            })),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsReturnModalOpen(false);
                setReturnSale(null);
                setReturnProcessing(false);
            },
            onError: () => {
                setReturnProcessing(false);
            },
        });
    };

    const handleDeleteSale = (sale) => {
        if (confirm(`Are you sure you want to delete invoice #${sale.invoice_no}?`)) {
            router.delete(route('sales.destroy', sale.id));
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
                            Sales List
                        </h2>
                    </div>
                    <Link
                        href={route('sales.create')}
                        className="bg-[#E88A1A] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Add Sale
                    </Link>
                </div>
            }
        >
            <Head title="Sales List" />

            {/* Flash Message Banner */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-bold">{flash.success}</span>
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by invoice no, customer name or phone..."
                                className="w-full pl-9 text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                            />
                        </div>
                    </div>

                    <div className="w-40">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        >
                            <option value="">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="due">Due</option>
                            <option value="partial">Partial</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>

                    <div className="w-44">
                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" /> Clear
                    </button>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pb-52 min-h-[350px]">
                <div className="overflow-x-auto pb-36">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#E88A1A] text-white font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-3.5 py-3.5">Date</th>
                                <th className="px-3.5 py-3.5">Invoice No</th>
                                <th className="px-3.5 py-3.5">Customer Name</th>
                                <th className="px-3.5 py-3.5">Mobile</th>
                                <th className="px-3.5 py-3.5 text-right">Total Bill</th>
                                <th className="px-3.5 py-3.5 text-right">Received</th>
                                <th className="px-3.5 py-3.5 text-right">Due</th>
                                <th className="px-3.5 py-3.5 text-center">Status</th>
                                <th className="px-3.5 py-3.5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                            {sales.data && sales.data.length > 0 ? (
                                sales.data.map((sale, idx) => {
                                    const grandTotal = Number(sale.grand_total || 0);
                                    const paidAmount = Number(sale.paid_amount || 0);
                                    const dueAmount = Number(sale.due_amount !== undefined ? sale.due_amount : Math.max(0, grandTotal - paidAmount));
                                    
                                    const isReturned = sale.status === 'cancelled' || sale.status === 'returned' || (sale.returns && sale.returns.length > 0);
                                    const statusType = isReturned ? 'returned' : (dueAmount <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'due'));
                                    const formattedDate = new Date(sale.sale_date || Date.now()).toLocaleDateString();

                                    return (
                                        <tr key={sale.id} className={`hover:bg-amber-50/40 transition-colors ${isReturned ? 'bg-purple-50/20' : ''}`}>
                                            {/* Date (no time) */}
                                            <td className="px-3.5 py-3 font-semibold text-gray-700">
                                                {formattedDate}
                                            </td>

                                            {/* Invoice No */}
                                            <td className="px-3.5 py-3 font-bold text-amber-900">
                                                {sale.invoice_no}
                                                {isReturned && (
                                                    <span className="ml-1.5 text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                                        Returned
                                                    </span>
                                                )}
                                            </td>

                                            {/* Customer Name */}
                                            <td className="px-3.5 py-3 font-bold text-gray-900">
                                                {sale.customer?.name || 'Walk-in Customer'}
                                            </td>

                                            {/* Mobile */}
                                            <td className="px-3.5 py-3 text-gray-600 font-mono">
                                                {sale.customer?.phone || 'N/A'}
                                            </td>

                                            {/* Total Bill */}
                                            <td className="px-3.5 py-3 text-right font-black text-gray-900">
                                                ৳ {fmtBDT(grandTotal)}
                                            </td>

                                            {/* Received */}
                                            <td className="px-3.5 py-3 text-right font-bold text-emerald-700">
                                                ৳ {fmtBDT(paidAmount)}
                                            </td>

                                            {/* Due */}
                                            <td className="px-3.5 py-3 text-right font-bold text-rose-600">
                                                ৳ {fmtBDT(dueAmount)}
                                            </td>

                                            {/* Status Badge (Click to open Add Payment if due/partial) */}
                                            <td className="px-3.5 py-3 text-center">
                                                {statusType === 'returned' ? (
                                                    <span className="px-2.5 py-1 text-[10px] font-black text-purple-800 bg-purple-100 rounded-full border border-purple-300 uppercase tracking-wide">
                                                        returned
                                                    </span>
                                                ) : statusType === 'paid' ? (
                                                    <span className="px-2.5 py-1 text-[10px] font-black text-emerald-800 bg-emerald-100 rounded-full border border-emerald-300 uppercase tracking-wide">
                                                        paid
                                                    </span>
                                                ) : statusType === 'partial' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openPaymentModal(sale)}
                                                        title="Click to Add Payment"
                                                        className="px-2.5 py-1 text-[10px] font-black text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-full border border-amber-300 uppercase tracking-wide cursor-pointer transition-colors"
                                                    >
                                                        partial
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openPaymentModal(sale)}
                                                        title="Click to Add Payment"
                                                        className="px-2.5 py-1 text-[10px] font-black text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-full border border-rose-300 uppercase tracking-wide cursor-pointer transition-colors"
                                                    >
                                                        due
                                                    </button>
                                                )}
                                            </td>

                                            {/* Action Menu */}
                                            <td className="px-3.5 py-3 text-center">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-amber-300 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
                                                        >
                                                            Actions
                                                            <svg className="ml-1 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align={sales.data?.length > 3 && idx >= sales.data.length - 2 ? 'top-right' : 'right'} className="w-48 py-1 bg-white text-xs font-bold border border-gray-200 shadow-2xl z-50">
                                                        {/* View */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openViewModal(sale)}
                                                            className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-amber-50 flex items-center gap-2"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-500" /> View
                                                        </button>

                                                        {/* Invoice */}
                                                        <Link
                                                            href={route('sales.show', sale.id)}
                                                            className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-bold"
                                                        >
                                                            <Printer className="w-4 h-4 text-amber-600" /> Invoice
                                                        </Link>

                                                        {/* Edit */}
                                                        <Link
                                                            href={route('sales.edit', sale.id)}
                                                            className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-amber-50 flex items-center gap-2"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" /> Edit
                                                        </Link>

                                                        {/* Add Payment */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openPaymentModal(sale)}
                                                            className="w-full text-left px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                                        >
                                                            <CreditCard className="w-4 h-4 text-emerald-600" /> Add Payment
                                                        </button>

                                                        {/* Return */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openReturnModal(sale)}
                                                            className="w-full text-left px-3.5 py-2 text-purple-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer font-bold"
                                                        >
                                                            <CornerUpLeft className="w-4 h-4 text-purple-600" /> Return
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteSale(sale)}
                                                            className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-500" /> Delete
                                                        </button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center text-gray-400 font-medium">
                                        No sales records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={sales.links} from={sales.from} to={sales.to} total={sales.total} />
            </div>

            {/* ── ADD PAYMENT POP-UP MODAL ── */}
            {isPaymentModalOpen && paymentSale && (
                <Modal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} maxWidth="md">
                    <div className="p-6 bg-white rounded-3xl text-gray-900 space-y-4 font-sans border border-amber-200">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-base font-black text-gray-900">
                                    Add Payment #{paymentSale.invoice_no}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs font-semibold">
                            <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                                <div>
                                    <span className="text-[10px] text-gray-500 font-bold block uppercase">Customer</span>
                                    <span className="font-bold text-gray-900">{paymentSale.customer?.name || 'Walk-in'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-rose-600 font-bold block uppercase">Current Due</span>
                                    <span className="font-black text-rose-700 text-sm">৳ {fmtBDT(paymentSale.due_amount)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Payment Date *</label>
                                <input
                                    type="date"
                                    value={paymentForm.payment_date}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                                    className="w-full rounded-xl border-gray-300 text-xs py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Amount (BDT) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full rounded-xl border-gray-300 text-xs py-2 font-black text-emerald-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Payment Method *</label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                                    className="w-full rounded-xl border-gray-300 text-xs py-2 font-bold"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="card">Debit / Credit Card</option>
                                    <option value="mobile_money">bKash / Nagad / Rocket</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Reference / Txn ID</label>
                                <input
                                    type="text"
                                    value={paymentForm.reference_no}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
                                    placeholder="TRX-123456"
                                    className="w-full rounded-xl border-gray-300 text-xs py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Notes</label>
                                <input
                                    type="text"
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    placeholder="Payment receipt note..."
                                    className="w-full rounded-xl border-gray-300 text-xs py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer"
                                >
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* ── PROCESS RETURN POP-UP MODAL ── */}
            {isReturnModalOpen && returnSale && (
                <Modal show={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} maxWidth="2xl">
                    <div className="p-6 bg-white rounded-3xl text-gray-900 space-y-4 font-sans border border-purple-200">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-purple-600" />
                                <h3 className="text-base font-black text-gray-900">
                                    Process Sale Return #{returnSale.invoice_no}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsReturnModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs font-semibold">
                            <div className="grid grid-cols-2 gap-3 bg-purple-50/60 p-3 rounded-xl border border-purple-200/80">
                                <div>
                                    <span className="text-[10px] text-gray-500 font-bold block uppercase">Customer</span>
                                    <span className="font-bold text-gray-900">{returnSale.customer?.name || 'Walk-in'}</span>
                                    <span className="text-[11px] text-gray-500 block">{returnSale.customer?.phone || ''}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-purple-700 font-bold block uppercase">Total Invoice Amount</span>
                                    <span className="font-black text-purple-900 text-sm">৳ {fmtBDT(returnSale.grand_total)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-700 mb-1 font-bold">Return Date *</label>
                                    <input
                                        type="date"
                                        value={returnForm.return_date}
                                        onChange={(e) => setReturnForm({ ...returnForm, return_date: e.target.value })}
                                        className="w-full rounded-xl border-gray-300 text-xs py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1 font-bold">Refund Amount (BDT) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={returnForm.refund_amount}
                                        onChange={(e) => setReturnForm({ ...returnForm, refund_amount: e.target.value })}
                                        className="w-full rounded-xl border-gray-300 text-xs py-2 font-black text-rose-600"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Return Items Selection */}
                            {returnForm.items.length > 0 ? (
                                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs text-gray-700 uppercase flex justify-between">
                                        <span>Invoice Items</span>
                                        <span>Return Qty</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 p-2 max-h-52 overflow-y-auto">
                                        {returnForm.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 text-xs">
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.product_name}</p>
                                                    <p className="text-gray-500">Unit Price: ৳{fmtBDT(item.unit_price)} (Max Qty: {item.max_qty})</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.max_qty}
                                                        value={item.quantity}
                                                        onChange={(e) => handleReturnQtyChange(idx, e.target.value)}
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold text-center"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-xs font-medium">
                                    No item breakdown found for this sale. You can still process a voucher return by specifying refund amount below.
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Return Reason</label>
                                <input
                                    type="text"
                                    value={returnForm.reason}
                                    onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                                    placeholder="Customer exchange, defect, cancellation..."
                                    className="w-full rounded-xl border-gray-300 text-xs py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={returnProcessing}
                                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {returnProcessing ? 'Processing Return...' : 'Confirm Return'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* ── PRINTABLE SALES INVOICE VIEW MODAL ── */}
            {isViewOpen && selectedSale && typeof document !== 'undefined' && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:block print:bg-white print:static">
                    <style>{`
                        @media print {
                            @page {
                                size: 80mm auto;
                                margin: 0;
                            }
                            html, body {
                                background: #ffffff !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            header, nav, aside, [class*="sidebar"], .sidebar, button, .print-hide, .no-print, .print\\:hidden {
                                display: none !important;
                            }
                            .mini-pos-receipt-print, .mini-pos-receipt-print * {
                                visibility: visible !important;
                            }
                            .mini-pos-receipt-print {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 78mm !important;
                                margin: 0 !important;
                                padding: 2mm !important;
                                background-color: #ffffff !important;
                                color: #000000 !important;
                                font-family: monospace !important;
                                font-size: 11px !important;
                                line-height: 1.25 !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    `}</style>

                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center print:p-0 print:block">
                        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-left align-middle border border-amber-500/20 my-8 print:my-0 print:shadow-none print:border-none print:w-full print:rounded-none">
                            
                            {/* Modal Action Header (Hidden on Print) */}
                            <div className="bg-amber-900 px-6 py-4 flex items-center justify-between text-white shadow-md print-hide no-print">
                                <div className="flex items-center gap-3">
                                    <Receipt className="w-6 h-6 text-amber-400" />
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                                            Invoice #{selectedSale.invoice_no}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrintInvoice}
                                        className="bg-white text-gray-900 hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                    >
                                        <Printer className="w-4 h-4 text-amber-700" /> Print
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

                            {/* On-Screen Full Executive Memo (Hidden on Print) */}
                            <div className="p-8 sm:p-10 space-y-8 bg-white text-gray-900 print-hide no-print">
                                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-amber-500/30 pb-6 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Gem className="w-6 h-6 text-amber-700" />
                                            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">ROYAL JEWELRY ERP</h1>
                                        </div>
                                        <p className="text-xs font-bold text-amber-700 tracking-wider uppercase mt-0.5">
                                            Branch: {selectedSale.branch?.name || 'Main Branch'}
                                        </p>
                                    </div>

                                    <div className="text-right bg-amber-50 p-4 rounded-2xl border border-amber-200">
                                        <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest block">INVOICE NO</span>
                                        <span className="text-xl font-mono font-black text-amber-900">{selectedSale.invoice_no}</span>
                                        <p className="text-xs text-gray-600 mt-1">Date: {new Date(selectedSale.sale_date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                        <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">CUSTOMER</span>
                                        <h4 className="text-base font-extrabold text-gray-900">{selectedSale.customer?.name || 'Walk-in Customer'}</h4>
                                        <p className="text-xs text-gray-600 mt-1">Phone: {selectedSale.customer?.phone || 'N/A'}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-right">
                                        <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">PAYMENT STATUS</span>
                                        <span className="font-extrabold text-emerald-800 uppercase px-3 py-1 bg-emerald-100 rounded-full text-xs">
                                            {selectedSale.status || 'Completed'}
                                        </span>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-amber-900 text-white font-bold uppercase">
                                            <tr>
                                                <th className="p-3 text-center w-10">#</th>
                                                <th className="p-3">Item / Description</th>
                                                <th className="p-3 text-right">Net Weight</th>
                                                <th className="p-3 text-right">Rate / Gm</th>
                                                <th className="p-3 text-right">Making</th>
                                                <th className="p-3 text-center">Qty</th>
                                                <th className="p-3 text-right">Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {selectedSale.items?.map((item, idx) => (
                                                <tr key={item.id || idx}>
                                                    <td className="p-3 text-center font-bold text-gray-400">{idx + 1}</td>
                                                    <td className="p-3 font-bold text-gray-900">{item.product?.name || 'Gold Product'} ({item.product?.purity?.name || '22K'})</td>
                                                    <td className="p-3 text-right font-bold">{Number(item.net_weight).toFixed(3)} g</td>
                                                    <td className="p-3 text-right">৳ {fmtBDT(item.rate_per_gram)}</td>
                                                    <td className="p-3 text-right text-gray-600">৳ {fmtBDT(item.making_charge)}</td>
                                                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                                                    <td className="p-3 text-right font-black text-gray-900">৳ {fmtBDT(item.total_amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <div className="w-72 space-y-1.5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal:</span>
                                            <span className="font-bold text-gray-900">৳ {fmtBDT(selectedSale.subtotal)}</span>
                                        </div>
                                        {Number(selectedSale.discount) > 0 && (
                                            <div className="flex justify-between text-rose-600 font-semibold">
                                                <span>Discount:</span>
                                                <span>- ৳ {fmtBDT(selectedSale.discount)}</span>
                                            </div>
                                        )}
                                        {Number(selectedSale.tax) > 0 && (
                                            <div className="flex justify-between text-gray-700">
                                                <span>VAT / Tax:</span>
                                                <span>+ ৳ {fmtBDT(selectedSale.tax)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm font-black text-amber-900 border-t border-b border-amber-300 py-1.5">
                                            <span>Grand Total:</span>
                                            <span>৳ {fmtBDT(selectedSale.grand_total)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-emerald-700">
                                            <span>Paid Amount:</span>
                                            <span>৳ {fmtBDT(selectedSale.paid_amount)}</span>
                                        </div>
                                        {Number(selectedSale.due_amount) > 0 && (
                                            <div className="flex justify-between font-bold text-rose-600">
                                                <span>Due Balance:</span>
                                                <span>৳ {fmtBDT(selectedSale.due_amount)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Printable Mini Thermal POS Receipt Slip (Rendered specifically for thermal printer) */}
                            <div className="mini-pos-receipt-print hidden print:block w-[80mm] max-w-[80mm] bg-white p-4 text-xs font-mono text-gray-900 space-y-2.5">
                                <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-gray-400">
                                    <div className="flex justify-center items-center gap-1">
                                        <Gem className="w-4 h-4 text-amber-700" />
                                        <h1 className="font-black text-sm uppercase tracking-wider text-gray-900">ROYAL JEWELRY ERP</h1>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-700 uppercase">{selectedSale.branch?.name || 'MAIN SHOWROOM'}</p>
                                    <p className="text-[10px] text-gray-600">Mob: +880 1700-000000</p>
                                    <div className="pt-0.5">
                                        <span className="bg-gray-900 text-white px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                                            CASH RECEIPT MEMO
                                        </span>
                                    </div>
                                </div>

                                <div className="text-[10px] space-y-0.5 border-b border-dashed border-gray-400 pb-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">INV NO:</span>
                                        <span className="font-bold text-gray-900">{selectedSale.invoice_no}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">DATE:</span>
                                        <span>{new Date(selectedSale.sale_date || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">CUSTOMER:</span>
                                        <span className="font-bold">{selectedSale.customer?.name || 'Walk-in Customer'}</span>
                                    </div>
                                    {selectedSale.customer?.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">PHONE:</span>
                                            <span>{selectedSale.customer.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 border-b-2 border-dashed border-gray-400 pb-2.5">
                                    <div className="grid grid-cols-12 font-bold border-b border-gray-300 pb-1 text-[9px] uppercase text-gray-700">
                                        <span className="col-span-6">ITEM</span>
                                        <span className="col-span-2 text-center">QTY</span>
                                        <span className="col-span-4 text-right">TOTAL</span>
                                    </div>

                                    {selectedSale.items?.map((item, idx) => (
                                        <div key={idx} className="space-y-0.5 text-[10px]">
                                            <div className="font-bold text-gray-900">
                                                {item.product?.name || 'Gold Item'}
                                                <span className="ml-1 text-[8px] bg-gray-100 text-gray-800 px-1 rounded border border-gray-300">
                                                    {item.product?.purity?.name || '22K'}
                                                </span>
                                            </div>
                                            <div className="text-[9px] text-gray-600">
                                                Net: {Number(item.net_weight || 0).toFixed(3)}g | Rate: ৳{Number(item.rate_per_gram || 0).toLocaleString()}
                                            </div>
                                            <div className="grid grid-cols-12 text-[9px] text-gray-700">
                                                <span className="col-span-6 text-gray-500">
                                                    Mk: ৳{Number(item.making_charge || 0).toLocaleString()}
                                                </span>
                                                <span className="col-span-2 text-center font-bold">{item.quantity || 1}</span>
                                                <span className="col-span-4 text-right font-bold text-gray-900">
                                                    ৳{Number(item.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1 text-[10px] border-b-2 border-dashed border-gray-400 pb-2.5">
                                    <div className="flex justify-between text-gray-600">
                                        <span>SUBTOTAL:</span>
                                        <span className="font-bold text-gray-900">৳{Number(selectedSale.subtotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                    {Number(selectedSale.discount || 0) > 0 && (
                                        <div className="flex justify-between text-rose-700 font-semibold">
                                            <span>DISCOUNT:</span>
                                            <span>-৳{Number(selectedSale.discount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    )}
                                    {Number(selectedSale.tax || 0) > 0 && (
                                        <div className="flex justify-between text-gray-800">
                                            <span>VAT / TAX:</span>
                                            <span>+৳{Number(selectedSale.tax).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xs font-black text-gray-900 border-t-2 border-black pt-1 pb-0.5">
                                        <span>GRAND TOTAL:</span>
                                        <span>৳{Number(selectedSale.grand_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>

                                    <div className="flex justify-between font-bold text-emerald-800">
                                        <span>PAID AMOUNT:</span>
                                        <span>৳{Number(selectedSale.paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>

                                    {Number(selectedSale.due_amount || 0) > 0 ? (
                                        <div className="flex justify-between font-bold text-rose-700 text-[10px] border-t border-rose-200 pt-0.5">
                                            <span>DUE BALANCE:</span>
                                            <span>৳{Number(selectedSale.due_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center font-black text-emerald-800 text-[9px] uppercase bg-emerald-50 py-0.5 rounded border border-emerald-200 mt-0.5">
                                            *** PAID IN FULL ***
                                        </div>
                                    )}
                                </div>

                                <div className="text-center pt-1 space-y-1">
                                    <div className="font-mono text-xs font-black tracking-widest text-gray-800">
                                        |||| | ||| || |||| | |||
                                    </div>
                                    <div className="text-[8px] text-gray-600">
                                        THANK YOU FOR YOUR PURCHASE!
                                    </div>
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
