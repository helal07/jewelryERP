import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { 
    RotateCcw, Plus, Search, CheckCircle2, Clock, 
    Calendar, DollarSign, User, Receipt, X, AlertCircle, Eye, Filter, Trash2
} from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Index({ returns = {}, sales = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Form state for creating a return
    const { data, setData, post, processing, errors, reset } = useForm({
        sale_id: '',
        return_date: new Date().toISOString().split('T')[0],
        reason: '',
        refund_amount: '0',
        items: [],
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const saleIdParam = urlParams.get('sale_id') || urlParams.get('create');
        if (saleIdParam && sales.length > 0) {
            handleSelectSale(saleIdParam);
            setIsCreateOpen(true);
        }
    }, [sales]);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('sales.returns.index'), { search }, { preserveState: true });
    };

    const openViewModal = (ret) => {
        setSelectedReturn(ret);
        setIsViewOpen(true);
    };

    const handleDeleteReturn = (id) => {
        if (confirm('Are you sure you want to delete this sale return voucher? The invoice due balance will be restored.')) {
            router.delete(route('sales.returns.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleSelectSale = (saleId) => {
        const foundSale = sales.find(s => s.id == saleId);
        if (foundSale && foundSale.items) {
            const mappedItems = foundSale.items.map(item => ({
                sale_item_id: item.id,
                product_id: item.product_id,
                product_name: item.product?.name || 'Jewelry Product',
                max_qty: item.quantity,
                quantity: 1,
                unit_price: item.rate_per_gram || (item.total_amount / (item.quantity || 1)),
            }));
            const initialRefund = mappedItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);

            setData({
                ...data,
                sale_id: saleId,
                items: mappedItems,
                refund_amount: initialRefund.toFixed(2),
            });
        } else {
            setData({
                ...data,
                sale_id: saleId,
                items: [],
                refund_amount: '0',
            });
        }
    };

    const handleItemQtyChange = (index, qty) => {
        const newItems = [...data.items];
        const item = newItems[index];
        const validQty = Math.max(1, Math.min(item.max_qty, parseInt(qty) || 1));
        newItems[index].quantity = validQty;

        const computedRefund = newItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);

        setData({
            ...data,
            items: newItems,
            refund_amount: computedRefund.toFixed(2),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.returns.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <RotateCcw className="w-7 h-7 text-[#E88A1A]" />
                            Sales Return
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 bg-[#E88A1A] hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition"
                    >
                        <Plus className="w-4 h-4" /> New Return
                    </button>
                </div>
            }
        >
            <Head title="Sale Returns" />

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
                                placeholder="Search by return no, invoice no, or customer name..."
                                className="w-full pl-9 text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-900 transition"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pb-52 min-h-[350px]">
                <div className="overflow-x-auto pb-36">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#E88A1A] text-white">
                            <tr>
                                <th className="px-4 py-3.5 font-bold rounded-tl-lg">Return #</th>
                                <th className="px-4 py-3.5 font-bold">Return Date</th>
                                <th className="px-4 py-3.5 font-bold">Sale Invoice</th>
                                <th className="px-4 py-3.5 font-bold">Customer</th>
                                <th className="px-4 py-3.5 font-bold text-right">Refund Amount</th>
                                <th className="px-4 py-3.5 font-bold">Reason</th>
                                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                                <th className="px-4 py-3.5 font-bold text-center rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {returns.data && returns.data.length > 0 ? (
                                returns.data.map((ret, idx) => (
                                    <tr key={ret.id} className="hover:bg-amber-50/40 transition-colors">
                                        <td className="px-4 py-3.5 font-bold text-amber-800 whitespace-nowrap">
                                            {ret.return_no}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-700 font-medium whitespace-nowrap">
                                            {ret.return_date ? String(ret.return_date).substring(0, 10) : '—'}
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-indigo-700 whitespace-nowrap">
                                            {ret.sale?.invoice_no || '—'}
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{ret.customer?.name || ret.sale?.customer?.name || 'Walk-in'}</div>
                                            <div className="text-xs text-gray-500">{ret.customer?.phone || ret.sale?.customer?.phone || ''}</div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-black text-rose-600 whitespace-nowrap">
                                            ৳ {fmtBDT(ret.refund_amount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600 text-xs max-w-xs truncate">
                                            {ret.reason || 'Customer Return'}
                                        </td>
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                                                Completed
                                            </span>
                                        </td>
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

                                                <Dropdown.Content align={returns.data?.length > 3 && idx >= returns.data.length - 2 ? 'top-right' : 'right'} className="w-44 py-1 bg-white text-xs font-bold border border-gray-200 shadow-2xl z-50">
                                                    {/* View */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openViewModal(ret)}
                                                        className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Eye className="w-4 h-4 text-gray-500" /> View
                                                    </button>



                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteReturn(ret.id)}
                                                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-rose-500" /> Delete
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-12 text-center text-gray-400 font-semibold">
                                        No sale return vouchers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {returns.links && (
                    <div className="mt-6">
                        <Pagination links={returns.links} />
                    </div>
                )}
            </div>

            {/* View Return Voucher Modal */}
            {isViewOpen && selectedReturn && (
                <Modal show={isViewOpen} onClose={() => setIsViewOpen(false)} maxWidth="xl">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-amber-700" />
                                <h3 className="text-lg font-black text-gray-900">
                                    Return Voucher #{selectedReturn.return_no}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsViewOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                                <span className="text-gray-500 font-bold block">Return Date:</span>
                                <span className="font-extrabold text-gray-900">{selectedReturn.return_date ? String(selectedReturn.return_date).substring(0, 10) : '—'}</span>
                            </div>
                            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                                <span className="text-gray-500 font-bold block">Sale Invoice:</span>
                                <span className="font-extrabold text-indigo-700">{selectedReturn.sale?.invoice_no || '—'}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <span className="text-gray-500 font-bold block">Customer:</span>
                                <span className="font-bold text-gray-900">{selectedReturn.customer?.name || selectedReturn.sale?.customer?.name || 'Walk-in'}</span>
                            </div>
                            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                                <span className="text-rose-600 font-bold block">Refund Amount:</span>
                                <span className="font-black text-rose-700 text-sm">৳ {fmtBDT(selectedReturn.refund_amount)}</span>
                            </div>
                        </div>

                        {selectedReturn.reason && (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                                <span className="text-gray-500 font-bold block mb-0.5">Return Reason:</span>
                                <p className="text-gray-800 font-semibold">{selectedReturn.reason}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsViewOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Process Sale Return Modal */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-amber-600" />
                            Process Sale Return
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Select Sale Invoice */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Sale Invoice *</label>
                            <select
                                required
                                value={data.sale_id}
                                onChange={(e) => handleSelectSale(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                            >
                                <option value="">Choose Invoice</option>
                                {sales.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.invoice_no} — {s.customer?.name} (৳{fmtBDT(s.grand_total)})
                                    </option>
                                ))}
                            </select>
                            {errors.sale_id && <p className="text-xs text-rose-500 mt-1">{errors.sale_id}</p>}
                        </div>

                        {/* Return Date */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Return Date *</label>
                            <input
                                type="date"
                                required
                                value={data.return_date}
                                onChange={(e) => setData('return_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>
                    </div>

                    {/* Return Items Selection */}
                    {data.items.length > 0 && (
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 font-bold text-xs text-gray-700 uppercase">
                                Invoice Items to Return
                            </div>
                            <div className="divide-y divide-gray-100 p-2 max-h-56 overflow-y-auto">
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 text-xs">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.product_name}</p>
                                            <p className="text-gray-500">Unit Price: ৳{fmtBDT(item.unit_price)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Qty:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.max_qty}
                                                value={item.quantity}
                                                onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold text-center"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Refund Amount & Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Refund Amount (৳) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={data.refund_amount}
                                onChange={(e) => setData('refund_amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-rose-600 focus:ring-2 focus:ring-rose-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Return Reason</label>
                            <input
                                type="text"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder="Exchange, defect, customer request..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                        >
                            {processing ? 'Processing...' : 'Confirm Return'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
