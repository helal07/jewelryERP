import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { 
    Hammer, 
    Plus, 
    Search, 
    Filter, 
    Clock, 
    CheckCircle2, 
    Calendar, 
    Scale, 
    Layers, 
    Eye, 
    XCircle,
    X,
    Printer,
    DollarSign,
    User,
    Phone
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ productions, artisans, filters, stats }) {
    const { t } = useLanguage();
    const [viewingProduction, setViewingProduction] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const form = e.target;
        router.get(route('production.index'), {
            search: form.search.value,
            status: form.status.value,
            artisan_id: form.artisan_id.value,
        }, { preserveState: true });
    };

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Layers className="h-7 w-7" style={{ color: 'rgb(177,118,51)' }} />
                            {t('productionList') || 'Production List'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('production.status')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold shadow-2xs transition-colors"
                        >
                            <Clock className="w-4 h-4 mr-2" style={{ color: 'rgb(177,118,51)' }} />
                            {t('productionStatus') || 'Production Status'}
                        </Link>

                        <Link
                            href={route('production.create')}
                            className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition-colors hover:opacity-90 active:opacity-100 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addProduction') || 'Add Production'}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Production List" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Total Jobs</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)' }}>
                        <Layers className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.pending || 0}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.in_progress || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Hammer className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Completed</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.completed || 0}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Issued Metal Weight</p>
                        <p className="text-2xl font-bold text-amber-800 mt-1">{stats?.total_metal_weight || 0}g</p>
                    </div>
                    <div className="p-3 bg-amber-100/50 rounded-xl text-amber-700">
                        <Scale className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters?.search || ''}
                                placeholder="Search production #, order #, artisan..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <select
                            name="status"
                            defaultValue={filters?.status || ''}
                            className="w-full sm:w-44 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            name="artisan_id"
                            defaultValue={filters?.artisan_id || ''}
                            className="w-full sm:w-48 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">All Artisans</option>
                            {artisans.map((artisan) => (
                                <option key={artisan.id} value={artisan.id}>
                                    {artisan.name} ({artisan.code})
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-5 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 hover:opacity-90 active:opacity-100 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Production List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm pb-16">
                <div className="overflow-visible min-h-[450px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-4">Production No</th>
                                <th className="py-4 px-4">Order Date</th>
                                <th className="py-4 px-4">Delivery Date</th>
                                <th className="py-4 px-4">Artisan</th>
                                <th className="py-4 px-4">Mobile</th>
                                <th className="py-4 px-4">Status</th>
                                <th className="py-4 px-4">Payable</th>
                                <th className="py-4 px-4">Paid</th>
                                <th className="py-4 px-4">Due</th>
                                <th className="py-4 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {productions.data && productions.data.length > 0 ? (
                                productions.data.map((prd) => (
                                    <tr key={prd.id} className="hover:bg-gray-50/50 transition-colors text-xs">
                                        {/* Production No */}
                                        <td className="py-3 px-4 font-bold text-amber-800 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setViewingProduction(prd)}
                                                className="hover:underline cursor-pointer font-bold text-amber-800"
                                            >
                                                {prd.production_no}
                                            </button>
                                        </td>

                                        {/* Order Date */}
                                        <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                                            {prd.order_date ? String(prd.order_date).substring(0, 10) : '—'}
                                        </td>

                                        {/* Delivery Date */}
                                        <td className="py-3 px-4 font-medium text-amber-700 whitespace-nowrap">
                                            {prd.delivery_date ? String(prd.delivery_date).substring(0, 10) : '—'}
                                        </td>

                                        {/* Artisan */}
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{prd.artisan?.name || 'Unassigned'}</div>
                                            <div className="text-[11px] text-gray-500 font-semibold">{prd.artisan?.code}</div>
                                        </td>

                                        {/* Mobile */}
                                        <td className="py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap">
                                            {prd.artisan?.phone || '—'}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            {getStatusBadge(prd.status)}
                                        </td>

                                        {/* Payable */}
                                        <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                                            ৳{Number(prd.artisan_charge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* Paid */}
                                        <td className="py-3 px-4 font-semibold text-emerald-600 whitespace-nowrap">
                                            ৳{Number(prd.paid_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* Due */}
                                        <td className="py-3 px-4 font-bold whitespace-nowrap">
                                            {prd.due_amount > 0 ? (
                                                <span className="text-rose-600">৳{Number(prd.due_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            ) : (
                                                <span className="text-emerald-600 font-bold">Paid</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3.5 py-1.5 border rounded-xl text-xs font-bold bg-white hover:bg-amber-50 focus:outline-none transition ease-in-out duration-150 cursor-pointer shadow-2xs"
                                                        style={{ color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.4)' }}
                                                    >
                                                        Actions
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" width="48" className="py-1 bg-white shadow-xl rounded-xl border border-gray-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingProduction(prd)}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" style={{ color: 'rgb(177,118,51)' }} /> View Details
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(prd.id, 'in_progress')}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <Clock className="w-4 h-4 text-amber-500" /> Start Progress
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(prd.id, 'completed')}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-emerald-50 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Complete Job
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(prd.id, 'cancelled')}
                                                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4 text-rose-600" /> Cancel
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-gray-400">
                                        <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-base font-semibold text-gray-600">No production jobs found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {productions.links && productions.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Showing <span className="font-semibold text-gray-700">{productions.from}</span> to <span className="font-semibold text-gray-700">{productions.to}</span> of <span className="font-semibold text-gray-700">{productions.total}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {productions.links.map((link, key) => (
                                <Link
                                    key={key}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-amber-600 text-white'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100'
                                                : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── VIEW PRODUCTION DETAILS MODAL ── */}
            {viewingProduction && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-amber-500/20 my-8 animate-scale-up">
                        {/* Modal Header */}
                        <div className="px-6 py-4 flex items-center justify-between text-white" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-white" />
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">{viewingProduction.production_no}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setViewingProduction(null)}
                                    className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {/* Status Bar */}
                            <div className="flex items-center justify-between bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-600 uppercase">Status:</span>
                                    {getStatusBadge(viewingProduction.status)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {viewingProduction.status !== 'in_progress' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleStatusChange(viewingProduction.id, 'in_progress');
                                                setViewingProduction({ ...viewingProduction, status: 'in_progress' });
                                            }}
                                            className="px-2.5 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                        >
                                            Start
                                        </button>
                                    )}
                                    {viewingProduction.status !== 'completed' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleStatusChange(viewingProduction.id, 'completed');
                                                setViewingProduction({ ...viewingProduction, status: 'completed' });
                                            }}
                                            className="px-2.5 py-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Artisan & Order */}
                                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" style={{ color: 'rgb(177, 118, 51)' }} /> Artisan & Order
                                    </div>
                                    <div className="flex justify-between"><span className="text-gray-500">Artisan:</span><span className="font-bold text-gray-800">{viewingProduction.artisan?.name || '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-semibold text-gray-700">{viewingProduction.artisan?.phone || '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Stock Type:</span><span className="font-semibold text-gray-700 capitalize">{viewingProduction.stock_type?.replace('_', ' ')}</span></div>
                                    {viewingProduction.order && (
                                        <div className="flex justify-between"><span className="text-gray-500">Order No:</span><span className="font-bold text-amber-800">{viewingProduction.order.order_no}</span></div>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" style={{ color: 'rgb(177, 118, 51)' }} /> Dates
                                    </div>
                                    <div className="flex justify-between"><span className="text-gray-500">Order Date:</span><span className="font-semibold text-gray-800">{viewingProduction.order_date ? String(viewingProduction.order_date).substring(0, 10) : '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Start Date:</span><span className="font-semibold text-gray-800">{viewingProduction.start_date ? String(viewingProduction.start_date).substring(0, 10) : '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Delivery Date:</span><span className="font-bold text-amber-800">{viewingProduction.delivery_date ? String(viewingProduction.delivery_date).substring(0, 10) : '—'}</span></div>
                                </div>

                                {/* Weight & Metal */}
                                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                                        <Scale className="w-3.5 h-3.5" style={{ color: 'rgb(177, 118, 51)' }} /> Metal & Weight
                                    </div>
                                    <div className="flex justify-between"><span className="text-gray-500">Metal:</span><span className="font-bold text-gray-800 capitalize">{viewingProduction.metal_type || 'Gold'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Purity:</span><span className="font-semibold text-gray-800">{viewingProduction.purity?.name || '—'}</span></div>
                                    <div className="flex justify-between text-amber-950 font-bold bg-amber-100/50 px-2 py-1 rounded-lg">
                                        <span>Units:</span>
                                        <span>{viewingProduction.vori || 0}V {viewingProduction.ana || 0}A {viewingProduction.roti || 0}R {viewingProduction.point || 0}P</span>
                                    </div>
                                    <div className="flex justify-between pt-1"><span className="font-bold text-gray-700">Total Weight:</span><span className="font-black text-amber-900">{viewingProduction.weight_gm} g</span></div>
                                </div>

                                {/* Charges */}
                                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5" style={{ color: 'rgb(177, 118, 51)' }} /> Charges & Payment
                                    </div>
                                    <div className="flex justify-between"><span className="text-gray-500">Artisan Charge:</span><span className="font-bold text-gray-900">৳{Number(viewingProduction.artisan_charge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Wastage %:</span><span className="font-semibold text-gray-700">{viewingProduction.wastage_percentage || 0}%</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Paid:</span><span className="font-bold text-emerald-600">৳{Number(viewingProduction.paid_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between pt-1 border-t border-gray-200"><span className="font-bold text-rose-800">Due Amount:</span><span className="font-black text-rose-600">৳{Number(viewingProduction.due_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                </div>
                            </div>

                            {/* Notes */}
                            {viewingProduction.notes && (
                                <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-100 text-xs">
                                    <span className="font-bold text-gray-700 block mb-1">Notes:</span>
                                    <p className="text-gray-600 whitespace-pre-wrap">{viewingProduction.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setViewingProduction(null)}
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
