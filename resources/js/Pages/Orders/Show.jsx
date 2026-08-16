import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Edit3, 
    UserCheck, 
    Hammer, 
    Calendar, 
    User, 
    Scale, 
    DollarSign, 
    Printer, 
    Gem,
    Building2,
    CheckCircle2,
    Package,
    Tag,
    Award,
    Percent,
    Plus
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Show({ order }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;

    const handlePrint = () => {
        window.print();
    };

    const getStatusBadge = (status) => {
        const styles = {
            new: 'bg-blue-100 text-blue-800 border-blue-200',
            assigned: 'bg-purple-100 text-purple-800 border-purple-200',
            in_production: 'bg-amber-100 text-amber-800 border-amber-200',
            ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            delivered: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
        };

        const labels = {
            new: 'New Order',
            assigned: 'Assigned',
            in_production: 'In Production',
            ready: 'Ready for Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };

        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    // Calculate Vori equivalent (1 Vori = 11.664g)
    const weightInVori = (parseFloat(order.estimated_weight || 0) / 11.664).toFixed(2);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('orders.index')}
                            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{order.order_no}</h2>
                                {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">Order Date: {order.order_date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all scale-100 hover:scale-105 cursor-pointer hover:opacity-90 active:opacity-100"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Invoice
                        </button>
                        <Link
                            href={route('orders.create')}
                            className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-sm font-bold hover:bg-amber-100 transition-all shadow-xs"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            New Order
                        </Link>
                        <Link
                            href={route('orders.assignments')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-all"
                        >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Assign Order
                        </Link>
                        <Link
                            href={route('orders.edit', order.id)}
                            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Order
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Order #${order.order_no}`} />

            {/* Printable Order Invoice Voucher */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-none">
                
                {/* Invoice Header Banner */}
                <div className="flex justify-between items-start border-b-2 border-amber-600 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-md">
                            <Gem className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-wider uppercase">JEWELRY ERP</h1>
                            <p className="text-xs text-gray-500 font-medium">Custom Jewelry Order & Tax Invoice</p>
                            <p className="text-xs text-gray-400 mt-0.5">{order.branch?.name || 'Main Branch'}</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                            Custom Order Invoice
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 mt-2">{order.order_no}</h2>
                        <p className="text-xs text-gray-500">Order Date: {order.order_date}</p>
                        {order.delivery_date && (
                            <p className="text-xs text-amber-700 font-bold mt-0.5">Delivery Date: {order.delivery_date}</p>
                        )}
                    </div>
                </div>

                {/* Grid: Customer Details & Jewelry Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    
                    {/* Customer Box */}
                    <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-1.5 text-xs">
                        <h3 className="font-bold text-amber-800 uppercase tracking-wider text-xs border-b border-gray-200 pb-1 mb-2">Customer Information</h3>
                        <p className="text-sm font-bold text-gray-900">{order.customer?.name}</p>
                        <p className="text-gray-600">Phone: <span className="font-semibold text-gray-800">{order.customer?.phone || 'N/A'}</span></p>
                        <p className="text-gray-600">Address: {order.customer?.address || 'N/A'}</p>
                    </div>

                    {/* Specifications Box */}
                    <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-1.5 text-xs">
                        <h3 className="font-bold text-amber-800 uppercase tracking-wider text-xs border-b border-gray-200 pb-1 mb-2">Jewelry Specifications</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-gray-400 block">Product / Item</span>
                                <span className="font-bold text-gray-900">{order.product_name || order.category || 'Custom Jewelry'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Metal & Purity</span>
                                <span className="font-bold text-gray-900">{order.metal_type} • {order.purity?.name} ({order.purity?.percentage}%)</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Rate / Vori</span>
                                <span className="font-bold text-gray-900">{Number(order.rate_per_vori) > 0 ? `৳${Number(order.rate_per_vori).toLocaleString()}` : '—'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Traditional Weight</span>
                                <span className="font-bold text-amber-700">
                                    {order.vori || 0}v {order.ana || 0}a {order.roti || 0}r {order.point || 0}p
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description & Photo */}
                <div className="border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Design Description & Notes</h3>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {order.product_description}
                    </p>

                    {order.reference_image && (
                        <div className="pt-2">
                            <span className="text-xs text-gray-400 font-semibold block mb-2">Design Photo Reference:</span>
                            <img 
                                src={`/storage/${order.reference_image}`} 
                                alt="Order Reference Photo" 
                                className="max-w-xs max-h-44 rounded-xl object-cover border border-gray-200 shadow-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Financial Charges & Payment Invoice Breakdown */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100/90 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase">
                                <th className="py-3 px-4">Charge / Item Breakdown</th>
                                <th className="py-3 px-4 text-right">Amount (৳)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Number(order.rate_per_vori) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">Metal Price ({order.vori || 0}v {order.ana || 0}a @ ৳{Number(order.rate_per_vori).toLocaleString()}/vori)</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                                        ৳{(
                                            ((parseFloat(order.vori || 0) + (parseFloat(order.ana || 0)/16) + (parseFloat(order.roti || 0)/96) + (parseFloat(order.point || 0)/960)) * parseFloat(order.rate_per_vori || 0))
                                        ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            )}
                            {Number(order.making_charge) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">Making / Crafting Charge</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">৳{Number(order.making_charge).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                            {Number(order.stone_charge) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">Stone & Gem Charge</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">৳{Number(order.stone_charge).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                            {Number(order.vat_amount) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">VAT / Tax</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">৳{Number(order.vat_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                            {Number(order.hallmark_charge) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">Hallmark Certification Fee</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">৳{Number(order.hallmark_charge).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                            <tr className="bg-gray-50/80 font-bold border-t border-gray-200">
                                <td className="py-3 px-4 text-gray-900">Estimated Total Order Amount</td>
                                <td className="py-3 px-4 text-right text-gray-900 text-base">৳{Number(order.estimated_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr className="bg-emerald-50/50">
                                <td className="py-3 px-4 font-bold text-emerald-800">Advance Deposit Received</td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-700 text-base">৳{Number(order.advance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr className="bg-rose-50/60">
                                <td className="py-3.5 px-4 font-black text-rose-800">Remaining Balance Due Upon Delivery</td>
                                <td className="py-3.5 px-4 text-right font-black text-rose-700 text-lg">৳{Number(order.due_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Terms & Signatures */}
                <div className="pt-8 border-t border-gray-200 flex items-end justify-between text-xs text-gray-500">
                    <div className="max-w-md space-y-1">
                        <p className="font-bold text-gray-700">Invoice Terms & Conditions:</p>
                        <p>1. Delivery date is an estimate subject to crafting perfection.</p>
                        <p>2. Please bring this original invoice receipt when taking delivery of your order.</p>
                    </div>

                    <div className="flex gap-12 text-center pt-8">
                        <div>
                            <div className="w-32 border-b border-gray-400 mb-1"></div>
                            <p className="font-semibold text-gray-700">Customer Signature</p>
                        </div>
                        <div>
                            <div className="w-32 border-b border-gray-400 mb-1"></div>
                            <p className="font-semibold text-gray-700">Authorized Signature</p>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
