import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Landmark, 
    ArrowLeft, 
    Save, 
    Plus, 
    Trash2, 
    User, 
    Building2, 
    Calendar, 
    FileText, 
    Percent, 
    Info, 
    Receipt, 
    CheckCircle, 
    UserPlus, 
    X,
    Scale,
    Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/Context/LanguageContext';

export default function Create({ branches = [], customers = [], purities = [], categories = [], products = [] }) {
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

    const [customerList, setCustomerList] = useState(customers);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    
    // Quick Add Customer State
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        address: '',
        nid_number: '',
        status: 'active',
    });
    const [customerSubmitting, setCustomerSubmitting] = useState(false);
    const [customerError, setCustomerError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        mortgage_customer_id: customerList.length > 0 ? customerList[0].id : '',
        mortgage_date: new Date().toISOString().split('T')[0],
        due_date: '',
        principal_amount: '',
        interest_rate: '',
        interest_type: 'monthly',
        items: [
            {
                stock_type: 'readymade',
                category_id: categories.length > 0 ? categories[0].id : '',
                product_id: products.length > 0 ? products[0].id : '',
                item_name: '',
                metal_type: 'gold',
                purity_id: purities.length > 0 ? purities[0].id : '',
                weight_unit: 'traditional',
                vori: 0,
                ana: 0,
                roti: 0,
                point: 0,
                gross_weight: '',
                stone_weight: '',
                net_weight: '',
                rate_per_vori: '',
                rate_per_gram: '',
                estimated_value: '',
                quantity: 1,
                image: null,
            }
        ]
    });

    const VORI_TO_GRAM = 11.664;
    const ANA_TO_GRAM = 0.729;
    const ROTI_TO_GRAM = 0.1215;
    const POINT_TO_GRAM = 0.01215;

    const handleAddItem = () => {
        setData('items', [
            ...data.items,
            {
                stock_type: 'readymade',
                category_id: categories.length > 0 ? categories[0].id : '',
                product_id: products.length > 0 ? products[0].id : '',
                item_name: '',
                metal_type: 'gold',
                purity_id: purities.length > 0 ? purities[0].id : '',
                weight_unit: 'traditional',
                vori: 0,
                ana: 0,
                roti: 0,
                point: 0,
                gross_weight: '',
                stone_weight: '',
                net_weight: '',
                rate_per_vori: '',
                rate_per_gram: '',
                estimated_value: '',
                quantity: 1,
                image: null,
            }
        ]);
    };

    const handleRemoveItem = (index) => {
        if (data.items.length === 1) return;
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        const item = newItems[index];
        item[field] = value;
        
        // Handle Auto-fill for product selection
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                item.item_name = product.name;
                item.metal_type = product.metal_type;
                item.purity_id = product.purity_id;
            }
        }

        // Calculate Gross Weight from traditional fields
        if (['vori', 'ana', 'roti', 'point', 'weight_unit'].includes(field)) {
            if (item.weight_unit === 'traditional') {
                const v = parseFloat(item.vori || 0);
                const a = parseFloat(item.ana || 0);
                const r = parseFloat(item.roti || 0);
                const p = parseFloat(item.point || 0);
                item.gross_weight = ((v * VORI_TO_GRAM) + (a * ANA_TO_GRAM) + (r * ROTI_TO_GRAM) + (p * POINT_TO_GRAM)).toFixed(3);
            }
        }
        
        // Calculate Net Weight
        if (['gross_weight', 'stone_weight', 'vori', 'ana', 'roti', 'point', 'weight_unit'].includes(field)) {
            const gw = parseFloat(item.gross_weight || 0);
            const sw = parseFloat(item.stone_weight || 0);
            item.net_weight = Math.max(0, gw - sw).toFixed(3);
        }

        // Calculate Estimated Value based on rate per vori/gram and net weight
        if (['net_weight', 'rate_per_vori', 'rate_per_gram', 'weight_unit'].includes(field)) {
            const nw = parseFloat(item.net_weight || 0);
            if (item.weight_unit === 'traditional') {
                const rpv = parseFloat(item.rate_per_vori || 0);
                item.estimated_value = ((nw / VORI_TO_GRAM) * rpv).toFixed(2);
            } else {
                const rpg = parseFloat(item.rate_per_gram || 0);
                item.estimated_value = (nw * rpg).toFixed(2);
            }
        }

        setData('items', newItems);
    };

    // Quick Add Customer Submission
    const handleQuickAddCustomer = async (e) => {
        e.preventDefault();
        setCustomerSubmitting(true);
        setCustomerError('');

        try {
            const formData = new FormData();
            formData.append('name', newCustomer.name);
            formData.append('phone', newCustomer.phone || '');
            formData.append('address', newCustomer.address || '');
            formData.append('nid_number', newCustomer.nid_number || '');
            formData.append('status', newCustomer.status || 'active');

            const res = await axios.post(route('mortgage-customers.store'), formData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (res.data && res.data.customer) {
                const created = res.data.customer;
                setCustomerList(prev => [created, ...prev]);
                setData('mortgage_customer_id', created.id);
                setIsAddCustomerModalOpen(false);
                setNewCustomer({ name: '', phone: '', address: '', nid_number: '', status: 'active' });
            }
        } catch (err) {
            setCustomerError(err.response?.data?.message || 'Failed to create customer. Please check input values.');
        } finally {
            setCustomerSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mortgages.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('mortgages.index')}
                            className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl shadow-xs transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                                {isBn ? 'নতুন বন্ধকী ঋণ যোগ করুন' : 'Add New Mortgage'}
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={isBn ? 'নতুন মর্টগেজ' : 'Add Mortgage'} />

            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">
                
                {/* Top Grid: Primary Information & Loan Terms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Card 1: Branch & Customer Info */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <User className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? '১. শাখা ও গ্রাহকের তথ্য' : '1. Branch & Customer Info'}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Branch */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'শাখা *' : 'Branch *'}</label>
                                <select
                                    value={data.branch_id}
                                    onChange={e => setData('branch_id', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                >
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                {errors.branch_id && <p className="text-xs text-rose-500 mt-1">{errors.branch_id}</p>}
                            </div>

                            {/* Customer + Quick Add Button */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'গ্রাহক *' : 'Customer *'}</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={data.mortgage_customer_id}
                                        onChange={e => setData('mortgage_customer_id', e.target.value)}
                                        className="w-full h-11 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                    >
                                        <option value="">{isBn ? 'গ্রাহক নির্বাচন করুন' : 'Select Customer'}</option>
                                        {customerList.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({isBn ? toBn(c.phone) : c.phone})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddCustomerModalOpen(true)}
                                        className="h-11 px-3 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer"
                                        title={isBn ? 'নতুন গ্রাহক তৈরি করুন' : 'Create New Customer'}
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                </div>
                                {errors.mortgage_customer_id && <p className="text-xs text-rose-500 mt-1">{errors.mortgage_customer_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Mortgage Date */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'বন্ধকের তারিখ *' : 'Mortgage Date *'}</label>
                                <input
                                    type="date"
                                    value={data.mortgage_date}
                                    onChange={e => setData('mortgage_date', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                />
                                {errors.mortgage_date && <p className="text-xs text-rose-500 mt-1">{errors.mortgage_date}</p>}
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'পরিশোধের শেষ তারিখ' : 'Due Date'}</label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={e => setData('due_date', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                />
                                {errors.due_date && <p className="text-xs text-rose-500 mt-1">{errors.due_date}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Loan Financial Terms */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Receipt className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? '২. ঋণের পরিমাণ ও সুদের হার' : '2. Principal Amount & Interest Terms'}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Principal Amount */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'মূল ঋণের পরিমাণ (৳) *' : 'Principal Amount (BDT) *'}</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    onFocus={handleNumberFocus}
                                    required
                                    value={data.principal_amount}
                                    onChange={e => setData('principal_amount', cleanNumber(e.target.value))}
                                    className="w-full h-11 rounded-xl border-gray-200 text-base font-bold text-gray-900 focus:border-amber-500"
                                />
                                {errors.principal_amount && <p className="text-xs text-rose-500 mt-1">{errors.principal_amount}</p>}
                            </div>

                            {/* Interest Rate */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'সুদের হার (%) *' : 'Interest Rate (%) *'}</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    onFocus={handleNumberFocus}
                                    required
                                    value={data.interest_rate}
                                    onChange={e => setData('interest_rate', cleanNumber(e.target.value))}
                                    className="w-full h-11 rounded-xl border-gray-200 text-sm font-bold text-gray-900 focus:border-amber-500"
                                />
                                {errors.interest_rate && <p className="text-xs text-rose-500 mt-1">{errors.interest_rate}</p>}
                            </div>

                            {/* Interest Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'সুদের ধরণ' : 'Interest Type'}</label>
                                <select
                                    value={data.interest_type}
                                    onChange={e => setData('interest_type', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                >
                                    <option value="monthly">{isBn ? 'মাসিক (Monthly)' : 'Monthly'}</option>
                                    <option value="yearly">{isBn ? 'বার্ষিক (Yearly)' : 'Yearly'}</option>
                                    <option value="flat">{isBn ? 'ফ্ল্যাট (Flat)' : 'Flat'}</option>
                                </select>
                            </div>
                        </div>

                        {data.principal_amount && data.interest_rate && (
                            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between text-xs font-bold text-amber-900">
                                <span>{isBn ? 'আনুমানিক প্রতি মাসের সুদ:' : 'Estimated Monthly Interest:'}</span>
                                <span className="text-sm font-black">
                                    {fmtMoney((parseFloat(data.principal_amount || 0) * parseFloat(data.interest_rate || 0)) / 100)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Pledged Jewelry Items Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Scale className="w-5 h-5" style={{ color: 'rgb(177,118,51)' }} />
                            {isBn ? '৩. বন্ধক রাখা গহনার তালিকা' : '3. Pledged Jewelry Items'}
                        </h3>

                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            {isBn ? 'আরেকটি গহনা যোগ করুন' : 'Add Another Item'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {data.items.map((item, index) => (
                            <div key={index} className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200 relative space-y-4">
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                                        {isBn ? `গহনা #${toBn(index + 1)}` : `Item #${index + 1}`}
                                    </span>
                                    {data.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-gray-400 hover:text-rose-600 transition p-1"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Item Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'গহনার নাম *' : 'Item Name *'}</label>
                                        <input
                                            type="text"
                                            required
                                            value={item.item_name}
                                            onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                                            placeholder={isBn ? 'যেমন: নেকলেস, চেইন, আংটি' : 'e.g. Necklace, Chain, Ring'}
                                            className="w-full h-10 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                        />
                                    </div>

                                    {/* Metal Type */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'ধাতু' : 'Metal'}</label>
                                        <select
                                            value={item.metal_type}
                                            onChange={e => handleItemChange(index, 'metal_type', e.target.value)}
                                            className="w-full h-10 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                        >
                                            <option value="gold">{isBn ? 'স্বর্ণ (Gold)' : 'Gold'}</option>
                                            <option value="silver">{isBn ? 'রূপা (Silver)' : 'Silver'}</option>
                                            <option value="platinum">{isBn ? 'প্লাটিনাম (Platinum)' : 'Platinum'}</option>
                                        </select>
                                    </div>

                                    {/* Purity */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'ক্যারেট / বিশুদ্ধতা' : 'Purity'}</label>
                                        <select
                                            value={item.purity_id}
                                            onChange={e => handleItemChange(index, 'purity_id', e.target.value)}
                                            className="w-full h-10 rounded-xl border-gray-200 text-sm font-semibold focus:border-amber-500"
                                        >
                                            <option value="">{isBn ? 'নির্বাচন করুন' : 'Select Purity'}</option>
                                            {purities.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({isBn ? toBn(p.percentage) : p.percentage}%)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">{isBn ? 'পরিমাণ (পিস)' : 'Quantity (Pcs)'}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0"
                                            onFocus={handleNumberFocus}
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', cleanNumber(e.target.value))}
                                            className="w-full h-10 rounded-xl border-gray-200 text-sm font-bold focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                {/* Traditional Weight System Inputs */}
                                <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {isBn ? 'ঐতিহ্যবাহী ওজন (ভরি-আনা-রতি-পয়েন্ট)' : 'Traditional Weight (Vori - Ana - Roti - Point)'}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{isBn ? 'ভরি (Vori)' : 'Vori'}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                onFocus={handleNumberFocus}
                                                value={item.vori}
                                                onChange={e => handleItemChange(index, 'vori', cleanNumber(e.target.value))}
                                                className="w-full h-9 rounded-lg border-gray-200 text-sm font-bold focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{isBn ? 'আনা (Ana)' : 'Ana'}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                onFocus={handleNumberFocus}
                                                value={item.ana}
                                                onChange={e => handleItemChange(index, 'ana', cleanNumber(e.target.value))}
                                                className="w-full h-9 rounded-lg border-gray-200 text-sm font-bold focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{isBn ? 'রতি (Roti)' : 'Roti'}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                onFocus={handleNumberFocus}
                                                value={item.roti}
                                                onChange={e => handleItemChange(index, 'roti', cleanNumber(e.target.value))}
                                                className="w-full h-9 rounded-lg border-gray-200 text-sm font-bold focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{isBn ? 'পয়েন্ট (Point)' : 'Point'}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                onFocus={handleNumberFocus}
                                                value={item.point}
                                                onChange={e => handleItemChange(index, 'point', cleanNumber(e.target.value))}
                                                className="w-full h-9 rounded-lg border-gray-200 text-sm font-bold focus:border-amber-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Gram Equivalent & Estimated Value */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{isBn ? 'মোট গ্রাম (Gross gm)' : 'Gross Weight (gm)'}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                onFocus={handleNumberFocus}
                                                value={item.gross_weight}
                                                onChange={e => handleItemChange(index, 'gross_weight', cleanNumber(e.target.value))}
                                                className="w-full h-9 rounded-lg border-gray-200 text-sm font-bold focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{isBn ? 'ভরি প্রতি আনুমানিক দর' : 'Rate / Vori'}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                onFocus={handleNumberFocus}
                                                value={item.rate_per_vori}
                                                onChange={e => handleItemChange(index, 'rate_per_vori', cleanNumber(e.target.value))}
                                                className="w-full h-9 rounded-lg border-gray-200 text-sm font-bold focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">{isBn ? 'আনুমানিক মূল্য (৳)' : 'Estimated Value (BDT)'}</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                onFocus={handleNumberFocus}
                                                value={item.estimated_value}
                                                onChange={e => handleItemChange(index, 'estimated_value', cleanNumber(e.target.value))}
                                                className="w-full h-9 rounded-lg border-gray-200 text-sm font-bold text-amber-900 bg-amber-50/60 focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Action Bar */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Link
                        href={route('mortgages.index')}
                        className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        {t('cancel') || 'Cancel'}
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Save className="w-4 h-4" />
                        {processing ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'মর্টগেজ সংরক্ষণ করুন' : 'Save Mortgage')}
                    </button>
                </div>
            </form>

            {/* Quick Add Customer Modal rendered via createPortal */}
            {isAddCustomerModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
                    <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '540px', maxHeight: '90vh' }}>
                        {/* sticky header */}
                        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{isBn ? 'নতুন গ্রাহক যোগ করুন' : 'Quick Add Customer'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddCustomerModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {customerError && (
                                <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                                    {customerError}
                                </div>
                            )}

                            <form id="quick-customer-form" onSubmit={handleQuickAddCustomer} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'গ্রাহকের নাম *' : 'Customer Name *'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newCustomer.name}
                                        onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        placeholder={isBn ? 'গ্রাহকের নাম লিখুন' : 'Customer Name'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        placeholder={isBn ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {isBn ? 'জাতীয় পরিচয়পত্র / NID' : 'NID Number'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newCustomer.nid_number}
                                        onChange={e => setNewCustomer({ ...newCustomer, nid_number: e.target.value })}
                                        placeholder={isBn ? 'NID নম্বর' : 'NID Number'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">{isBn ? 'ঠিকানা' : 'Address'}</label>
                                    <textarea
                                        rows="2"
                                        value={newCustomer.address}
                                        onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                        placeholder={isBn ? 'গ্রাহকের ঠিকানা...' : 'Customer address...'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* sticky footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAddCustomerModalOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="quick-customer-form"
                                disabled={customerSubmitting}
                                className="px-5 py-2 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                {customerSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'গ্রাহক সংরক্ষণ করুন' : 'Save Customer')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
