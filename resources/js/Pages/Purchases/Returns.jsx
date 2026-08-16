import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import axios from 'axios';
import { 
    RotateCcw, Plus, CheckCircle2, ShoppingBag, Calendar, 
    FileText, User, DollarSign, X, AlertCircle, Building2, Package, Layers,
    Printer, Receipt, Sparkles, Award, Phone, MapPin, Mail, Eye
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

export default function Returns({ returns, purchases = [], branches = [], selectedPurchaseId = null }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    // Direct Printable Purchase Return Voucher Modal State
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [isVoucherOpen, setIsVoucherOpen] = useState(false);
    const initializedRef = useRef(false);

    const { data, setData, reset, errors } = useForm({
        purchase_id: '',
        return_date: new Date().toISOString().split('T')[0],
        reason: '',
        total_amount: 0,
        items: [],
    });

    // Auto open return creation if URL query or prop has purchase_id
    useEffect(() => {
        if (initializedRef.current) return;
        const urlParams = new URLSearchParams(window.location.search);
        const pid = selectedPurchaseId || urlParams.get('purchase_id');
        if (pid) {
            initializedRef.current = true;
            handlePurchaseChange(pid);
            setIsModalOpen(true);
        }
    }, [purchases, selectedPurchaseId]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const setupItemsFromPurchase = (p, purchaseId) => {
        setSelectedPurchase(p);
        if (p && p.items && p.items.length > 0) {
            const mappedItems = p.items.map(item => {
                const maxQty = parseInt(item.quantity || 1);
                const itemTotal = parseFloat(item.total_amount || 0);
                const unitPrice = maxQty > 0 ? (itemTotal / maxQty) : itemTotal;

                return {
                    selected: true,
                    purchase_item_id: item.id,
                    product_id: item.product_id,
                    product_name: item.item_name || item.product?.name || `${item.metal_type?.toUpperCase() || 'JEWELRY'} Item`,
                    stock_type: item.stock_type || 'readymade',
                    quantity: maxQty,
                    max_qty: maxQty,
                    unit_price: unitPrice,
                    weight: parseFloat(item.net_weight || item.gross_weight || 0),
                    amount: itemTotal,
                };
            });

            const total = mappedItems.reduce((sum, i) => sum + i.amount, 0);
            setData(prev => ({
                ...prev,
                purchase_id: purchaseId,
                items: mappedItems,
                total_amount: total.toFixed(2),
            }));
        } else {
            setData(prev => ({
                ...prev,
                purchase_id: purchaseId,
                items: [],
                total_amount: '0.00',
            }));
        }
    };

    const handlePurchaseChange = (purchaseId) => {
        if (!purchaseId) {
            setData(prev => ({ ...prev, purchase_id: '', items: [], total_amount: '0.00' }));
            setSelectedPurchase(null);
            return;
        }

        setData('purchase_id', purchaseId);
        const p = purchases.find(item => item.id === parseInt(purchaseId));
        if (p) {
            setupItemsFromPurchase(p, purchaseId);
        } else {
            axios.get(route('purchases.show', purchaseId))
                .then(res => {
                    if (res.data) {
                        setupItemsFromPurchase(res.data, purchaseId);
                    }
                })
                .catch(err => console.error("Error fetching purchase for return", err));
        }
    };

    const toggleItemSelection = (index) => {
        const newItems = [...data.items];
        newItems[index].selected = !newItems[index].selected;

        const total = newItems.filter(i => i.selected).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
        setData(prev => ({
            ...prev,
            items: newItems,
            total_amount: total.toFixed(2),
        }));
    };

    const updateItemQty = (index, qty) => {
        const newItems = [...data.items];
        const maxQty = newItems[index].max_qty;
        const quantity = Math.min(maxQty, Math.max(1, parseInt(qty || 1)));
        
        newItems[index].quantity = quantity;
        newItems[index].amount = (quantity * newItems[index].unit_price);

        const total = newItems.filter(i => i.selected).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
        setData(prev => ({
            ...prev,
            items: newItems,
            total_amount: total.toFixed(2),
        }));
    };

    const openVoucherModal = (ret) => {
        setSelectedReturn(ret);
        setIsVoucherOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const selectedItems = data.items.filter(i => i.selected);
        if (selectedItems.length === 0) {
            alert('Please select at least one item to return.');
            return;
        }

        setIsSubmitting(true);
        router.post(route('purchases.store-return'), {
            purchase_id: data.purchase_id,
            return_date: data.return_date,
            reason: data.reason,
            total_amount: data.total_amount,
            items: selectedItems,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setSelectedPurchase(null);
                setIsSubmitting(false);
            },
            onError: (errs) => {
                setIsSubmitting(false);
                alert(Object.values(errs).flat().join('\n') || 'Failed to process purchase return.');
            }
        });
    };

    const handlePrintVoucher = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <RotateCcw className="w-7 h-7 text-[#E88A1A]" />
                            Return Purchase
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Record supplier return purchases, adjust inventory & deduct supplier balances</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-[#E88A1A] to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </button>
                </div>
            }
        >
            <Head title="Return Purchase" />

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

                {/* Returns History Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pb-16">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Return Purchase History</h3>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                            Total Records: {returns.total}
                        </span>
                    </div>

                    <div className="overflow-visible">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#E88A1A] text-white">
                                <tr>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Return #</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Purchase Invoice</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Date</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Supplier</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap">Return Amount</th>
                                    <th className="px-4 py-3.5 font-bold whitespace-nowrap">Reason</th>
                                    <th className="px-4 py-3.5 font-bold text-right whitespace-nowrap rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {returns.data.map((r) => (
                                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                                        <td className="px-4 py-3.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => openVoucherModal(r)}
                                                className="text-[#E88A1A] hover:underline font-extrabold flex items-center gap-1"
                                            >
                                                <Receipt className="w-3.5 h-3.5" />
                                                {r.return_no}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono font-semibold text-gray-700 whitespace-nowrap">
                                            {r.purchase?.invoice_no || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                                            {r.return_date}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                                            {r.purchase?.supplier?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-bold text-rose-600 whitespace-nowrap">
                                            ৳ {fmtBDT(r.total_amount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600 text-xs max-w-xs truncate">
                                            {r.reason || <span className="text-gray-300 italic">No reason specified</span>}
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
                                                        onClick={() => openVoucherModal(r)}
                                                        className="w-full text-left px-4 py-2.5 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2.5 font-bold"
                                                    >
                                                        <Printer className="w-4 h-4 text-[#E88A1A]" /> View / Print Voucher
                                                    </button>
                                                    {r.purchase_id && (
                                                        <Link
                                                            href={route('purchases.index', { invoice_id: r.purchase_id })}
                                                            className="w-full text-left px-4 py-2.5 text-xs text-gray-800 hover:bg-blue-50 flex items-center gap-2.5 font-bold"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-600" /> View Purchase Invoice
                                                        </Link>
                                                    )}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {returns.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400 font-medium">
                                            No purchase returns recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100">
                        <Pagination links={returns.links} from={returns.from} to={returns.to} total={returns.total} />
                    </div>
                </div>

            </div>

            {/* ── CREATE PURCHASE RETURN MODAL POPUP (REACT DOM PORTAL) ── */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 text-left my-8">
                            
                            {/* Modal Header Bar */}
                            <div className="bg-gradient-to-r from-amber-600 via-[#E88A1A] to-orange-500 px-6 py-4 flex items-center justify-between text-white shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                                        <RotateCcw className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-white">Create Return Purchase</h3>
                                        <p className="text-xs text-white/80">Return items to supplier, restock metal & adjust dues</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                
                                {/* Top Invoice Selection & Date Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
                                    {/* Select Purchase Invoice */}
                                    <div>
                                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <ShoppingBag className="w-3.5 h-3.5 text-[#E88A1A]" />
                                            Select Purchase Invoice <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.purchase_id}
                                            onChange={(e) => handlePurchaseChange(e.target.value)}
                                            className="w-full h-11 rounded-xl border-amber-300 bg-white focus:border-[#E88A1A] focus:ring-2 focus:ring-[#E88A1A]/20 text-xs font-bold text-gray-900 px-3 shadow-sm"
                                            required
                                        >
                                            <option value="">— Choose Purchase Invoice —</option>
                                            {purchases.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    Invoice #{p.invoice_no} — {p.supplier?.name} (৳{fmtBDT(p.grand_total)})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.purchase_id && <p className="text-xs text-rose-500 mt-1">{errors.purchase_id}</p>}
                                    </div>

                                    {/* Return Date */}
                                    <div>
                                        <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-[#E88A1A]" />
                                            Return Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.return_date}
                                            onChange={(e) => setData('return_date', e.target.value)}
                                            className="w-full h-11 rounded-xl border-amber-300 bg-white focus:border-[#E88A1A] focus:ring-2 focus:ring-[#E88A1A]/20 text-xs font-bold text-gray-900 px-3 shadow-sm"
                                            required
                                        />
                                        {errors.return_date && <p className="text-xs text-rose-500 mt-1">{errors.return_date}</p>}
                                    </div>
                                </div>

                                {/* Selected Purchase Details Pill Header */}
                                {selectedPurchase && (
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold flex items-center gap-1 text-amber-400">
                                                <User className="w-4 h-4" /> {selectedPurchase.supplier?.name}
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-300 font-mono">Invoice #{selectedPurchase.invoice_no}</span>
                                        </div>

                                        <div className="flex items-center gap-4 font-mono">
                                            <span>Paid: <strong className="text-emerald-400">৳{fmtBDT(selectedPurchase.paid_amount)}</strong></span>
                                            <span>Due: <strong className="text-rose-400">৳{fmtBDT(selectedPurchase.due_amount)}</strong></span>
                                        </div>
                                    </div>
                                )}

                                {/* Return Items Selection Table */}
                                {data.items.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                                            <span>Select Items to Return</span>
                                            <span className="text-[11px] text-amber-700 font-semibold">
                                                Checked items will be returned to supplier
                                            </span>
                                        </label>

                                        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                                                    <tr>
                                                        <th className="p-3 w-10 text-center">Return</th>
                                                        <th className="p-3">Item Name</th>
                                                        <th className="p-3 text-center">Weight</th>
                                                        <th className="p-3 text-center">Purchased Qty</th>
                                                        <th className="p-3 text-center">Return Qty</th>
                                                        <th className="p-3 text-right">Return Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {data.items.map((item, idx) => (
                                                        <tr 
                                                            key={idx} 
                                                            className={`transition-colors ${item.selected ? 'bg-amber-50/60' : 'bg-gray-50/40 text-gray-400'}`}
                                                        >
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.selected}
                                                                    onChange={() => toggleItemSelection(idx)}
                                                                    className="w-4 h-4 rounded text-[#E88A1A] focus:ring-[#E88A1A] cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="font-bold text-gray-900">{item.product_name}</span>
                                                                <span className="block text-[10px] text-gray-400 uppercase font-mono">{item.stock_type}</span>
                                                            </td>
                                                            <td className="p-3 text-center font-mono font-bold text-amber-900">
                                                                {item.weight} g
                                                            </td>
                                                            <td className="p-3 text-center font-bold text-gray-600">
                                                                {item.max_qty} pcs
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.max_qty}
                                                                    value={item.quantity}
                                                                    disabled={!item.selected}
                                                                    onChange={(e) => updateItemQty(idx, e.target.value)}
                                                                    className="w-16 h-8 text-center rounded-lg border-gray-300 font-bold text-xs focus:border-[#E88A1A] focus:ring-[#E88A1A]/20 disabled:opacity-30"
                                                                />
                                                            </td>
                                                            <td className="p-3 text-right font-mono font-extrabold text-rose-600">
                                                                ৳ {fmtBDT(item.amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Total Return Amount & Reason */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-[#E88A1A]" />
                                            Return Reason / Remarks
                                        </label>
                                        <textarea
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                            className="w-full rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-[#E88A1A] text-xs p-3 placeholder:text-gray-400"
                                            rows="2"
                                            placeholder="e.g. Defective metal purity or wrong specification shipped"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                            Total Calculated Return Amount (BDT)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-600 font-extrabold text-xs select-none">৳</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.total_amount}
                                                onChange={(e) => setData('total_amount', e.target.value)}
                                                className="w-full h-11 pl-8 pr-3 rounded-2xl border-2 border-rose-300 bg-rose-50/50 focus:border-rose-500 font-extrabold text-sm text-rose-900 shadow-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer Actions */}
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
                                        disabled={isSubmitting || data.items.filter(i => i.selected).length === 0}
                                        className="px-6 py-2.5 bg-gradient-to-r from-[#E88A1A] to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <RotateCcw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                                        {isSubmitting ? 'Submitting...' : 'Submit Return Purchase'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── DIRECT PRINTABLE PURCHASE RETURN VOUCHER MODAL (REACT DOM PORTAL) ── */}
            {isVoucherOpen && selectedReturn && typeof document !== 'undefined' && createPortal(
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
                            #printable-return-voucher, #printable-return-voucher * {
                                visibility: visible !important;
                            }
                            #printable-return-voucher {
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
                        <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden text-left align-middle border border-amber-500/20 my-8 print:my-0 print:shadow-none print:border-none print:w-full print:rounded-none">
                            
                            {/* Modal Action Header (Hidden on Print) */}
                            <div className="bg-gradient-to-r from-amber-600 via-[#E88A1A] to-orange-500 px-6 py-4 flex items-center justify-between text-white shadow-md print-hide">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                                        <RotateCcw className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                                            Return Voucher #{selectedReturn.return_no}
                                        </h3>
                                        <p className="text-xs text-white/80">Supplier Purchase Return & Debit Voucher</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrintVoucher}
                                        className="bg-white text-gray-900 hover:bg-amber-50 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Printer className="w-4 h-4 text-[#E88A1A]" /> Print Voucher
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsVoucherOpen(false)}
                                        className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Printable Sheet Container */}
                            <div id="printable-return-voucher" className="p-8 sm:p-10 space-y-8 bg-white text-gray-900 print:p-4 print:space-y-6">
                                
                                {/* 1. Header Banner & Store Identity */}
                                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-amber-500/30 pb-6 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-[#E88A1A]" />
                                            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">JEWELRY ERP STORE</h1>
                                        </div>
                                        <p className="text-xs font-bold text-[#E88A1A] tracking-wider uppercase mt-0.5">
                                            Branch: {selectedReturn.branch?.name || 'Main Branch'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                            Official Supplier Inventory Purchase Return & Debit Note Certificate
                                        </p>
                                    </div>

                                    <div className="text-right sm:text-right w-full sm:w-auto bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
                                        <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest block">RETURN VOUCHER NO</span>
                                        <span className="text-2xl font-mono font-black text-[#E88A1A]">{selectedReturn.return_no}</span>
                                        <div className="text-xs text-gray-600 mt-1.5 space-y-0.5">
                                            <p><span className="font-semibold text-gray-500">Return Date:</span> <span className="font-bold text-gray-900">{selectedReturn.return_date}</span></p>
                                            <p><span className="font-semibold text-gray-500">Processed By:</span> <span className="font-bold text-gray-800">{selectedReturn.creator?.name || 'Inventory Staff'}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Supplier & Invoice Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                                        <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                            SUPPLIER DETAILS
                                        </span>
                                        <h4 className="text-base font-extrabold text-gray-900">{selectedReturn.purchase?.supplier?.name || 'Supplier'}</h4>
                                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                                            {selectedReturn.purchase?.supplier?.company_name && (
                                                <p className="font-bold text-gray-800">{selectedReturn.purchase.supplier.company_name}</p>
                                            )}
                                            {selectedReturn.purchase?.supplier?.phone && (
                                                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> {selectedReturn.purchase.supplier.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-right sm:text-right">
                                        <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider block mb-2">
                                            ORIGINAL PURCHASE INVOICE
                                        </span>
                                        <span className="font-mono font-black text-gray-900 text-lg block">
                                            {selectedReturn.purchase?.invoice_no || '-'}
                                        </span>
                                        <div className="mt-2 text-xs text-gray-600">
                                            <p>Original Invoice Total: <span className="font-bold text-gray-900">৳ {fmtBDT(selectedReturn.purchase?.grand_total)}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Returned Items Table */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <Award className="w-4 h-4 text-[#E88A1A]" />
                                        Returned Item Breakdown
                                    </h4>
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-[#E88A1A] text-white font-bold uppercase">
                                                <tr>
                                                    <th className="p-3 text-center w-10">#</th>
                                                    <th className="p-3">Item Description</th>
                                                    <th className="p-3 text-center">Returned Qty</th>
                                                    <th className="p-3 text-right">Return Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {selectedReturn.items?.map((item, idx) => (
                                                    <tr key={item.id || idx} className="hover:bg-amber-50/30">
                                                        <td className="p-3 text-center font-bold text-gray-400">{idx + 1}</td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-gray-900">
                                                                {item.purchase_item?.item_name || item.purchase_item?.product?.name || 'Returned Jewelry Item'}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-gray-800">{item.quantity} pcs</td>
                                                        <td className="p-3 text-right font-extrabold text-rose-600">৳ {fmtBDT(item.amount)}</td>
                                                    </tr>
                                                ))}
                                                {(!selectedReturn.items || selectedReturn.items.length === 0) && (
                                                    <tr>
                                                        <td colSpan="4" className="p-4 text-center text-gray-400 italic">
                                                            Returned items recorded.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 4. Total Return Summary & Reason */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-gray-200 pt-4">
                                    <div className="text-xs text-gray-600 space-y-2 max-w-sm w-full">
                                        {selectedReturn.reason && (
                                            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                                                <p className="font-bold text-amber-900 uppercase text-[11px] mb-1">Return Reason / Notes</p>
                                                <p className="italic text-gray-700">{selectedReturn.reason}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full sm:w-72 space-y-2 text-xs">
                                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 flex justify-between items-center text-xs font-bold text-rose-900">
                                            <span>Total Return Value:</span>
                                            <span className="text-lg font-black text-rose-700">৳ {fmtBDT(selectedReturn.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Signature Blocks */}
                                <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs font-bold text-gray-600">
                                    <div>
                                        <div className="border-b border-gray-400 w-40 mx-auto mb-2"></div>
                                        <p>Supplier Receiver Signature</p>
                                    </div>
                                    <div>
                                        <div className="border-b border-gray-400 w-40 mx-auto mb-2"></div>
                                        <p>Authorized Manager Signature</p>
                                    </div>
                                </div>

                                {/* 6. Footer Note */}
                                <div className="border-t border-gray-200 pt-3 text-center text-[10px] text-gray-400">
                                    Computer generated purchase return voucher receipt. Valid with authorized stamp.
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
