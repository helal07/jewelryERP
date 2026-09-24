import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Layers, 
    ArrowLeft, 
    Printer, 
    Hammer, 
    User, 
    Phone, 
    Calendar, 
    Scale, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Package, 
    Percent, 
    FileText,
    Building2,
    Gem
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Show({ production }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = (newStatus) => {
        router.patch(route('production.update-status', production.id), {
            status: newStatus
        });
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-800 border-amber-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
        };

        const labelsEn = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };

        const labelsBn = {
            pending: 'অপেক্ষমাণ',
            in_progress: 'প্রক্রিয়াধীন',
            completed: 'সম্পন্ন',
            cancelled: 'বাতিলকৃত',
        };

        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {isBn ? (labelsBn[status] || status) : (labelsEn[status] || status)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('production.index')}
                            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl shadow-2xs hover:bg-gray-50 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <Layers className="h-6 w-6" style={{ color: 'rgb(177,118,51)' }} />
                                    {isBn ? toBn(production.production_no) : production.production_no}
                                </h2>
                                {getStatusBadge(production.status)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition hover:opacity-90 active:opacity-100 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            {isBn ? 'জব কার্ড প্রিন্ট' : 'Print Job Card'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? `প্রোডাকশন - ${toBn(production.production_no)}` : `Production - ${production.production_no}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Top Status Quick Switch Bar (Hidden on Print) */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                    <div className="text-sm font-medium text-gray-600">
                        {isBn ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'} <span className="font-bold text-gray-900 capitalize">{getStatusBadge(production.status)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {production.status !== 'in_progress' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('in_progress')}
                                className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                                <Clock className="w-3.5 h-3.5" /> {isBn ? 'প্রক্রিয়া শুরু' : 'Start Progress'}
                            </button>
                        )}
                        {production.status !== 'completed' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('completed')}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> {isBn ? 'কাজ সম্পন্ন' : 'Mark Completed'}
                            </button>
                        )}
                        {production.status !== 'cancelled' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('cancelled')}
                                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                                <XCircle className="w-3.5 h-3.5" /> {isBn ? 'বাতিল' : 'Cancel'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Card 1: Artisan & Order Info */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Hammer className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'কারিগর ও অর্ডারের তথ্য' : 'Artisan & Order Info'}
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'কারিগর' : 'Artisan / Goldsmith'}</span>
                                <span className="font-bold text-gray-900">{production.artisan?.name || (isBn ? 'অবরাদ্দকৃত' : 'Unassigned')}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'কারিগর কোড' : 'Artisan Code'}</span>
                                <span className="font-semibold text-gray-700">{production.artisan?.code ? (isBn ? toBn(production.artisan.code) : production.artisan.code) : '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'মোবাইল' : 'Phone'}</span>
                                <span className="font-semibold text-gray-700">{production.artisan?.phone ? (isBn ? toBn(production.artisan.phone) : production.artisan.phone) : '—'}</span>
                            </div>
                            {production.order && (
                                <>
                                    <div className="flex justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-500 font-medium">{isBn ? 'সম্পর্কিত অর্ডার' : 'Order No'}</span>
                                        <span className="font-bold text-amber-800">
                                            <Link href={route('orders.show', production.order.id)} className="hover:underline">
                                                {isBn ? toBn(production.order.order_no) : production.order.order_no}
                                            </Link>
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-500 font-medium">{isBn ? 'গ্রাহক' : 'Customer'}</span>
                                        <span className="font-semibold text-gray-900">{production.order.customer?.name}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'অর্ডারের তারিখ' : 'Order Date'}</span>
                                <span className="font-semibold text-gray-800">
                                    {production.order_date ? (isBn ? toBn(String(production.order_date).substring(0, 10)) : String(production.order_date).substring(0, 10)) : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'ডেলিভারির তারিখ' : 'Delivery Date'}</span>
                                <span className="font-semibold text-amber-700">
                                    {production.delivery_date ? (isBn ? toBn(String(production.delivery_date).substring(0, 10)) : String(production.delivery_date).substring(0, 10)) : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Jewelry & Metal Specs */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Scale className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'গহনা ও ধাতুর বিবরণ' : 'Jewelry & Metal Specs'}
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'পণ্য / মডেল' : 'Product / Model'}</span>
                                <span className="font-bold text-gray-900">{production.product?.name || production.category?.name || (isBn ? 'কাস্টম গহনা' : 'Custom Jewelry')}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'ধাতু ও ক্যারেট' : 'Metal & Purity'}</span>
                                <span className="font-bold text-gray-900">{production.metal_type} • {production.purity?.name} ({isBn ? toBn(production.purity?.percentage) : production.purity?.percentage}%)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'ঐতিহ্যবাহী ওজন' : 'Traditional Weight'}</span>
                                <span className="font-bold text-amber-800">
                                    {isBn 
                                        ? `${toBn(production.vori || 0)} ভরি ${toBn(production.ana || 0)} আনা ${toBn(production.roti || 0)} রতি ${toBn(production.point || 0)} পয়েন্ট` 
                                        : `${production.vori || 0}v ${production.ana || 0}a ${production.roti || 0}r ${production.point || 0}p`}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'গ্রাম ওজন' : 'Gram Weight'}</span>
                                <span className="font-bold text-gray-900">{isBn ? `${toBn(production.weight_gm || 0)} গ্রাম` : `${production.weight_gm || 0}g`}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">{isBn ? 'ওয়েস্টেজ (%)' : 'Wastage %'}</span>
                                <span className="font-bold text-gray-900">{isBn ? `${toBn(production.wastage_percentage || 0)}%` : `${production.wastage_percentage || 0}%`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Charges Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                        {isBn ? 'মজুরি ও আর্থিক হিসাব' : 'Wage & Financial Breakdown'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="text-xs text-gray-500 font-semibold block">{isBn ? 'মোট কারিগর মজুরি' : 'Artisan Charge'}</span>
                            <span className="text-xl font-bold text-gray-900 mt-1 block">{fmtMoney(production.artisan_charge)}</span>
                        </div>

                        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                            <span className="text-xs text-emerald-800 font-semibold block">{isBn ? 'পরিশোধিত অগ্রিম' : 'Paid Amount'}</span>
                            <span className="text-xl font-bold text-emerald-700 mt-1 block">{fmtMoney(production.paid_amount)}</span>
                        </div>

                        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
                            <span className="text-xs text-rose-800 font-semibold block">{isBn ? 'অবশিষ্ট বকেয়া' : 'Remaining Due'}</span>
                            <span className="text-xl font-bold text-rose-700 mt-1 block">{fmtMoney(production.due_amount)}</span>
                        </div>
                    </div>

                    {production.notes && (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm mt-4">
                            <span className="font-bold text-gray-700 block mb-1">{isBn ? 'কাজের বিশেষ নির্দেশিকা:' : 'Crafting Instructions / Notes:'}</span>
                            <p className="text-gray-600 leading-relaxed">{production.notes}</p>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
