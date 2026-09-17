import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Layers, 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    Hammer, 
    XCircle, 
    X, 
    User, 
    Calendar, 
    Scale, 
    DollarSign,
    Eye,
    Printer
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Status({ statusGroups = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [viewingJob, setViewingJob] = useState(null);

    const handleStatusChange = (id, newStatus) => {
        router.patch(route('production.update-status', id), {
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
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {isBn ? (labelsBn[status] || status) : (labelsEn[status] || status)}
            </span>
        );
    };

    const columns = [
        {
            key: 'pending',
            title: isBn ? 'অপেক্ষমাণ (Pending)' : 'Pending',
            count: statusGroups?.pending?.length || 0,
            bgColor: 'bg-amber-50/80',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-800',
            icon: Clock,
            items: statusGroups?.pending || [],
        },
        {
            key: 'in_progress',
            title: isBn ? 'প্রক্রিয়াধীন (In Progress)' : 'In Progress',
            count: statusGroups?.in_progress?.length || 0,
            bgColor: 'bg-blue-50/80',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            icon: Hammer,
            items: statusGroups?.in_progress || [],
        },
        {
            key: 'completed',
            title: isBn ? 'সম্পন্ন (Completed)' : 'Completed',
            count: statusGroups?.completed?.length || 0,
            bgColor: 'bg-emerald-50/80',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-800',
            icon: CheckCircle2,
            items: statusGroups?.completed || [],
        },
        {
            key: 'cancelled',
            title: isBn ? 'বাতিলকৃত (Cancelled)' : 'Cancelled',
            count: statusGroups?.cancelled?.length || 0,
            bgColor: 'bg-rose-50/80',
            borderColor: 'border-rose-200',
            textColor: 'text-rose-800',
            icon: XCircle,
            items: statusGroups?.cancelled || [],
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Layers className="h-7 w-7" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'প্রোডাকশন স্ট্যাটাস বোর্ড' : 'Production Status'}
                        </h2>
                    </div>

                    <Link
                        href={route('production.index')}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold shadow-2xs transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        {t('back') || 'Back'}
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'প্রোডাকশন স্ট্যাটাস' : 'Production Status'} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {columns.map((col) => {
                    const ColumnIcon = col.icon;
                    return (
                        <div key={col.key} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col min-h-[500px]">
                            {/* Header */}
                            <div className={`p-3.5 rounded-2xl ${col.bgColor} border ${col.borderColor} flex items-center justify-between mb-4`}>
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <ColumnIcon className={`w-4 h-4 ${col.textColor}`} />
                                    <span className={col.textColor}>{col.title}</span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/80 ${col.textColor}`}>
                                    {isBn ? toBn(col.count) : col.count}
                                </span>
                            </div>

                            {/* Job Cards */}
                            <div className="flex-1 space-y-3">
                                {col.items.length > 0 ? (
                                    col.items.map((job) => (
                                        <div key={job.id} className="bg-gray-50/60 hover:bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-2xs transition-all space-y-2">
                                            <div className="flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingJob(job)}
                                                    className="font-bold text-amber-800 hover:underline text-xs cursor-pointer"
                                                >
                                                    {isBn ? toBn(job.production_no) : job.production_no}
                                                </button>
                                                <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/50 px-2 py-0.5 rounded-full">
                                                    {isBn ? `${toBn(job.raw_metal_issued_weight || job.weight_gm || 0)} গ্রাম` : `${job.raw_metal_issued_weight || job.weight_gm || 0}g`}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{job.artisan?.name || (isBn ? 'অবরাদ্দকৃত কারিগর' : 'Unassigned Artisan')}</div>
                                                <div className="text-xs text-indigo-600 font-medium">{job.artisan?.specialization}</div>
                                            </div>

                                            {job.order && (
                                                <div className="text-xs text-gray-600 bg-white p-2 rounded-xl border border-gray-100">
                                                    {isBn ? 'অর্ডার:' : 'Order:'} <span className="font-bold text-gray-800">{isBn ? toBn(job.order.order_no) : job.order.order_no}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                                                <span>{job.order_date ? (isBn ? toBn(String(job.order_date).substring(0, 10)) : String(job.order_date).substring(0, 10)) : '—'}</span>
                                                <span className="font-bold text-emerald-600">{fmtMoney(job.artisan_charge)}</span>
                                            </div>

                                            {/* Stage Transitions */}
                                            <div className="flex items-center gap-1.5 pt-2">
                                                {col.key !== 'in_progress' && col.key !== 'completed' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(job.id, 'in_progress')}
                                                        className="flex-1 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] font-bold rounded-lg border border-amber-200 transition cursor-pointer"
                                                    >
                                                        {isBn ? 'শুরু করুন' : 'Start'}
                                                    </button>
                                                )}

                                                {col.key === 'in_progress' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(job.id, 'completed')}
                                                        className="flex-1 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                                                    >
                                                        {isBn ? 'সম্পন্ন' : 'Complete'}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => setViewingJob(job)}
                                                    className="p-1 bg-white hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 transition cursor-pointer"
                                                    title={isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-12 text-gray-400">
                                        <p className="text-xs">{isBn ? 'কোনো কাজ নেই' : 'No jobs in this stage'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick View Job Modal rendered via createPortal */}
            {viewingJob && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '600px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl text-white" style={{ backgroundColor: 'rgb(177,118,51)' }}>
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {isBn ? `প্রোডাকশন - ${toBn(viewingJob.production_no)}` : `Production - ${viewingJob.production_no}`}
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingJob(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div>
                                    <span className="text-gray-400 block">{isBn ? 'কারিগর' : 'Artisan'}</span>
                                    <span className="font-bold text-gray-900 text-sm">{viewingJob.artisan?.name || (isBn ? 'অবরাদ্দকৃত' : 'Unassigned')}</span>
                                    <div className="text-gray-500">{viewingJob.artisan?.phone ? (isBn ? toBn(viewingJob.artisan.phone) : viewingJob.artisan.phone) : ''}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">{isBn ? 'স্ট্যাটাস' : 'Status'}</span>
                                    <div className="mt-1">{getStatusBadge(viewingJob.status)}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                                <h4 className="font-bold text-amber-900 uppercase">{isBn ? 'ওজন ও ধাতুর তথ্য' : 'Weight & Metal Specs'}</h4>
                                <div className="grid grid-cols-3 gap-3 pt-1">
                                    <div>
                                        <span className="text-gray-500 block">{isBn ? 'ঐতিহ্যবাহী ওজন' : 'Traditional Weight'}</span>
                                        <span className="font-bold text-amber-800">
                                            {isBn 
                                                ? `${toBn(viewingJob.vori || 0)}ভরি ${toBn(viewingJob.ana || 0)}আনা ${toBn(viewingJob.roti || 0)}রতি ${toBn(viewingJob.point || 0)}পয়েন্ট` 
                                                : `${viewingJob.vori || 0}v ${viewingJob.ana || 0}a ${viewingJob.roti || 0}r ${viewingJob.point || 0}p`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">{isBn ? 'গ্রাম ওজন' : 'Gram Weight'}</span>
                                        <span className="font-bold text-gray-900">{isBn ? `${toBn(viewingJob.weight_gm || 0)} গ্রাম` : `${viewingJob.weight_gm || 0}g`}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">{isBn ? 'মজুরি' : 'Artisan Charge'}</span>
                                        <span className="font-bold text-emerald-600">{fmtMoney(viewingJob.artisan_charge)}</span>
                                    </div>
                                </div>
                            </div>

                            {viewingJob.notes && (
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="font-bold text-gray-700 block mb-1">{isBn ? 'কাজের নির্দেশিকা:' : 'Notes / Instructions:'}</span>
                                    <p className="text-gray-600 leading-relaxed">{viewingJob.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <Link
                                href={route('production.show', viewingJob.id)}
                                className="text-xs font-bold hover:underline"
                                style={{ color: 'rgb(177,118,51)' }}
                            >
                                {isBn ? 'জব কার্ড পেজ দেখুন →' : 'View Job Card →'}
                            </Link>

                            <button
                                type="button"
                                onClick={() => setViewingJob(null)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('close') || 'Close'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
