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
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
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

        const labelsEn = {
            new: 'New Order',
            assigned: 'Assigned',
            in_production: 'In Production',
            ready: 'Ready for Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };

        const labelsBn = {
            new: 'নতুন অর্ডার',
            assigned: 'বরাদ্দকৃত',
            in_production: 'প্রস্তুত হচ্ছে',
            ready: 'ডেলিভারির জন্য প্রস্তুত',
            delivered: 'ডেলিভারি সম্পন্ন',
            cancelled: 'বাতিল',
        };

        const label = isBn ? (labelsBn[status] || status) : (labelsEn[status] || status);

        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {label}
            </span>
        );
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('orders.index')}
                            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl shadow-xs hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {isBn ? toBn(order.order_no) : order.order_no}
                                </h2>
                                {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {isBn ? 'অর্ডারের তারিখ' : 'Order Date'}: {isBn ? toBn(order.order_date) : order.order_date}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all scale-100 hover:scale-105 cursor-pointer hover:opacity-90 active:opacity-100"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            {isBn ? 'চালান প্রিন্ট করুন' : 'Print Invoice'}
                        </button>
                        <Link
                            href={route('orders.create')}
                            className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-sm font-bold hover:bg-amber-100 transition-all shadow-xs"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            {isBn ? 'নতুন অর্ডার' : 'New Order'}
                        </Link>
                        <Link
                            href={route('orders.assignments')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-all"
                        >
                            <UserCheck className="w-4 h-4 mr-2" />
                            {isBn ? 'অর্ডার বরাদ্দ' : 'Assign Order'}
                        </Link>
                        <Link
                            href={route('orders.edit', order.id)}
                            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {isBn ? 'সংশোধন' : 'Edit Order'}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? `অর্ডার #${toBn(order.order_no)}` : `Order #${order.order_no}`} />

            {/* Printable Order Invoice Voucher */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-none">
                
                {/* Invoice Header Banner */}
                <div className="flex justify-between items-start border-b-2 pb-6 mb-6" style={{ borderColor: 'rgb(177,118,51)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: 'rgb(177,118,51)' }}>
                            <Gem className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-wider uppercase">JEWELRY ERP</h1>
                            <p className="text-xs text-gray-500 font-medium">
                                {isBn ? 'কাস্টম জুয়েলারি অর্ডার ও ইনভয়েস' : 'Custom Jewelry Order & Tax Invoice'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{order.branch?.name || (isBn ? 'প্রধান শাখা' : 'Main Branch')}</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                            {isBn ? 'অর্ডার মেমো' : 'Custom Order Invoice'}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 mt-2">{isBn ? toBn(order.order_no) : order.order_no}</h2>
                        <p className="text-xs text-gray-500">
                            {isBn ? 'অর্ডারের তারিখ' : 'Order Date'}: {isBn ? toBn(order.order_date) : order.order_date}
                        </p>
                        {order.delivery_date && (
                            <p className="text-xs text-amber-700 font-bold mt-0.5">
                                {isBn ? 'ডেলিভারির তারিখ' : 'Delivery Date'}: {isBn ? toBn(order.delivery_date) : order.delivery_date}
                            </p>
                        )}
                    </div>
                </div>

                {/* Grid: Customer Details & Jewelry Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    
                    {/* Customer Box */}
                    <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-1.5 text-xs">
                        <h3 className="font-bold text-amber-800 uppercase tracking-wider text-xs border-b border-gray-200 pb-1 mb-2">
                            {isBn ? 'কাস্টমারের তথ্য' : 'Customer Information'}
                        </h3>
                        <p className="text-sm font-bold text-gray-900">{order.customer?.name}</p>
                        <p className="text-gray-600">
                            {isBn ? 'মোবাইল' : 'Phone'}: <span className="font-semibold text-gray-800">{order.customer?.phone ? (isBn ? toBn(order.customer.phone) : order.customer.phone) : 'N/A'}</span>
                        </p>
                        <p className="text-gray-600">{isBn ? 'ঠিকানা' : 'Address'}: {order.customer?.address || 'N/A'}</p>
                    </div>

                    {/* Specifications Box */}
                    <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-1.5 text-xs">
                        <h3 className="font-bold text-amber-800 uppercase tracking-wider text-xs border-b border-gray-200 pb-1 mb-2">
                            {isBn ? 'গহনার বিবরণ ও ওজন' : 'Jewelry Specifications'}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-gray-400 block">{isBn ? 'পণ্য' : 'Product / Item'}</span>
                                <span className="font-bold text-gray-900">{order.product_name || order.category || (isBn ? 'কাস্টম গহনা' : 'Custom Jewelry')}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">{isBn ? 'ধাতু ও ক্যারেট' : 'Metal & Purity'}</span>
                                <span className="font-bold text-gray-900">
                                    {order.metal_type} • {order.purity?.name} ({isBn ? toBn(order.purity?.percentage) : order.purity?.percentage}%)
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">{isBn ? 'ভরি প্রতি রেট' : 'Rate / Vori'}</span>
                                <span className="font-bold text-gray-900">{Number(order.rate_per_vori) > 0 ? fmtMoney(order.rate_per_vori) : '—'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">{isBn ? 'হিসাবকৃত ওজন' : 'Traditional Weight'}</span>
                                <span className="font-bold text-amber-700">
                                    {isBn ? `${toBn(order.vori || 0)} ভরি ${toBn(order.ana || 0)} আনা ${toBn(order.roti || 0)} রতি ${toBn(order.point || 0)} পয়েন্ট` : `${order.vori || 0}v ${order.ana || 0}a ${order.roti || 0}r ${order.point || 0}p`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description & Photo */}
                <div className="border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isBn ? 'ডিজাইন ও বিশেষ নির্দেশিকা' : 'Product Design Description & Notes'}
                    </h3>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {order.product_description || (isBn ? 'কোনো বিশেষ নির্দেশিকা দেওয়া হয়নি।' : 'No additional description provided.')}
                    </p>

                    {order.reference_image && (
                        <div className="pt-2">
                            <span className="text-xs text-gray-400 font-semibold block mb-2">{isBn ? 'ডিজাইনের ছবি:' : 'Design Photo Reference:'}</span>
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
                                <th className="py-3 px-4">{isBn ? 'খরচের বিবরণ' : 'Charge / Item Breakdown'}</th>
                                <th className="py-3 px-4 text-right">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Number(order.rate_per_vori) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">
                                        {isBn 
                                            ? `স্বর্ণের মূল্য (${toBn(order.vori || 0)} ভরি ${toBn(order.ana || 0)} আনা @ ${fmtMoney(order.rate_per_vori)}/ভরি)` 
                                            : `Metal Price (${order.vori || 0}v ${order.ana || 0}a @ ${fmtMoney(order.rate_per_vori)}/vori)`}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                                        {fmtMoney(
                                            ((parseFloat(order.vori || 0) + (parseFloat(order.ana || 0)/16) + (parseFloat(order.roti || 0)/96) + (parseFloat(order.point || 0)/960)) * parseFloat(order.rate_per_vori || 0))
                                        )}
                                    </td>
                                </tr>
                            )}
                            {Number(order.making_charge) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">{isBn ? 'মজুরি (Making Charge)' : 'Making / Crafting Charge'}</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">{fmtMoney(order.making_charge)}</td>
                                </tr>
                            )}
                            {Number(order.stone_charge) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">{isBn ? 'পাথর ও রত্ন চার্জ' : 'Stone & Gem Charge'}</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">{fmtMoney(order.stone_charge)}</td>
                                </tr>
                            )}
                            {Number(order.vat_amount) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">{isBn ? 'ভ্যাট / ট্যাক্স' : 'VAT / Tax'}</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">{fmtMoney(order.vat_amount)}</td>
                                </tr>
                            )}
                            {Number(order.hallmark_charge) > 0 && (
                                <tr>
                                    <td className="py-2.5 px-4 text-gray-700">{isBn ? 'হলমার্ক সার্টিফিকেশন ফি' : 'Hallmark Certification Fee'}</td>
                                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">{fmtMoney(order.hallmark_charge)}</td>
                                </tr>
                            )}
                            <tr className="bg-gray-50/80 font-bold border-t border-gray-200">
                                <td className="py-3 px-4 text-gray-900">{isBn ? 'আনুমানিক মোট মূল্য' : 'Estimated Total Order Amount'}</td>
                                <td className="py-3 px-4 text-right text-gray-900 text-base">{fmtMoney(order.estimated_amount)}</td>
                            </tr>
                            <tr className="bg-emerald-50/50">
                                <td className="py-3 px-4 font-bold text-emerald-800">{isBn ? 'জমা / অগ্রিম গ্রহণ' : 'Advance Deposit Received'}</td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-700 text-base">{fmtMoney(order.advance_amount)}</td>
                            </tr>
                            <tr className="bg-rose-50/60">
                                <td className="py-3.5 px-4 font-black text-rose-800">{isBn ? 'অবশিষ্ট বকেয়া (ডেলিভারিতে প্রদেয়)' : 'Remaining Balance Due Upon Delivery'}</td>
                                <td className="py-3.5 px-4 text-right font-black text-rose-700 text-lg">{fmtMoney(order.due_amount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Terms & Signatures */}
                <div className="pt-8 border-t border-gray-200 flex items-end justify-between text-xs text-gray-500">
                    <div className="max-w-md space-y-1">
                        <p className="font-bold text-gray-700">{isBn ? 'শর্তাবলী:' : 'Invoice Terms & Conditions:'}</p>
                        <p>{isBn ? '১. অর্ডারের ডেলিভারি তারিখ কারিগরির উপর নির্ভরশীল ও সম্ভাব্য।' : '1. Delivery date is an estimate subject to crafting perfection.'}</p>
                        <p>{isBn ? '২. ডেলিভারি নেওয়ার সময় অনুগ্রহ করে এই মূল মেমোটি প্রদর্শন করুন।' : '2. Please bring this original invoice receipt when taking delivery of your order.'}</p>
                    </div>

                    <div className="flex gap-12 text-center pt-8">
                        <div>
                            <div className="w-32 border-b border-gray-400 mb-1"></div>
                            <p className="font-semibold text-gray-700">{isBn ? 'গ্রাহকের স্বাক্ষর' : 'Customer Signature'}</p>
                        </div>
                        <div>
                            <div className="w-32 border-b border-gray-400 mb-1"></div>
                            <p className="font-semibold text-gray-700">{isBn ? 'কর্তৃপক্ষের স্বাক্ষর' : 'Authorized Signature'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
