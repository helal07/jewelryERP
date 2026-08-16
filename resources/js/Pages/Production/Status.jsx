import React, { useState } from 'react';
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
    DollarSign 
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Status({ statusGroups }) {
    const { t } = useLanguage();
    const [viewingJob, setViewingJob] = useState(null);

    const handleStatusChange = (id, newStatus) => {
        router.patch(route('production.update-status', id), {
            status: newStatus
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-800 border-amber-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
        };

        const labels = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const columns = [
        {
            key: 'pending',
            title: 'Pending',
            count: statusGroups?.pending?.length || 0,
            bgColor: 'bg-amber-50/80',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-800',
            icon: Clock,
            items: statusGroups?.pending || [],
        },
        {
            key: 'in_progress',
            title: 'In Progress',
            count: statusGroups?.in_progress?.length || 0,
            bgColor: 'bg-blue-50/80',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            icon: Hammer,
            items: statusGroups?.in_progress || [],
        },
        {
            key: 'completed',
            title: 'Completed',
            count: statusGroups?.completed?.length || 0,
            bgColor: 'bg-emerald-50/80',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-800',
            icon: CheckCircle2,
            items: statusGroups?.completed || [],
        },
        {
            key: 'cancelled',
            title: 'Cancelled',
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
                            {t('productionStatus') || 'Production Status'}
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
            <Head title="Production Status" />

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
                                    {col.count}
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
                                                    {job.production_no}
                                                </button>
                                                <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/50 px-2 py-0.5 rounded-full">
                                                    {job.raw_metal_issued_weight}g
                                                </span>
                                            </div>

                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{job.artisan?.name || 'Unassigned Artisan'}</div>
                                                <div className="text-xs text-indigo-600 font-medium">{job.artisan?.specialization}</div>
                                            </div>

                                            {job.order && (
                                                <div className="text-xs text-gray-600 bg-white p-2 rounded-xl border border-gray-100">
                                                    Order: <span className="font-bold text-gray-800">{job.order.order_no}</span>
                                                </div>
                                            )}

                                            <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                                                <span>Start: {job.start_date ? String(job.start_date).substring(0, 10) : '—'}</span>
                                                {job.expected_end_date && <span>Due: {String(job.expected_end_date).substring(0, 10)}</span>}
                                            </div>

                                            {/* Quick Stage Move Buttons */}
                                            <div className="pt-2 border-t border-gray-100 flex items-center gap-1 justify-end">
                                                {col.key !== 'in_progress' && (
                                                    <button
                                                        onClick={() => handleStatusChange(job.id, 'in_progress')}
                                                        className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {col.key !== 'completed' && (
                                                    <button
                                                        onClick={() => handleStatusChange(job.id, 'completed')}
                                                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-gray-400">
                                        <p className="text-xs font-medium">No jobs in this stage</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View Job Modal */}
            {viewingJob && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-amber-500/20 my-8 animate-scale-up">
                        <div className="px-6 py-4 flex items-center justify-between text-white" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-white" />
                                <h3 className="text-lg font-bold text-white">{viewingJob.production_no}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingJob(null)}
                                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="flex items-center justify-between bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-600 uppercase">Status:</span>
                                    {getStatusBadge(viewingJob.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" style={{ color: 'rgb(177, 118, 51)' }} /> Artisan Info
                                    </div>
                                    <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-bold text-gray-800">{viewingJob.artisan?.name || '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Code:</span><span className="font-semibold text-gray-700">{viewingJob.artisan?.code || '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-semibold text-gray-700">{viewingJob.artisan?.phone || '—'}</span></div>
                                </div>

                                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
                                        <Scale className="w-3.5 h-3.5" style={{ color: 'rgb(177, 118, 51)' }} /> Metal & Weight
                                    </div>
                                    <div className="flex justify-between"><span className="text-gray-500">Metal:</span><span className="font-bold text-gray-800 capitalize">{viewingJob.metal_type || 'Gold'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Issued Weight:</span><span className="font-black text-amber-900">{viewingJob.raw_metal_issued_weight || viewingJob.weight_gm} g</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewingJob(null)}
                                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
