import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Landmark, ArrowLeft, Building2, User, Calendar, Percent, FileText, CheckCircle2, Clock, AlertCircle, Phone, MapPin, Plus, Edit, X, Trash2, DollarSign } from 'lucide-react';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (status) => {
    switch (status) {
        case 'active':
            return <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><CheckCircle2 className="w-4 h-4" /> Active</span>;
        case 'redeemed':
            return <span className="px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><Clock className="w-4 h-4" /> Redeemed</span>;
        case 'overdue':
            return <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><AlertCircle className="w-4 h-4" /> Overdue</span>;
        case 'forfeited':
            return <span className="px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-sm font-bold flex items-center gap-1.5 w-max"><AlertCircle className="w-4 h-4" /> Forfeited</span>;
        default:
            return <span className="px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-sm font-bold w-max">{status}</span>;
    }
};

export default function Show({ mortgage }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Payment Form
    const paymentForm = useForm({
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_type: 'interest',
        notes: '',
    });

    // Status Form
    const statusForm = useForm({
        status: mortgage.status || 'active',
    });

    // Edit Form
    const editForm = useForm({
        due_date: mortgage.due_date || '',
        interest_rate: mortgage.interest_rate || '',
        interest_type: mortgage.interest_type || 'monthly',
        notes: mortgage.notes || '',
    });

    const totalPaid = (mortgage.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const remainingBalance = Math.max(0, Number(mortgage.principal_amount || 0) - totalPaid);

    const handleAddPayment = (e) => {
        e.preventDefault();
        paymentForm.post(route('mortgages.payments.store', mortgage.id), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                paymentForm.reset();
            }
        });
    };

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        statusForm.patch(route('mortgages.update-status', mortgage.id), {
            onSuccess: () => setIsStatusModalOpen(false)
        });
    };

    const handleUpdateDetails = (e) => {
        e.preventDefault();
        editForm.patch(route('mortgages.update', mortgage.id), {
            onSuccess: () => setIsEditModalOpen(false)
        });
    };

    const handleDeletePayment = (paymentId) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            paymentForm.delete(route('mortgages.payments.destroy', [mortgage.id, paymentId]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('mortgages.index')} 
                            className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                                Mortgage Details
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsStatusModalOpen(true)}
                            className="hover:opacity-80 transition-opacity"
                        >
                            {statusBadge(mortgage.status)}
                        </button>
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="px-4 py-2.5 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 hover:opacity-90 active:opacity-100 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4" /> Add Payment
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Mortgage ${mortgage.mortgage_no}`} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Column: Customer & Details */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-[#E88A1A]" /> Customer Info
                        </h3>
                        {mortgage.customer ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 font-semibold mb-0.5">Name</div>
                                    <div className="text-sm font-bold text-gray-900">{mortgage.customer.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-semibold mb-0.5">Phone</div>
                                    <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {mortgage.customer.phone}</div>
                                </div>
                                {mortgage.customer.address && (
                                    <div>
                                        <div className="text-xs text-gray-500 font-semibold mb-0.5">Address</div>
                                        <div className="text-sm font-medium text-gray-700 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> <span className="flex-1">{mortgage.customer.address}</span></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Unknown Customer</p>
                        )}
                    </div>

                    {/* Mortgage Summary */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#E88A1A]" /> Summary
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="p-1.5 text-gray-400 hover:text-[#E88A1A] hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit Mortgage Details"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-semibold flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Branch</span>
                                <span className="text-sm font-bold text-gray-900">{mortgage.branch?.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-semibold flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Mortgage Date</span>
                                <span className="text-sm font-bold text-gray-900">{mortgage.mortgage_date ? String(mortgage.mortgage_date).split('T')[0].split(' ')[0] : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-semibold flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Due Date</span>
                                <span className="text-sm font-bold text-gray-900">{mortgage.due_date ? String(mortgage.due_date).split('T')[0].split(' ')[0] : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-semibold flex items-center gap-1.5"><Percent className="w-4 h-4" /> Interest Rate</span>
                                <span className="text-sm font-bold text-gray-900">{mortgage.interest_rate}% ({mortgage.interest_type})</span>
                            </div>

                            {/* Financial Calculations */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-semibold">Principal Amount</span>
                                    <span className="font-bold text-gray-900">৳ {fmtBDT(mortgage.principal_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-semibold">Total Paid</span>
                                    <span className="font-bold text-emerald-600">৳ {fmtBDT(totalPaid)}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm">
                                    <span className="text-gray-700 font-extrabold">Remaining Principal</span>
                                    <span className="text-base font-extrabold text-[#E88A1A]">৳ {fmtBDT(remainingBalance)}</span>
                                </div>
                            </div>

                            {mortgage.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500 italic">
                                    <strong>Notes:</strong> {mortgage.notes}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Items & Payments */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Pledged Items Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Landmark className="w-5 h-5 text-[#E88A1A]" /> Pledged Items
                            </h3>
                        </div>
                        <div className="overflow-x-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">Item Details</th>
                                        <th className="px-4 py-3">Metal / Purity</th>
                                        <th className="px-4 py-3 text-right">Traditional Wt.</th>
                                        <th className="px-4 py-3 text-right">Gross Wt.</th>
                                        <th className="px-4 py-3 text-right">Net Wt.</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-4 py-3 text-right">Est. Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {mortgage.items?.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/30">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    {item.image ? (
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                            <img src={`/storage/${item.image}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-400 flex items-center justify-center shrink-0 border border-orange-100">
                                                            <Landmark className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900">{item.item_name}</div>
                                                        <div className="text-xs font-medium text-gray-500 capitalize">{item.stock_type?.replace('_', ' ') || 'Readymade'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-xs font-semibold uppercase text-gray-500">{item.metal_type}</div>
                                                <div className="font-medium text-gray-800">{item.purity?.name}</div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {item.weight_unit === 'traditional' ? (
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {item.vori}v, {item.ana}a, {item.roti}r, {item.point}p
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-gray-700">{item.gross_weight}g</td>
                                            <td className="px-4 py-4 text-right font-medium text-gray-700">{item.net_weight}g</td>
                                            <td className="px-4 py-4 text-center font-bold text-gray-900">{item.quantity}</td>
                                            <td className="px-4 py-4 text-right font-bold text-gray-900">৳ {fmtBDT(item.estimated_value)}</td>
                                        </tr>
                                    ))}
                                    {(!mortgage.items || mortgage.items.length === 0) && (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500 italic">No items pledged.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payments Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#E88A1A]" /> Payments Ledger
                            </h3>
                            <button 
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Add Payment
                            </button>
                        </div>
                        <div className="overflow-x-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">Receipt No</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Notes</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {mortgage.payments?.map(payment => (
                                        <tr key={payment.id} className="hover:bg-gray-50/30">
                                            <td className="px-4 py-4 font-bold text-gray-900">{payment.payment_no}</td>
                                            <td className="px-4 py-4 font-medium text-gray-700">{payment.payment_date}</td>
                                            <td className="px-4 py-4 font-medium capitalize text-gray-700">
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg uppercase">
                                                    {payment.payment_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-500 italic">{payment.notes || '—'}</td>
                                            <td className="px-4 py-4 text-right font-bold text-emerald-600">৳ {fmtBDT(payment.amount)}</td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => handleDeletePayment(payment.id)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Payment"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!mortgage.payments || mortgage.payments.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500 italic">No payments recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>

            {/* Modal 1: Add Payment */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-scale-up">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-[#E88A1A]" /> Add Payment Record
                            </h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Payment Date</label>
                                <input
                                    type="date"
                                    value={paymentForm.data.payment_date}
                                    onChange={e => paymentForm.setData('payment_date', e.target.value)}
                                    className="w-full h-10 rounded-xl border-gray-200 text-sm font-medium focus:border-[#E88A1A]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Payment Type</label>
                                <select
                                    value={paymentForm.data.payment_type}
                                    onChange={e => paymentForm.setData('payment_type', e.target.value)}
                                    className="w-full h-10 rounded-xl border-gray-200 text-sm font-medium focus:border-[#E88A1A]"
                                >
                                    <option value="interest">Interest Payment</option>
                                    <option value="principal">Principal Reduction</option>
                                    <option value="penalty">Penalty / Fine</option>
                                    <option value="other">Other Charges</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Amount (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={paymentForm.data.amount}
                                    onChange={e => paymentForm.setData('amount', e.target.value)}
                                    className="w-full h-10 rounded-xl border-gray-200 text-sm font-extrabold text-gray-900 focus:border-[#E88A1A]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Notes / Remarks</label>
                                <textarea
                                    value={paymentForm.data.notes}
                                    onChange={e => paymentForm.setData('notes', e.target.value)}
                                    rows="2"
                                    placeholder="Optional payment details..."
                                    className="w-full rounded-xl border-gray-200 text-xs font-medium focus:border-[#E88A1A]"
                                ></textarea>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentForm.processing}
                                    className="px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:opacity-90 active:opacity-100 cursor-pointer"
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                >
                                    {paymentForm.processing ? 'Saving...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Update Status / Redeem */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-scale-up">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#E88A1A]" /> Update Mortgage Status
                            </h3>
                            <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Select Status</label>
                                <select
                                    value={statusForm.data.status}
                                    onChange={e => statusForm.setData('status', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 text-sm font-bold text-gray-800 focus:border-[#E88A1A]"
                                >
                                    <option value="active">Active (In Progress)</option>
                                    <option value="redeemed">Redeemed (Paid & Items Returned)</option>
                                    <option value="overdue">Overdue (Payment Pending)</option>
                                    <option value="forfeited">Forfeited (Pledged Items Claimed)</option>
                                </select>
                            </div>

                            <p className="text-xs text-gray-500 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                                💡 Setting the status to <strong>Redeemed</strong> marks the pledged jewelry as returned to the customer.
                            </p>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:opacity-90 active:opacity-100 cursor-pointer"
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                >
                                    {statusForm.processing ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 3: Edit Details */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-scale-up">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Edit className="w-5 h-5 text-[#E88A1A]" /> Edit Mortgage Details
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateDetails} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Due Date</label>
                                <input
                                    type="date"
                                    value={editForm.data.due_date}
                                    onChange={e => editForm.setData('due_date', e.target.value)}
                                    className="w-full h-10 rounded-xl border-gray-200 text-sm font-medium focus:border-[#E88A1A]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.interest_rate}
                                        onChange={e => editForm.setData('interest_rate', e.target.value)}
                                        className="w-full h-10 rounded-xl border-gray-200 text-sm font-bold focus:border-[#E88A1A]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Interest Type</label>
                                    <select
                                        value={editForm.data.interest_type}
                                        onChange={e => editForm.setData('interest_type', e.target.value)}
                                        className="w-full h-10 rounded-xl border-gray-200 text-sm font-bold focus:border-[#E88A1A]"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="flat">Flat</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Notes</label>
                                <textarea
                                    value={editForm.data.notes}
                                    onChange={e => editForm.setData('notes', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-xl border-gray-200 text-xs font-medium focus:border-[#E88A1A]"
                                ></textarea>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:opacity-90 active:opacity-100 cursor-pointer"
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
