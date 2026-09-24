import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import { 
    Hammer, 
    Plus, 
    Search, 
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
    Phone,
    Gem,
    Percent
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ productions, artisans = [], filters = {}, stats = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [viewingProduction, setViewingProduction] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [artisanId, setArtisanId] = useState(filters?.artisan_id || '');

    useFilter(route('production.index'), {
        search,
        status,
        artisan_id: artisanId,
    });

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Layers className="h-7 w-7" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'জুয়েলারি তৈরি / প্রোডাকশন তালিকা' : 'Production List'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('production.status')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold shadow-2xs transition-colors"
                        >
                            <Clock className="w-4 h-4 mr-2" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'প্রোডাকশন স্ট্যাটাস বোর্ড' : 'Production Status'}
                        </Link>

                        <Link
                            href={route('production.create')}
                            className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition-colors hover:opacity-90 active:opacity-100 cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isBn ? 'নতুন প্রোডাকশন জব' : 'Add Production'}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? 'প্রোডাকশন তালিকা' : 'Production List'} />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'মোট কাজ' : 'Total Jobs'}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{isBn ? toBn(stats?.total || 0) : (stats?.total || 0)}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)' }}>
                        <Layers className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'অপেক্ষমাণ' : 'Pending'}</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{isBn ? toBn(stats?.pending || 0) : (stats?.pending || 0)}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'প্রক্রিয়াধীন' : 'In Progress'}</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{isBn ? toBn(stats?.in_progress || 0) : (stats?.in_progress || 0)}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Hammer className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'সম্পন্ন' : 'Completed'}</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{isBn ? toBn(stats?.completed || 0) : (stats?.completed || 0)}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'ইস্যুকৃত ধাতুর ওজন' : 'Issued Metal Weight'}</p>
                        <p className="text-2xl font-bold text-amber-800 mt-1">{isBn ? `${toBn(stats?.total_metal_weight || 0)} গ্রাম` : `${stats?.total_metal_weight || 0}g`}</p>
                    </div>
                    <div className="p-3 bg-amber-100/50 rounded-xl text-amber-700">
                        <Scale className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={isBn ? 'প্রোডাকশন নং, অর্ডার নং বা কারিগর দিয়ে খুঁজুন...' : 'Search production #, order #, artisan...'}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <select
                            name="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full sm:w-44 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">{isBn ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
                            <option value="pending">{isBn ? 'অপেক্ষমাণ' : 'Pending'}</option>
                            <option value="in_progress">{isBn ? 'প্রক্রিয়াধীন' : 'In Progress'}</option>
                            <option value="completed">{isBn ? 'সম্পন্ন' : 'Completed'}</option>
                            <option value="cancelled">{isBn ? 'বাতিলকৃত' : 'Cancelled'}</option>
                        </select>

                        <select
                            name="artisan_id"
                            value={artisanId}
                            onChange={(e) => setArtisanId(e.target.value)}
                            className="w-full sm:w-48 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">{isBn ? 'সব কারিগর' : 'All Artisans'}</option>
                            {artisans.map((artisan) => (
                                <option key={artisan.id} value={artisan.id}>
                                    {artisan.name} ({isBn ? toBn(artisan.code) : artisan.code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Standard Table Container */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                <div className="overflow-x-auto min-h-[320px] pb-40">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'প্রোডাকশন নং' : 'Production No'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অর্ডারের তারিখ' : 'Order Date'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ডেলিভারির তারিখ' : 'Delivery Date'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'কারিগর' : 'Artisan'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'মোবাইল' : 'Mobile'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'প্রদেয় মজুরি' : 'Payable'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'পরিশোধিত' : 'Paid'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'বকেয়া' : 'Due'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                            {productions.data && productions.data.length > 0 ? (
                                productions.data.map((prd) => (
                                    <tr key={prd.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Production No */}
                                        <td className="px-3 py-3 font-bold text-amber-800 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setViewingProduction(prd)}
                                                className="hover:underline cursor-pointer font-bold text-amber-800"
                                            >
                                                {isBn ? toBn(prd.production_no) : prd.production_no}
                                            </button>
                                        </td>

                                        {/* Order Date */}
                                        <td className="px-3 py-3 font-medium text-gray-700 whitespace-nowrap">
                                            {prd.order_date ? (isBn ? toBn(String(prd.order_date).substring(0, 10)) : String(prd.order_date).substring(0, 10)) : '—'}
                                        </td>

                                        {/* Delivery Date */}
                                        <td className="px-3 py-3 font-medium text-amber-700 whitespace-nowrap">
                                            {prd.delivery_date ? (isBn ? toBn(String(prd.delivery_date).substring(0, 10)) : String(prd.delivery_date).substring(0, 10)) : '—'}
                                        </td>

                                        {/* Artisan */}
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{prd.artisan?.name || (isBn ? 'অবরাদ্দকৃত' : 'Unassigned')}</div>
                                            <div className="text-[11px] text-gray-500 font-semibold">{isBn ? toBn(prd.artisan?.code) : prd.artisan?.code}</div>
                                        </td>

                                        {/* Mobile */}
                                        <td className="px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">
                                            {prd.artisan?.phone ? (isBn ? toBn(prd.artisan.phone) : prd.artisan.phone) : '—'}
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {getStatusBadge(prd.status)}
                                        </td>

                                        {/* Payable */}
                                        <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap">
                                            {fmtMoney(prd.artisan_charge || 0)}
                                        </td>

                                        {/* Paid */}
                                        <td className="px-3 py-3 font-semibold text-emerald-600 whitespace-nowrap">
                                            {fmtMoney(prd.paid_amount || 0)}
                                        </td>

                                        {/* Due */}
                                        <td className="px-3 py-3 font-bold whitespace-nowrap">
                                            {prd.due_amount > 0 ? (
                                                <span className="text-rose-600">{fmtMoney(prd.due_amount)}</span>
                                            ) : (
                                                <span className="text-emerald-600 font-bold">{isBn ? 'পরিশোধিত' : 'Paid'}</span>
                                            )}
                                        </td>

                                        {/* Action Dropdown */}
                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                    >
                                                        {t('actions') || 'Actions'}
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" width="48">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewingProduction(prd);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2 font-medium cursor-pointer transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" style={{ color: 'rgb(177,118,51)' }} /> {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(prd.id, 'in_progress');
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2 font-medium cursor-pointer transition-colors"
                                                    >
                                                        <Clock className="w-4 h-4 text-amber-500" /> {isBn ? 'প্রক্রিয়া শুরু' : 'Start Progress'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(prd.id, 'completed');
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-emerald-50 flex items-center gap-2 font-medium cursor-pointer transition-colors"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {isBn ? 'কাজ সম্পন্ন' : 'Complete Job'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(prd.id, 'cancelled');
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4 text-rose-600" /> {isBn ? 'বাতিল করুন' : 'Cancel Job'}
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
                                        <p className="text-base font-semibold text-gray-600">{isBn ? 'কোনো প্রোডাকশন রেকর্ড পাওয়া যায়নি' : 'No production records found'}</p>
                                        <p className="text-xs text-gray-400 mt-1">{isBn ? 'কারিগরকে নতুন গহনা তৈরির অর্ডার দিয়ে প্রোডাকশন ট্র্যাক করুন।' : 'Create a production job to assign crafting to artisans.'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {productions.links && productions.links.length > 3 && (
                    <div className="mt-4">
                        <Pagination links={productions.links} />
                    </div>
                )}
            </div>

            {/* Quick View / Print Job Card Modal rendered via createPortal */}
            {viewingProduction && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '680px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl text-white" style={{ backgroundColor: 'rgb(177,118,51)' }}>
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {isBn ? `প্রোডাকশন জব কার্ড - ${toBn(viewingProduction.production_no)}` : `Production Job Card - ${viewingProduction.production_no}`}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {isBn ? 'তারিখ:' : 'Date:'} {viewingProduction.order_date ? (isBn ? toBn(String(viewingProduction.order_date).substring(0, 10)) : String(viewingProduction.order_date).substring(0, 10)) : '—'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingProduction(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                                <div>
                                    <span className="text-gray-400 block">{isBn ? 'কারিগর' : 'Artisan'}</span>
                                    <span className="font-bold text-gray-900 text-sm">{viewingProduction.artisan?.name || (isBn ? 'অবরাদ্দকৃত' : 'Unassigned')}</span>
                                    <div className="text-gray-500">{viewingProduction.artisan?.phone ? (isBn ? toBn(viewingProduction.artisan.phone) : viewingProduction.artisan.phone) : ''}</div>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">{isBn ? 'স্ট্যাটাস' : 'Status'}</span>
                                    <div className="mt-1">{getStatusBadge(viewingProduction.status)}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2 text-xs">
                                <h4 className="font-bold text-amber-900 uppercase">{isBn ? 'ওজন ও ধাতুর তথ্য' : 'Metal & Weight Specifications'}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                                    <div>
                                        <span className="text-gray-500 block">{isBn ? 'ঐতিহ্যবাহী ওজন' : 'Traditional Weight'}</span>
                                        <span className="font-bold text-amber-800">
                                            {isBn 
                                                ? `${toBn(viewingProduction.vori || 0)}ভরি ${toBn(viewingProduction.ana || 0)}আনা ${toBn(viewingProduction.roti || 0)}রতি ${toBn(viewingProduction.point || 0)}পয়েন্ট` 
                                                : `${viewingProduction.vori || 0}v ${viewingProduction.ana || 0}a ${viewingProduction.roti || 0}r ${viewingProduction.point || 0}p`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">{isBn ? 'গ্রাম ওজন' : 'Gram Weight'}</span>
                                        <span className="font-bold text-gray-900">{isBn ? `${toBn(viewingProduction.weight_gm || 0)} গ্রাম` : `${viewingProduction.weight_gm || 0}g`}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">{isBn ? 'ওয়েস্টেজ (%)' : 'Wastage %'}</span>
                                        <span className="font-bold text-gray-900">{isBn ? `${toBn(viewingProduction.wastage_percentage || 0)}%` : `${viewingProduction.wastage_percentage || 0}%`}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="bg-gray-50/50">
                                            <td className="py-2.5 px-4 font-semibold text-gray-700">{isBn ? 'প্রদেয় মজুরি' : 'Artisan Charge / Payable'}</td>
                                            <td className="py-2.5 px-4 text-right font-bold text-gray-900">{fmtMoney(viewingProduction.artisan_charge)}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 px-4 font-semibold text-gray-700">{isBn ? 'পরিশোধিত পরিমাণ' : 'Paid Amount'}</td>
                                            <td className="py-2.5 px-4 text-right font-bold text-emerald-600">{fmtMoney(viewingProduction.paid_amount)}</td>
                                        </tr>
                                        <tr className="bg-rose-50/50">
                                            <td className="py-2.5 px-4 font-bold text-rose-800">{isBn ? 'অবশিষ্ট বকেয়া' : 'Remaining Due'}</td>
                                            <td className="py-2.5 px-4 text-right font-black text-rose-700">{fmtMoney(viewingProduction.due_amount)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {viewingProduction.notes && (
                                <div className="p-3 bg-gray-50 rounded-xl text-xs border border-gray-100">
                                    <span className="font-bold text-gray-700 block mb-1">{isBn ? 'নোট / নির্দেশিকা:' : 'Notes / Instructions:'}</span>
                                    <p className="text-gray-600 leading-relaxed">{viewingProduction.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <Link
                                href={route('production.show', viewingProduction.id)}
                                className="text-xs font-bold hover:underline"
                                style={{ color: 'rgb(177,118,51)' }}
                            >
                                {isBn ? 'সম্পূর্ণ জব কার্ড পেজ দেখুন →' : 'View Full Job Card Page →'}
                            </Link>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    {isBn ? 'প্রিন্ট' : 'Print'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewingProduction(null)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                                >
                                    {t('close') || 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
