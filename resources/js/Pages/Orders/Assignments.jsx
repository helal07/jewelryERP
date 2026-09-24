import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import axios from 'axios';
import { 
    UserCheck, 
    Plus, 
    Search, 
    Clock, 
    Hammer, 
    CheckCircle2, 
    Calendar, 
    X, 
    UserPlus,
    Edit3,
    DollarSign,
    XCircle,
    Save,
    Phone,
    User,
    Layers
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Assignments({ assignments, unassignedOrders = [], artisans: initialArtisans = [], filters = {}, stats = {} }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

    const cleanNumber = (val) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        if (/^0+[0-9]/.test(str)) {
            str = str.replace(/^0+/, '');
        }
        return str;
    };

    const fmtMoney = (val) => {
        const num = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return isBn ? `৳ ${toBn(num)}` : `BDT ${num}`;
    };

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
        rate: '',
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
                setArtisanForm({ name: '', phone: '', address: '', specialization: 'Goldsmith (কারিগর)', wage_type: 'fixed', rate: '', status: 'active' });
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

    const getStatusBadge = (asgnStatus) => {
        const styles = {
            assigned: 'bg-purple-100 text-purple-800 border-purple-200',
            in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            rejected: 'bg-rose-100 text-rose-800 border-rose-200',
        };

        const labelsEn = {
            assigned: 'Assigned',
            in_progress: 'In Progress',
            completed: 'Completed',
            rejected: 'Rejected',
        };

        const labelsBn = {
            assigned: 'বরাদ্দকৃত',
            in_progress: 'প্রক্রিয়াধীন',
            completed: 'সম্পন্ন',
            rejected: 'বাতিলকৃত',
        };

        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[asgnStatus] || 'bg-gray-100 text-gray-800'}`}>
                {isBn ? (labelsBn[asgnStatus] || asgnStatus) : (labelsEn[asgnStatus] || asgnStatus)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <UserCheck className="h-7 w-7" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? 'কারিগর অর্ডার বরাদ্দ' : 'Order Assignments'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAssignModal(true)}
                        className="inline-flex items-center px-4 py-2 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer hover:opacity-90 active:opacity-100"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {isBn ? 'নতুন বরাদ্দ দিন' : 'Assign Order'}
                    </button>
                </div>
            }
        >
            <Head title={isBn ? 'অর্ডার বরাদ্দ' : 'Assign Orders'} />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'মোট কাজের অর্ডার' : 'Total Work Orders'}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{isBn ? toBn(stats?.total_assignments || 0) : (stats?.total_assignments || 0)}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'বরাদ্দকৃত' : 'Assigned'}</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{isBn ? toBn(stats?.assigned || 0) : (stats?.assigned || 0)}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'প্রক্রিয়াধীন' : 'In Progress'}</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{isBn ? toBn(stats?.in_progress || 0) : (stats?.in_progress || 0)}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Hammer className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">{isBn ? 'সম্পন্ন হয়েছে' : 'Completed'}</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{isBn ? toBn(stats?.completed || 0) : (stats?.completed || 0)}</p>
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
                                placeholder={isBn ? 'অর্ডার নং, কাস্টমার বা কারিগরের নাম দিয়ে খুঁজুন...' : 'Search order #, customer, artisan...'}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full sm:w-44 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-gray-700"
                        >
                            <option value="">{isBn ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
                            <option value="assigned">{isBn ? 'বরাদ্দকৃত' : 'Assigned'}</option>
                            <option value="in_progress">{isBn ? 'প্রক্রিয়াধীন' : 'In Progress'}</option>
                            <option value="completed">{isBn ? 'সম্পন্ন' : 'Completed'}</option>
                            <option value="rejected">{isBn ? 'বাতিলকৃত' : 'Rejected'}</option>
                        </select>

                        <select
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
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'অর্ডারের তারিখ' : 'Order Date'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ডেলিভারির তারিখ' : 'Delivery Date'}</th>
                                <th className="px-3 py-2.5 text-[11px] font-bold uppercase whitespace-nowrap">{isBn ? 'ইনভয়েস নং' : 'Invoice No'}</th>
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
                            {assignments.data && assignments.data.length > 0 ? (
                                assignments.data.map((asgn) => (
                                    <tr key={asgn.id} className="hover:bg-gray-50/50 transition-colors">
                                        
                                        {/* 1. Order Date */}
                                        <td className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap">
                                            {asgn.order?.order_date ? (isBn ? toBn(String(asgn.order.order_date).substring(0, 10)) : String(asgn.order.order_date).substring(0, 10)) : (asgn.assigned_date ? (isBn ? toBn(String(asgn.assigned_date).substring(0, 10)) : String(asgn.assigned_date).substring(0, 10)) : '—')}
                                        </td>

                                        {/* 2. Delivery Date */}
                                        <td className="px-3 py-3 font-semibold text-amber-700 whitespace-nowrap">
                                            {asgn.order?.delivery_date ? (isBn ? toBn(String(asgn.order.delivery_date).substring(0, 10)) : String(asgn.order.delivery_date).substring(0, 10)) : (asgn.expected_completion_date ? (isBn ? toBn(String(asgn.expected_completion_date).substring(0, 10)) : String(asgn.expected_completion_date).substring(0, 10)) : '—')}
                                        </td>

                                        {/* 3. Invoice No */}
                                        <td className="px-3 py-3 font-bold text-amber-800 whitespace-nowrap">
                                            <Link href={route('orders.show', asgn.order_id)} className="hover:underline">
                                                {isBn ? toBn(asgn.order?.order_no) : asgn.order?.order_no}
                                            </Link>
                                        </td>

                                        {/* 4. Artisan */}
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{asgn.artisan?.name || (isBn ? 'অবরাদ্দকৃত' : 'Unassigned')}</div>
                                            <div className="text-[11px] text-indigo-600 font-semibold">{asgn.artisan?.specialization || (isBn ? toBn(asgn.artisan?.code) : asgn.artisan?.code)}</div>
                                        </td>

                                        {/* 5. Mobile */}
                                        <td className="px-3 py-3 font-medium text-gray-600 whitespace-nowrap">
                                            {asgn.artisan?.phone ? (isBn ? toBn(asgn.artisan.phone) : asgn.artisan.phone) : (asgn.order?.customer?.phone ? (isBn ? toBn(asgn.order.customer.phone) : asgn.order.customer.phone) : '—')}
                                        </td>

                                        {/* 6. Status */}
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {getStatusBadge(asgn.status)}
                                        </td>

                                        {/* 7. Payable */}
                                        <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap">
                                            {fmtMoney(asgn.order?.making_charge || asgn.order?.estimated_amount || 0)}
                                        </td>

                                        {/* 8. Paid */}
                                        <td className="px-3 py-3 font-semibold text-emerald-600 whitespace-nowrap">
                                            {fmtMoney(asgn.order?.advance_amount || 0)}
                                        </td>

                                        {/* 9. Due */}
                                        <td className="px-3 py-3 font-bold whitespace-nowrap">
                                            {Number(asgn.order?.due_amount || 0) > 0 ? (
                                                <span className="text-rose-600">{fmtMoney(asgn.order?.due_amount || 0)}</span>
                                            ) : (
                                                <span className="text-emerald-600 font-bold">{isBn ? 'পরিশোধিত' : 'Paid'}</span>
                                            )}
                                        </td>

                                        {/* 10. Action Dropdown */}
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
                                                    {/* 1. Payment */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openArtisanPaymentModal(asgn);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs leading-5 text-gray-700 hover:bg-emerald-50 flex items-center transition duration-150 font-medium cursor-pointer"
                                                    >
                                                        <DollarSign className="w-4 h-4 mr-2 text-emerald-600" /> {isBn ? 'মজুরি পরিশোধ' : 'Payment'}
                                                    </button>

                                                    {/* 2. Processing */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(asgn.id, 'in_progress');
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs leading-5 text-gray-700 hover:bg-amber-50 flex items-center transition duration-150 font-medium cursor-pointer"
                                                    >
                                                        <Clock className="w-4 h-4 mr-2 text-amber-500" /> {isBn ? 'প্রক্রিয়া শুরু' : 'Processing'}
                                                    </button>

                                                    {/* 3. Complete */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(asgn.id, 'completed');
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs leading-5 text-gray-700 hover:bg-blue-50 flex items-center transition duration-150 font-medium cursor-pointer"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" /> {isBn ? 'কাজ সম্পন্ন' : 'Complete'}
                                                    </button>

                                                    {/* 4. Reject */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(asgn.id, 'rejected');
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-xs leading-5 text-rose-600 hover:bg-rose-50 flex items-center transition duration-150 font-medium cursor-pointer"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2 text-rose-600" /> {isBn ? 'বাতিল করুন' : 'Reject'}
                                                    </button>

                                                    <div className="border-t border-gray-100 my-1"></div>

                                                    {/* 5. Edit */}
                                                    <Dropdown.Link href={route('orders.edit', asgn.order_id)} className="flex items-center text-xs text-gray-700">
                                                        <Edit3 className="w-4 h-4 mr-2 text-indigo-500" /> {isBn ? 'অর্ডার এডিট' : 'Edit Order'}
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
                                        <p className="text-base font-semibold text-gray-600">{isBn ? 'কোনো অর্ডার বরাদ্দ পাওয়া যায়নি' : 'No order assignments found'}</p>
                                        <p className="text-xs text-gray-400 mt-1">{isBn ? 'কাজের অগ্রগতি ট্র্যাক করতে কারিগরকে অর্ডার বরাদ্দ দিন।' : 'Assign an order to an artisan to start tracking work progress.'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {assignments.links && assignments.links.length > 3 && (
                    <div className="mt-4">
                        <Pagination links={assignments.links} />
                    </div>
                )}
            </div>

            {/* Modal 1: Assign Order Modal rendered with createPortal */}
            {showAssignModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '660px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{isBn ? 'অর্ডার বরাদ্দ করুন' : 'Assign Order'}</h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="assign-order-form" onSubmit={handleAssignSubmit} className="space-y-4">
                                {/* Order Selection */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'অর্ডার নির্বাচন করুন' : 'Select Order'} <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.order_id}
                                        onChange={(e) => setData('order_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="">{isBn ? 'অর্ডার বেছে নিন' : 'Choose Order'}</option>
                                        {unassignedOrders.map((ord) => (
                                            <option key={ord.id} value={ord.id}>
                                                {isBn ? toBn(ord.order_no) : ord.order_no} - {ord.product_name || ord.category || (isBn ? 'পণ্য' : 'Item')} ({ord.customer?.name}) - {isBn ? `${toBn(ord.vori || 0)}ভরি ${toBn(ord.ana || 0)}আনা` : `${ord.vori || 0}v ${ord.ana || 0}a`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.order_id && <p className="text-xs text-rose-500 mt-1">{errors.order_id}</p>}
                                </div>

                                {/* Artisan Selection + Add Artisan Button */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'কারিগর নির্বাচন করুন' : 'Select Artisan'} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={data.artisan_id}
                                            onChange={(e) => setData('artisan_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">{isBn ? 'কারিগর বেছে নিন' : 'Choose Artisan'}</option>
                                            {artisans.map((art) => (
                                                <option key={art.id} value={art.id}>
                                                    {art.name} ({art.specialization || (isBn ? toBn(art.code) : art.code)})
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => setShowArtisanModal(true)}
                                            className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center cursor-pointer"
                                            title={isBn ? 'নতুন কারিগর যোগ করুন' : 'Add New Artisan'}
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
                                            {isBn ? 'বরাদ্দের তারিখ' : 'Assigned Date'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.assigned_date}
                                            onChange={(e) => setData('assigned_date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                        {errors.assigned_date && <p className="text-xs text-rose-500 mt-1">{errors.assigned_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            {isBn ? 'সম্ভাব্য সম্পন্ন তারিখ' : 'Expected Completion'}
                                        </label>
                                        <input
                                            type="date"
                                            value={data.expected_completion_date}
                                            onChange={(e) => setData('expected_completion_date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                        {errors.expected_completion_date && <p className="text-xs text-rose-500 mt-1">{errors.expected_completion_date}</p>}
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'কারিগরকে কাজের বিশেষ নির্দেশিকা' : 'Artisan Crafting Instructions'}
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        placeholder={isBn ? 'যেমন: ফিনিশিং মসৃণ হতে হবে, বিশেষ নকশা ইত্যাদি...' : 'Special notes or instructions for the craftsman...'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="assign-order-form"
                                disabled={processing}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'বরাদ্দ নিশ্চিত করুন' : 'Confirm Assignment')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal 2: Quick Add Artisan Modal rendered with createPortal */}
            {showArtisanModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '560px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{isBn ? 'নতুন কারিগর তৈরি করুন' : 'Add New Artisan'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowArtisanModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="quick-artisan-form" onSubmit={handleQuickArtisanSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'কারিগরের নাম' : 'Artisan Name'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={artisanForm.name}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, name: e.target.value })}
                                        placeholder={isBn ? 'কারিগরের নাম লিখুন' : 'Artisan Name'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    {artisanErrors.name && <p className="text-xs text-rose-500 mt-1">{artisanErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={artisanForm.phone}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, phone: e.target.value })}
                                        placeholder={isBn ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    {artisanErrors.phone && <p className="text-xs text-rose-500 mt-1">{artisanErrors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'দক্ষতা / বিভাগ' : 'Specialization'}</label>
                                    <input
                                        type="text"
                                        value={artisanForm.specialization}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, specialization: e.target.value })}
                                        placeholder={isBn ? 'স্বর্ণের কারিগর / রত্ন কারিগর' : 'Goldsmith (কারিগর)'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'ঠিকানা' : 'Address'}</label>
                                    <textarea
                                        rows="2"
                                        value={artisanForm.address}
                                        onChange={(e) => setArtisanForm({ ...artisanForm, address: e.target.value })}
                                        placeholder={isBn ? 'কারিগরের ঠিকানা...' : 'Artisan address...'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowArtisanModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="quick-artisan-form"
                                disabled={isSavingArtisan}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {isSavingArtisan ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'কারিগর সংরক্ষণ করুন' : 'Save Artisan')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal 3: Give Artisan Payment Modal rendered with createPortal */}
            {showArtisanPayModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '560px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{isBn ? 'কারিগরকে মজুরি পরিশোধ' : 'Give Artisan Payment'}</h3>
                                    {selectedAssignment && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {selectedAssignment.artisan?.name} • {isBn ? `অর্ডার #${toBn(selectedAssignment.order?.order_no)}` : `Order #${selectedAssignment.order?.order_no}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowArtisanPayModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            <form id="artisan-payment-form" onSubmit={handleArtisanPaySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'পরিশোধের তারিখ' : 'Payment Date'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={artisanPayForm.data.payment_date}
                                        onChange={(e) => artisanPayForm.setData('payment_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    {artisanPayForm.errors.payment_date && <p className="text-xs text-rose-500 mt-1">{artisanPayForm.errors.payment_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'পরিশোধের পরিমাণ (৳)' : 'Payment Amount (BDT)'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        onFocus={handleNumberFocus}
                                        required
                                        value={artisanPayForm.data.amount}
                                        onChange={(e) => artisanPayForm.setData('amount', cleanNumber(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    {artisanPayForm.errors.amount && <p className="text-xs text-rose-500 mt-1">{artisanPayForm.errors.amount}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                                    </label>
                                    <select
                                        value={artisanPayForm.data.payment_method}
                                        onChange={(e) => artisanPayForm.setData('payment_method', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                                        <option value="bank">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                                        <option value="bkash">{isBn ? 'বিকাশ' : 'bKash'}</option>
                                        <option value="nagad">{isBn ? 'নগদ (Nagad)' : 'Nagad'}</option>
                                        <option value="cheque">{isBn ? 'চেক' : 'Cheque'}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'নোট / বিবরণ' : 'Notes / Remarks'}</label>
                                    <textarea
                                        rows="2"
                                        value={artisanPayForm.data.notes}
                                        onChange={(e) => artisanPayForm.setData('notes', e.target.value)}
                                        placeholder={isBn ? 'পেমেন্ট সংক্রান্ত কোনো বিবরণ...' : 'Payment notes...'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowArtisanPayModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="artisan-payment-form"
                                disabled={artisanPayForm.processing}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {artisanPayForm.processing ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পেমেন্ট সম্পন্ন করুন' : 'Record Payment')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
