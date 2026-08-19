import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import axios from 'axios';
import { 
    UserCheck, 
    Plus, 
    Search, 
    Filter, 
    Clock, 
    Hammer, 
    CheckCircle2, 
    Calendar, 
    X, 
    Send,
    FileText,
    UserPlus,
    Scale,
    Tag,
    Eye,
    Edit3,
    DollarSign,
    XCircle,
    Save,
    Phone,
    User
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Assignments({ assignments, unassignedOrders, artisans: initialArtisans, filters, stats }) {
    const { t } = useLanguage();

    const [artisans, setArtisans] = useState(initialArtisans || []);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showArtisanModal, setShowArtisanModal] = useState(false);

    // Main Assignment Form State
    const { data, setData, post, processing, errors, reset } = useForm({
        order_id: '',
        artisan_id: '',
        assigned_date: new Date().toISOString().split('T')[0],
        expected_completion_date: '',
        instructions: '',
    });

    // Inline Artisan Form State
    const [artisanForm, setArtisanForm] = useState({
        name: '',
        phone: '',
        address: '',
        specialization: 'Goldsmith (কারিগর)',
        wage_type: 'fixed',
        rate: '0',
        status: 'active'
    });
    const [artisanErrors, setArtisanErrors] = useState({});
    const [isSavingArtisan, setIsSavingArtisan] = useState(false);

    // Give Artisan Payment Form State
    const [showArtisanPayModal, setShowArtisanPayModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const artisanPayForm = useForm({
        artisan_id: '',
        branch_id: '1',
        order_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'cash',
        notes: '',
    });

    const openArtisanPaymentModal = (asgn) => {
        setSelectedAssignment(asgn);
        artisanPayForm.setData({
            artisan_id: asgn.artisan_id || '',
            branch_id: asgn.order?.branch_id || '1',
            order_id: asgn.order_id || '',
            payment_date: new Date().toISOString().split('T')[0],
            amount: asgn.order?.making_charge || asgn.order?.estimated_amount || '',
            payment_method: 'cash',
            notes: `Payment for Order #${asgn.order?.order_no || ''}`,
        });
        setShowArtisanPayModal(true);
    };

    const handleArtisanPaySubmit = (e) => {
        e.preventDefault();
        artisanPayForm.post(route('artisan-payments.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowArtisanPayModal(false);
                artisanPayForm.reset();
            }
        });
    };

    const handleAssignSubmit = (e) => {
        e.preventDefault();
        post(route('orders.assignments.store'), {
            onSuccess: () => {
                setShowAssignModal(false);
                reset();
            }
        });
    };

    const handleStatusChange = (assignmentId, newStatus) => {
        router.patch(route('orders.assignments.update-status', assignmentId), {
            status: newStatus
        });
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [artisanId, setArtisanId] = useState(filters?.artisan_id || '');

    useFilter(route('orders.assignments'), {
        search,
        status,
        artisan_id: artisanId
    });

    // Save Artisan Inline via Axios
    const handleQuickArtisanSubmit = async (e) => {
        e.preventDefault();
        setArtisanErrors({});
        setIsSavingArtisan(true);

        const payload = {};
        Object.keys(artisanForm).forEach(key => {
            const val = artisanForm[key];
            if (val !== null && val !== undefined && val !== '') {
                payload[key] = val;
            }
        });

        try {
            const response = await axios.post(route('artisans.store'), payload, {
                headers: { 
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (response.data && response.data.artisan) {
                const newArtisan = response.data.artisan;
                setArtisans((prev) => [newArtisan, ...prev]);
                setData('artisan_id', newArtisan.id);
                setShowArtisanModal(false);
                setArtisanForm({ name: '', phone: '', address: '', specialization: 'Goldsmith (কারিগর)', rate: '', status: 'active' });
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setArtisanErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                alert('Artisan Error: ' + err.response.data.message);
            } else {
                alert('Failed to save artisan. Please check inputs.');
            }
        } finally {
            setIsSavingArtisan(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            assigned: 'bg-purple-100 text-purple-800 border-purple-200',
            in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            rejected: 'bg-rose-100 text-rose-800 border-rose-200',
        };

        const labels = {
            assigned: 'Assigned',
            in_progress: 'In Progress',
            completed: 'Completed',
            rejected: 'Rejected',
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
                            <UserCheck className="h-7 w-7 text-amber-600" />
                            {t('assignOrder') || 'Assign Order'}
                        </h2>
                    </div>

                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Order
                    </button>
                </div>
            }
        >
            <Head title="Assign Orders" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Total Work Orders</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_assignments || 0}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Assigned</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.assigned || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">In Progress</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.in_progress || 0}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
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
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order #, customer, item name, artisan..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full sm:w-44 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">All Statuses</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            value={artisanId}
                            onChange={(e) => setArtisanId(e.target.value)}
                            className="w-full sm:w-48 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">All Artisans</option>
                            {artisans.map((artisan) => (
                                <option key={artisan.id} value={artisan.id}>
                                    {artisan.name} ({artisan.code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[450px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-4">Order Date</th>
                                <th className="py-4 px-4">Delivery Date</th>
                                <th className="py-4 px-4">Invoice No</th>
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
                            {assignments.data && assignments.data.length > 0 ? (
                                assignments.data.map((asgn) => (
                                    <tr key={asgn.id} className="hover:bg-gray-50/50 transition-colors">
                                        
                                        {/* 1. Order Date */}
                                        <td className="py-4 px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            {asgn.order?.order_date ? String(asgn.order.order_date).substring(0, 10) : (asgn.assigned_date ? String(asgn.assigned_date).substring(0, 10) : '—')}
                                        </td>

                                        {/* 2. Delivery Date */}
                                        <td className="py-4 px-4 text-xs font-semibold text-amber-700 whitespace-nowrap">
                                            {asgn.order?.delivery_date ? String(asgn.order.delivery_date).substring(0, 10) : (asgn.expected_completion_date ? String(asgn.expected_completion_date).substring(0, 10) : '—')}
                                        </td>

                                        {/* 3. Invoice No */}
                                        <td className="py-4 px-4 font-bold text-amber-800 whitespace-nowrap">
                                            <Link href={route('orders.show', asgn.order_id)} className="hover:underline">
                                                {asgn.order?.order_no}
                                            </Link>
                                        </td>

                                        {/* 4. Artisan */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{asgn.artisan?.name || 'Unassigned'}</div>
                                            <div className="text-xs text-indigo-600 font-semibold">{asgn.artisan?.specialization || asgn.artisan?.code}</div>
                                        </td>

                                        {/* 5. Mobile */}
                                        <td className="py-4 px-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                                            {asgn.artisan?.phone || asgn.order?.customer?.phone || '—'}
                                        </td>

                                        {/* 6. Status */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {getStatusBadge(asgn.status)}
                                        </td>

                                        {/* 7. Payable */}
                                        <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                                            ৳{Number(asgn.order?.making_charge || asgn.order?.estimated_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* 8. Paid */}
                                        <td className="py-4 px-4 font-semibold text-emerald-600 whitespace-nowrap">
                                            ৳{Number(asgn.order?.advance_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* 9. Due */}
                                        <td className="py-4 px-4 font-bold whitespace-nowrap">
                                            {Number(asgn.order?.due_amount || 0) > 0 ? (
                                                <span className="text-rose-600">৳{Number(asgn.order?.due_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            ) : (
                                                <span className="text-emerald-600 font-bold">Paid</span>
                                            )}
                                        </td>

                                        {/* 10. Action Dropdown */}
                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150"
                                                    >
                                                        Actions
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" width="48">
                                                    {/* 1. Payment (Give Artisan Payment) */}
                                                    <button
                                                        onClick={() => openArtisanPaymentModal(asgn)}
                                                        className="w-full text-left px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-emerald-50 flex items-center transition duration-150 font-medium"
                                                    >
                                                        <DollarSign className="w-4 h-4 mr-2 text-emerald-600" /> Payment
                                                    </button>

                                                    {/* 2. Processing */}
                                                    <button
                                                        onClick={() => handleStatusChange(asgn.id, 'in_progress')}
                                                        className="w-full text-left px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-amber-50 flex items-center transition duration-150 font-medium"
                                                    >
                                                        <Clock className="w-4 h-4 mr-2 text-amber-500" /> Processing
                                                    </button>

                                                    {/* 3. Complete */}
                                                    <button
                                                        onClick={() => handleStatusChange(asgn.id, 'completed')}
                                                        className="w-full text-left px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-blue-50 flex items-center transition duration-150 font-medium"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" /> Complete
                                                    </button>

                                                    {/* 4. Reject */}
                                                    <button
                                                        onClick={() => handleStatusChange(asgn.id, 'rejected')}
                                                        className="w-full text-left px-4 py-2 text-sm leading-5 text-rose-600 hover:bg-rose-50 flex items-center transition duration-150 font-medium"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2 text-rose-600" /> Reject
                                                    </button>

                                                    <div className="border-t border-gray-100 my-1"></div>

                                                    {/* 5. Edit */}
                                                    <Dropdown.Link href={route('orders.edit', asgn.order_id)} className="flex items-center text-gray-700">
                                                        <Edit3 className="w-4 h-4 mr-2 text-indigo-500" /> Edit
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-gray-400">
                                        <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-base font-semibold text-gray-600">No order assignments found</p>
                                        <p className="text-xs text-gray-400 mt-1">Assign an order to an artisan to start tracking work progress.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {assignments.links && assignments.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Showing <span className="font-semibold text-gray-700">{assignments.from}</span> to <span className="font-semibold text-gray-700">{assignments.to}</span> of <span className="font-semibold text-gray-700">{assignments.total}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {assignments.links.map((link, key) => (
                                <Link
                                    key={key}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
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

            {/* Assign Modal */}
            <Modal show={showAssignModal} onClose={() => setShowAssignModal(false)} maxWidth="2xl">
                <div className="p-6 text-left space-y-5 bg-white rounded-2xl max-h-[88vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Assign Order</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleAssignSubmit} className="space-y-4">
                        {/* Order Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Select Order <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.order_id}
                                onChange={(e) => setData('order_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="">Choose Order</option>
                                {unassignedOrders.map((ord) => (
                                    <option key={ord.id} value={ord.id}>
                                        {ord.order_no} - {ord.product_name || ord.category || 'Item'} ({ord.customer?.name}) - {ord.vori || 0}v {ord.ana || 0}a
                                    </option>
                                ))}
                            </select>
                            {errors.order_id && <p className="text-xs text-rose-500 mt-1">{errors.order_id}</p>}
                        </div>

                        {/* Artisan Selection + Add Artisan Icon Button */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Select Artisan <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={data.artisan_id}
                                    onChange={(e) => setData('artisan_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    <option value="">Choose Artisan</option>
                                    {artisans.map((art) => (
                                        <option key={art.id} value={art.id}>
                                            {art.name} ({art.specialization || art.code})
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() => setShowArtisanModal(true)}
                                    className="p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-xl shadow-sm transition-all shrink-0 flex items-center justify-center hover:scale-105"
                                    title="Add New Artisan"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            </div>
                            {errors.artisan_id && <p className="text-xs text-rose-500 mt-1">{errors.artisan_id}</p>}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Assigned Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.assigned_date}
                                    onChange={(e) => setData('assigned_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                                {errors.assigned_date && <p className="text-xs text-rose-500 mt-1">{errors.assigned_date}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Expected Completion
                                </label>
                                <input
                                    type="date"
                                    value={data.expected_completion_date}
                                    onChange={(e) => setData('expected_completion_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Crafting Instructions / Notes
                            </label>
                            <textarea
                                rows="3"
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                placeholder="Special instructions for the artisan regarding weight tolerance, polish, setting, carving..."
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Send className="w-3.5 h-3.5" />
                                {processing ? 'Assigning...' : 'Assign Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Quick Artisan Modal */}
            <Modal show={showArtisanModal} onClose={() => setShowArtisanModal(false)} maxWidth="lg">
                <div className="p-6 text-left space-y-5 bg-white rounded-2xl">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Artisan</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowArtisanModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleQuickArtisanSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Artisan Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={artisanForm.name}
                                onChange={(e) => setArtisanForm({ ...artisanForm, name: e.target.value })}
                                placeholder="Enter artisan name"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                            {artisanErrors.name && <p className="text-xs text-rose-500 mt-1">{artisanErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Phone Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={artisanForm.phone}
                                onChange={(e) => setArtisanForm({ ...artisanForm, phone: e.target.value })}
                                placeholder="Enter contact phone number"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                            {artisanErrors.phone && <p className="text-xs text-rose-500 mt-1">{artisanErrors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization</label>
                            <input
                                type="text"
                                value={artisanForm.specialization}
                                onChange={(e) => setArtisanForm({ ...artisanForm, specialization: e.target.value })}
                                placeholder="e.g. Goldsmith, Polisher, Setter"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={artisanForm.address}
                                onChange={(e) => setArtisanForm({ ...artisanForm, address: e.target.value })}
                                placeholder="Address (Optional)"
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowArtisanModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingArtisan}
                                className="px-6 py-2 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-3.5 h-3.5" />
                                {isSavingArtisan ? 'Saving...' : 'Save Artisan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Give Artisan Payment Modal */}
            <Modal show={showArtisanPayModal} onClose={() => setShowArtisanPayModal(false)} maxWidth="md">
                <div className="p-6 bg-white rounded-3xl">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Give Artisan Payment</h3>
                                <p className="text-xs text-gray-500">Record wage or making charge payment to artisan</p>
                            </div>
                        </div>
                        <button onClick={() => setShowArtisanPayModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleArtisanPaySubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Artisan</label>
                            <input
                                type="text"
                                disabled
                                value={selectedAssignment?.artisan?.name ? `${selectedAssignment.artisan.name} (${selectedAssignment.artisan.code || ''})` : 'Artisan'}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Order #</label>
                            <input
                                type="text"
                                disabled
                                value={selectedAssignment?.order?.order_no || '—'}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-amber-800"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={artisanPayForm.data.payment_date}
                                    onChange={(e) => artisanPayForm.setData('payment_date', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (৳) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={artisanPayForm.data.amount}
                                    onChange={(e) => artisanPayForm.setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
                            <select
                                value={artisanPayForm.data.payment_method}
                                onChange={(e) => artisanPayForm.setData('payment_method', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="cash">Cash</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notes</label>
                            <textarea
                                rows="2"
                                value={artisanPayForm.data.notes}
                                onChange={(e) => artisanPayForm.setData('notes', e.target.value)}
                                placeholder="Payment remarks..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowArtisanPayModal(false)}
                                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={artisanPayForm.processing}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
                            >
                                {artisanPayForm.processing ? 'Saving...' : 'Save Payment'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
