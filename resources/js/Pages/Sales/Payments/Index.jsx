import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { 
    CreditCard, Plus, Search, DollarSign, Calendar, 
    CheckCircle2, Clock, Trash2, X, Receipt, Building,
    Eye, RotateCcw, AlertCircle, User, Phone, FileText
} from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Index({ payments = {}, dueSales = [], stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
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

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('sales.payments.index'), { search }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
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
                setIsCreateOpen(false);
                reset();
                setSelectedSaleDue(0);
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

                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#E88A1A] hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add Due Collection
                    </button>
                </div>
            }
        >
            <Head title="Due Collection" />

            {/* Top Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Total Collected</span>
                        <span className="text-xl font-black text-emerald-700">৳ {fmtBDT(stats?.total_collected)}</span>
                    </div>
                    <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Outstanding Due</span>
                        <span className="text-xl font-black text-rose-600">৳ {fmtBDT(stats?.outstanding_due)}</span>
                    </div>
                    <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase text-gray-500 block mb-1">Due Invoices / Customers</span>
                        <span className="text-xl font-black text-amber-800">{dueSales?.length || 0} Invoices</span>
                    </div>
                    <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
                        <User className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[240px]">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by invoice no, customer name, mobile or reference..."
                                className="w-full pl-9 text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                            />
                        </div>
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

            {/* Customer Due Collection Payments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pb-52 min-h-[350px]">
                <div className="overflow-x-auto pb-36">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#E88A1A] text-white">
                            <tr>
                                <th className="px-4 py-3.5 font-bold rounded-tl-lg">Date</th>
                                <th className="px-4 py-3.5 font-bold">Sale Invoice</th>
                                <th className="px-4 py-3.5 font-bold">Customer Name</th>
                                <th className="px-4 py-3.5 font-bold">Mobile</th>
                                <th className="px-4 py-3.5 font-bold text-right">Total Bill</th>
                                <th className="px-4 py-3.5 font-bold text-right">Paid Amount</th>
                                <th className="px-4 py-3.5 font-bold text-right">Remaining Due</th>
                                <th className="px-4 py-3.5 font-bold text-center">Method</th>
                                <th className="px-4 py-3.5 font-bold text-center rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.data && payments.data.length > 0 ? (
                                payments.data.map((pay, idx) => {
                                    const customerName = pay.customer?.name || pay.sale?.customer?.name || 'Walk-in';
                                    const customerPhone = pay.customer?.phone || pay.sale?.customer?.phone || '—';
                                    const grandTotal = Number(pay.sale?.grand_total || 0);
                                    const currentDue = Number(pay.sale?.due_amount || 0);

                                    return (
                                        <tr key={pay.id} className="hover:bg-amber-50/40 transition-colors">
                                            {/* Payment Date */}
                                            <td className="px-4 py-3.5 text-gray-700 font-medium whitespace-nowrap">
                                                {pay.payment_date ? String(pay.payment_date).substring(0, 10) : '—'}
                                            </td>

                                            {/* Sale Invoice */}
                                            <td className="px-4 py-3.5 font-bold text-indigo-700 whitespace-nowrap">
                                                {pay.sale?.invoice_no || '—'}
                                            </td>

                                            {/* Customer Name */}
                                            <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                                                {customerName}
                                            </td>

                                            {/* Mobile */}
                                            <td className="px-4 py-3.5 text-gray-600 font-mono text-xs whitespace-nowrap">
                                                {customerPhone}
                                            </td>

                                            {/* Total Bill */}
                                            <td className="px-4 py-3.5 text-right font-black text-gray-900 whitespace-nowrap">
                                                ৳ {fmtBDT(grandTotal)}
                                            </td>

                                            {/* Paid Amount */}
                                            <td className="px-4 py-3.5 text-right font-black text-emerald-700 whitespace-nowrap">
                                                ৳ {fmtBDT(pay.amount)}
                                            </td>

                                            {/* Remaining Due */}
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                {currentDue > 0 ? (
                                                    <span className="font-black text-rose-600">
                                                        ৳ {fmtBDT(currentDue)}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200">
                                                        Paid
                                                    </span>
                                                )}
                                            </td>

                                            {/* Method */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-full border border-gray-200 capitalize">
                                                    {pay.payment_method?.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Action Dropdown Menu */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
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

                                                    <Dropdown.Content align={payments.data?.length > 3 && idx >= payments.data.length - 2 ? 'top-right' : 'right'} className="w-44 py-1 bg-white text-xs font-bold border border-gray-200 shadow-2xl z-50">
                                                        {/* View Receipt */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openReceiptModal(pay)}
                                                            className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-500" /> View Receipt
                                                        </button>



                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePayment(pay.id)}
                                                            className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
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
                                    <td colSpan="9" className="px-4 py-12 text-center text-gray-400 font-semibold">
                                        No customer due collection history recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {payments.links && (
                    <div className="mt-6">
                        <Pagination links={payments.links} />
                    </div>
                )}
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

                        {selectedPayment.notes && (
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                                <span className="text-gray-500 font-bold block mb-0.5">Notes:</span>
                                <p className="text-gray-800">{selectedPayment.notes}</p>
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

            {/* Receive Due Payment Modal */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-600" />
                            Receive Customer Due Payment
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Select Invoice with Due */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Due Sale Invoice *</label>
                        <select
                            required
                            value={data.sale_id}
                            onChange={(e) => handleSelectSale(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                        >
                            <option value="">Choose Invoice with Due</option>
                            {dueSales.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.invoice_no} — {s.customer?.name || 'Walk-in'} (Due: ৳{fmtBDT(s.due_amount)})
                                </option>
                            ))}
                        </select>
                        {errors.sale_id && <p className="text-xs text-rose-500 mt-1">{errors.sale_id}</p>}
                    </div>

                    {selectedSaleDue > 0 && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900">Current Balance Due:</span>
                            <span className="text-base font-black text-rose-600">৳ {fmtBDT(selectedSaleDue)}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Payment Date */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Payment Date *</label>
                            <input
                                type="date"
                                required
                                value={data.payment_date}
                                onChange={(e) => setData('payment_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-emerald-700 mb-1">Amount Collected (৳) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Method */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Payment Method *</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                            >
                                <option value="cash">Cash</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="card">Card / POS</option>
                                <option value="mobile_money">bKash / Nagad / Rocket</option>
                            </select>
                        </div>

                        {/* Reference No */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Reference / Trx ID</label>
                            <input
                                type="text"
                                value={data.reference_no}
                                onChange={(e) => setData('reference_no', e.target.value)}
                                placeholder="TRX-12345 or Cheque #"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Notes</label>
                        <textarea
                            rows="2"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Additional payment notes..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                            {processing ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
