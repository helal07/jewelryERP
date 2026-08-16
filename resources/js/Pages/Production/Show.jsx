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
    const { t } = useLanguage();

    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = (newStatus) => {
        router.patch(route('production.update-status', production.id), {
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
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
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
                                    {production.production_no}
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
                            Print Job Card
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Production - ${production.production_no}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Top Status & Stage Quick Switch Bar (Hidden on Print) */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                    <div className="text-sm font-medium text-gray-600">
                        Current Status: <span className="font-bold text-gray-900 capitalize">{production.status?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {production.status !== 'in_progress' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('in_progress')}
                                className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                                <Clock className="w-3.5 h-3.5" /> Start Progress
                            </button>
                        )}
                        {production.status !== 'completed' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('completed')}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                            </button>
                        )}
                        {production.status !== 'cancelled' && (
                            <button
                                type="button"
                                onClick={() => handleStatusChange('cancelled')}
                                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                                <XCircle className="w-3.5 h-3.5" /> Cancel
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
                            Artisan & Order Info
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Artisan / Goldsmith</span>
                                <span className="font-bold text-gray-900">{production.artisan?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Artisan Code</span>
                                <span className="font-semibold text-gray-700">{production.artisan?.code || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Phone</span>
                                <span className="font-semibold text-gray-700">{production.artisan?.phone || '—'}</span>
                            </div>
                            {production.order && (
                                <>
                                    <div className="flex justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-500 font-medium">Order Number</span>
                                        <span className="font-bold text-amber-800">{production.order.order_no}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-500 font-medium">Customer</span>
                                        <span className="font-bold text-gray-900">{production.order.customer?.name || '—'}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Stock Type</span>
                                <span className="font-bold text-gray-800 capitalize">{production.stock_type?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500 font-medium">Branch</span>
                                <span className="font-semibold text-gray-700">{production.branch?.name || 'Main Branch'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Dates & Timeline */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            Dates & Timeline
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Order Date</span>
                                <span className="font-semibold text-gray-800">{production.order_date ? String(production.order_date).substring(0, 10) : '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Start Date</span>
                                <span className="font-semibold text-gray-800">{production.start_date ? String(production.start_date).substring(0, 10) : '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Expected End Date</span>
                                <span className="font-semibold text-gray-800">{production.expected_end_date ? String(production.expected_end_date).substring(0, 10) : '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Delivery Date</span>
                                <span className="font-bold text-amber-700">{production.delivery_date ? String(production.delivery_date).substring(0, 10) : '—'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500 font-medium">Actual Completed Date</span>
                                <span className="font-semibold text-emerald-600">{production.actual_end_date ? String(production.actual_end_date).substring(0, 10) : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Metal & Weight Specifications */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Scale className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            Metal & Weight Specifications
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Metal Type</span>
                                <span className="font-bold text-gray-900 capitalize">{production.metal_type || 'Gold'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Purity</span>
                                <span className="font-semibold text-gray-800">{production.purity ? `${production.purity.name} (${production.purity.percentage}%)` : '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Product / Category</span>
                                <span className="font-semibold text-gray-800">{production.product?.name || production.category?.name || 'Custom Item'}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 bg-amber-50/60 p-3 rounded-xl text-center border border-amber-100 my-2">
                                <div>
                                    <div className="text-[10px] font-bold text-amber-800 uppercase">Vori</div>
                                    <div className="text-sm font-bold text-amber-950">{production.vori || 0}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-amber-800 uppercase">Ana</div>
                                    <div className="text-sm font-bold text-amber-950">{production.ana || 0}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-amber-800 uppercase">Roti</div>
                                    <div className="text-sm font-bold text-amber-950">{production.roti || 0}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-amber-800 uppercase">Point</div>
                                    <div className="text-sm font-bold text-amber-950">{production.point || 0}</div>
                                </div>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-700 font-bold">Total Issued Weight</span>
                                <span className="font-black text-amber-900 text-base">{production.weight_gm} g</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Financial & Artisan Payment */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            Charges & Payments
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Artisan / Making Charge</span>
                                <span className="font-bold text-gray-900">৳{Number(production.artisan_charge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Wastage %</span>
                                <span className="font-semibold text-gray-800">{production.wastage_percentage || 0}%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-500 font-medium">Paid Amount</span>
                                <span className="font-bold text-emerald-600">৳{Number(production.paid_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-2 bg-rose-50/70 p-3 rounded-xl border border-rose-100">
                                <span className="text-rose-800 font-bold">Due Amount</span>
                                <span className="font-black text-rose-600 text-lg">৳{Number(production.due_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section if available */}
                {production.notes && (
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
                        <h4 className="text-xs font-bold uppercase text-gray-500">Notes & Crafting Instructions</h4>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{production.notes}</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
