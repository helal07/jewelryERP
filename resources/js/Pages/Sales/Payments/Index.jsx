import React, { useState, useEffect, useMemo, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { 
    CreditCard, Plus, Search, DollarSign, Calendar, 
    CheckCircle2, Clock, Trash2, X, Receipt, Building,
    Eye, RotateCcw, AlertCircle, User, Phone, FileText, MapPin
} from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Index({ payments = {}, dueSales = [], stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [historyDate, setHistoryDate] = useState(filters.date || '');
    
    // Due Collection Search
    const [dueSearch, setDueSearch] = useState('');
    
    const [selectedSaleDue, setSelectedSaleDue] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    // Payment Form
    const { data, setData, post, processing, errors, reset } = useForm({
        sale_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'cash',
        reference_no: '',
        notes: '',
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    // Get unique customers from dueSales
    const uniqueCustomers = useMemo(() => {
        const map = new Map();
        dueSales.forEach(s => {
            if (s.customer && !map.has(s.customer.id)) {
                map.set(s.customer.id, s.customer);
            }
        });
        return Array.from(map.values());
    }, [dueSales]);

    // Filter customers based on search
    const filteredCustomers = useMemo(() => {
        if (!dueSearch) return uniqueCustomers;
        const q = dueSearch.toLowerCase();
        return uniqueCustomers.filter(c => {
            const matchCust = 
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.phone && c.phone.toLowerCase().includes(q)) ||
                (c.address && c.address.toLowerCase().includes(q));
            
            // Also match if they have an invoice number matching the search
            const matchInv = dueSales.some(s => s.customer_id === c.id && s.invoice_no && s.invoice_no.toLowerCase().includes(q));
            return matchCust || matchInv;
        });
    }, [dueSearch, uniqueCustomers, dueSales]);

    // Derived customer and their invoices
    const selectedCustomer = uniqueCustomers.find(c => c.id === selectedCustomerId) || null;
    const customerDueSales = selectedCustomer ? dueSales.filter(s => s.customer_id === selectedCustomerId) : [];
    
    // Calculate customer's total due across all their invoices (ledger style)
    const customerTotalDue = customerDueSales.reduce((sum, s) => sum + Number(s.due_amount || 0), 0);

    const selectedSale = dueSales.find(s => s.id == data.sale_id) || null;

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('sales.payments.index'), { search, date: historyDate }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setHistoryDate('');
        router.get(route('sales.payments.index'), {}, { preserveState: true });
    };

    const handleSelectSale = (saleId) => {
        const found = dueSales.find(s => s.id == saleId);
        const due = found ? Number(found.due_amount || 0) : 0;
        setSelectedSaleDue(due);

        setData({
            ...data,
            sale_id: saleId,
            amount: due > 0 ? due.toFixed(2) : '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.payments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedSaleDue(0);
                setDueSearch('');
                setSelectedCustomerId(null);
            },
        });
    };

    const openReceiptModal = (payment) => {
        setSelectedPayment(payment);
        setIsReceiptOpen(true);
    };

    const handleDeletePayment = (paymentId) => {
        if (confirm('Are you sure you want to delete this customer payment? The sale invoice due balance will be restored.')) {
            router.delete(route('sales.payments.destroy', paymentId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard className="w-7 h-7 text-[#E88A1A]" />
                            Due Collection
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Due Collection" />

            <div className="flex flex-col xl:flex-row gap-6 mb-10 items-start">
                
                {/* LEFT COLUMN: DUE COLLECTION FORM */}
                <div className="w-full xl:w-[35%] space-y-4">
                    
                    {/* Stats Summary (Compact) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-sm">
                            <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">Total Outstanding Due</span>
                            <span className="text-lg font-black text-rose-600">৳ {fmtBDT(stats?.outstanding_due)}</span>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">
                            <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">Total Collected</span>
                            <span className="text-lg font-black text-emerald-700">৳ {fmtBDT(stats?.total_collected)}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-amber-50 px-5 py-4 border-b border-amber-100 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-amber-700" />
                            <h3 className="font-bold text-amber-900 text-lg">Receive Due Payment</h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            
                            {/* 1. Search & Select Customer */}
                            <div className="space-y-3 relative">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Search Customer / Invoice</label>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={dueSearch}
                                            onChange={(e) => {
                                                setDueSearch(e.target.value);
                                                setIsDropdownOpen(true);
                                                if (selectedCustomerId) {
                                                    setSelectedCustomerId(null);
                                                    setData('sale_id', '');
                                                }
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                            placeholder="Mobile, Name, Address, or Invoice No..."
                                            className="w-full pl-9 text-sm rounded-xl border-gray-300 focus:border-amber-500 py-2 transition-all"
                                        />
                                        
                                        {/* Autocomplete Dropdown */}
                                        {isDropdownOpen && (
                                            <div className="absolute z-[999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                                {filteredCustomers.length > 0 ? (
                                                    filteredCustomers.map(c => (
                                                        <div 
                                                            key={c.id}
                                                            onClick={() => {
                                                                setSelectedCustomerId(c.id);
                                                                setDueSearch(c.name);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-center gap-3"
                                                        >
                                                            {c.photo ? (
                                                                <img src={`/storage/${c.photo}`} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200">
                                                                    {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-bold text-gray-900">{c.name}</div>
                                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                                    <span className="flex items-center"><Phone className="w-3 h-3 mr-0.5"/>{c.phone || 'N/A'}</span>
                                                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5"/>{c.address || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500">No matching customers found.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Due Details Card */}
                            {selectedCustomer && (
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <div className="flex gap-3">
                                            {selectedCustomer.photo ? (
                                                <img src={`/storage/${selectedCustomer.photo}`} alt={selectedCustomer.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200 text-lg flex-shrink-0">
                                                    {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <span className="font-bold text-gray-900 block">{selectedCustomer.name || 'Walk-in'}</span>
                                                <span className="text-gray-500 flex items-center gap-1 text-xs mt-0.5">
                                                    <Phone className="w-3 h-3" /> {selectedCustomer.phone || 'N/A'}
                                                </span>
                                                <span className="text-gray-500 flex items-start gap-1 text-xs mt-0.5">
                                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" /> <span className="line-clamp-2 leading-tight">{selectedCustomer.address || 'N/A'}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Due</span>
                                            <span className="font-black text-rose-600 text-lg">৳ {fmtBDT(customerTotalDue)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Invoice to Pay *</label>
                                        <select
                                            required
                                            value={data.sale_id}
                                            onChange={(e) => handleSelectSale(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                                        >
                                            <option value="">-- Choose Invoice --</option>
                                            {customerDueSales.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.invoice_no} (Due: ৳{fmtBDT(s.due_amount)})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.sale_id && <p className="text-xs text-rose-500 mt-1">{errors.sale_id}</p>}
                                    </div>


                                    {/* Show specific invoice details if selected */}
                                    {selectedSale && (
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                                            <span className="text-sm font-bold text-gray-700">Invoice {selectedSale.invoice_no} Due:</span>
                                            <span className="font-black text-rose-600 text-lg">৳ {fmtBDT(selectedSale.due_amount)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Form Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Payment Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={data.payment_date}
                                        onChange={(e) => setData('payment_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-emerald-700 mb-1">Amount (৳) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-900 focus:ring-emerald-500"
                                    />
                                    {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Method *</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-800"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="card">Card / POS</option>
                                        <option value="mobile_money">Mobile Money</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Reference / Trx ID</label>
                                    <input
                                        type="text"
                                        value={data.reference_no}
                                        onChange={(e) => setData('reference_no', e.target.value)}
                                        placeholder="Optional"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Notes</label>
                                <textarea
                                    rows="2"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Remarks..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.sale_id}
                                className="w-full py-3 bg-[#E88A1A] hover:bg-amber-600 text-white rounded-xl text-sm font-black shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {processing ? 'Recording...' : 'Record Payment'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: HISTORY TABLE */}
                <div className="w-full xl:w-[65%] flex flex-col h-full space-y-4">
                    
                    {/* Filters for History */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search history by name, mobile, address..."
                                        className="w-full pl-9 text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] py-2"
                                    />
                                </div>
                            </div>
                            <div className="w-40">
                                <input
                                    type="date"
                                    value={historyDate}
                                    onChange={(e) => setHistoryDate(e.target.value)}
                                    className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] py-2"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
                                title="Reset Filter"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex-1 pb-32">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Payment Receive History
                        </h3>
                        
                        {/* Mobile Responsive Overflow wrapper */}
                        <div className="overflow-x-visible pb-24">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 font-bold rounded-tl-lg">Date</th>
                                            <th className="px-4 py-3 font-bold">Invoice</th>
                                            <th className="px-4 py-3 font-bold">Customer Detail</th>
                                            <th className="px-4 py-3 font-bold text-right">Collected</th>
                                            <th className="px-4 py-3 font-bold text-right">Balance Due</th>
                                            <th className="px-4 py-3 font-bold text-center rounded-tr-lg">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.data && payments.data.length > 0 ? (
                                            payments.data.map((pay, idx) => {
                                                const customerName = pay.customer?.name || pay.sale?.customer?.name || 'Walk-in';
                                                const customerPhone = pay.customer?.phone || pay.sale?.customer?.phone || '—';
                                                const currentDue = Number(pay.sale?.due_amount || 0);

                                                return (
                                                    <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                                                            {pay.payment_date ? String(pay.payment_date).substring(0, 10) : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-indigo-700 whitespace-nowrap">
                                                            {pay.sale?.invoice_no || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="font-bold text-gray-900">{customerName}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{customerPhone}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-black text-emerald-700 whitespace-nowrap">
                                                            ৳ {fmtBDT(pay.amount)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                                            {currentDue > 0 ? (
                                                                <span className="font-black text-rose-600">
                                                                    ৳ {fmtBDT(currentDue)}
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full">
                                                                    Paid
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                                            <Dropdown>
                                                                <Dropdown.Trigger>
                                                                    <button
                                                                        type="button"
                                                                        className="inline-flex items-center px-3 py-1 border border-amber-300 rounded-xl text-xs font-bold text-amber-800 bg-white hover:bg-amber-50 cursor-pointer shadow-xs"
                                                                    >
                                                                        Options
                                                                        <svg className="ml-1 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </Dropdown.Trigger>

                                                                <Dropdown.Content align="right" className="w-40 py-1 bg-white border border-gray-200 shadow-xl z-[9999]">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); openReceiptModal(pay); }}
                                                                        className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-semibold text-xs"
                                                                    >
                                                                        <Eye className="w-4 h-4 text-gray-500" /> View Receipt
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleDeletePayment(pay.id); }}
                                                                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer font-semibold text-xs"
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
                                                <td colSpan="6" className="px-4 py-12 text-center text-gray-400 font-semibold">
                                                    No history found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                        </div>

                        {payments.links && (
                            <div className="mt-6 border-t border-gray-100 pt-4">
                                <Pagination links={payments.links} />
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* View Payment Receipt Slip Modal */}
            {isReceiptOpen && selectedPayment && (
                <Modal show={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} maxWidth="md">
                    <div className="p-6 space-y-4 text-xs font-sans">
                        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-base font-black text-gray-900">
                                    Due Collection Receipt
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsReceiptOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Payment Date:</span>
                                <span className="font-extrabold text-gray-900">{selectedPayment.payment_date ? String(selectedPayment.payment_date).substring(0, 10) : '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Invoice No:</span>
                                <span className="font-extrabold text-indigo-700">{selectedPayment.sale?.invoice_no || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Customer Name:</span>
                                <span className="font-bold text-gray-900">{selectedPayment.customer?.name || selectedPayment.sale?.customer?.name || 'Walk-in'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold">Mobile:</span>
                                <span className="font-mono text-gray-700">{selectedPayment.customer?.phone || selectedPayment.sale?.customer?.phone || '—'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <span className="text-gray-500 font-bold block mb-0.5">Total Invoice Bill:</span>
                                <span className="font-black text-gray-900 text-sm">৳ {fmtBDT(selectedPayment.sale?.grand_total)}</span>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                                <span className="text-emerald-700 font-bold block mb-0.5">Collected Amount:</span>
                                <span className="font-black text-emerald-800 text-sm">৳ {fmtBDT(selectedPayment.amount)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <span className="text-gray-500 font-bold block">Payment Method:</span>
                                <span className="font-extrabold text-gray-900 capitalize">{selectedPayment.payment_method?.replace('_', ' ')}</span>
                            </div>
                            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                                <span className="text-rose-600 font-bold block">Remaining Due:</span>
                                <span className="font-black text-rose-700">৳ {fmtBDT(selectedPayment.sale?.due_amount)}</span>
                            </div>
                        </div>

                        {selectedPayment.reference_no && (
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                                <span className="text-gray-500 font-bold">Reference / Trx: </span>
                                <span className="font-bold text-gray-800">{selectedPayment.reference_no}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsReceiptOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
