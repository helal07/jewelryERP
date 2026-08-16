import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Landmark, ArrowLeft, Save, Plus, Trash2, User, Building2, Calendar, FileText, Percent, Info, Receipt, CheckCircle, UserPlus, X } from 'lucide-react';
import axios from 'axios';

export default function Create({ branches = [], customers = [], purities = [], categories = [], products = [] }) {
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

            if (res.data && res.data.mortgageCustomer) {
                const created = res.data.mortgageCustomer;
                setCustomerList(prev => [created, ...prev]);
                setData('mortgage_customer_id', created.id);
                setIsAddCustomerModalOpen(false);
                setNewCustomer({
                    name: '',
                    phone: '',
                    address: '',
                    nid_number: '',
                    status: 'active',
                });
            }
        } catch (err) {
            console.error(err);
            setCustomerError(err.response?.data?.message || 'Failed to save customer. Please check required fields.');
        } finally {
            setCustomerSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mortgages.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('mortgages.index')} 
                            className="p-2.5 bg-gray-50 text-gray-500 hover:bg-[#E88A1A] hover:text-white rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Landmark className="w-7 h-7" style={{ color: 'rgb(177,118,51)' }} />
                                Add Mortgage
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Add Mortgage" />

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ── UNIFIED MASTER FORM CONTAINER ── */}
                <div className="bg-white rounded-3xl shadow-sm border border-amber-200/60 overflow-hidden p-6 space-y-6">

                    {/* HEADER INPUTS GRID */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                            
                            {/* Branch Select */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-[#E88A1A]" />
                                    Branch <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.branch_id}
                                    onChange={(e) => setData('branch_id', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-white focus:border-[#E88A1A] focus:ring-2 focus:ring-[#E88A1A]/20 text-sm font-semibold text-gray-800 px-3 shadow-sm"
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                {errors.branch_id && <p className="text-xs text-rose-500 mt-1">{errors.branch_id}</p>}
                            </div>

                            {/* Customer Select + Quick Add */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-[#E88A1A]" />
                                    Mortgage Customer <span className="text-rose-500">*</span>
                                </label>

                                <div className="flex gap-2">
                                    <select
                                        value={data.mortgage_customer_id}
                                        onChange={(e) => setData('mortgage_customer_id', e.target.value)}
                                        className="flex-1 h-11 rounded-xl border-gray-200 bg-white focus:border-[#E88A1A] focus:ring-2 focus:ring-[#E88A1A]/20 text-sm font-bold text-gray-900 px-3 shadow-sm"
                                        required
                                    >
                                        <option value="">— Select Customer —</option>
                                        {customerList.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} {c.phone ? `- ${c.phone}` : ''}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddCustomerModalOpen(true)}
                                        className="h-11 px-3 border rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer"
                                        style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.3)' }}
                                        title="Quick Add Customer"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                {errors.mortgage_customer_id && <p className="text-xs text-rose-500 mt-1">{errors.mortgage_customer_id}</p>}
                            </div>

                            {/* Mortgage Date */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#E88A1A]" />
                                    Mortgage Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.mortgage_date}
                                    onChange={(e) => setData('mortgage_date', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-white focus:border-[#E88A1A] focus:ring-2 focus:ring-[#E88A1A]/20 text-sm font-semibold text-gray-800 px-3 shadow-sm"
                                    required
                                />
                                {errors.mortgage_date && <p className="text-xs text-rose-500 mt-1">{errors.mortgage_date}</p>}
                            </div>

                        </div>
                    </div>

                    {/* FINANCIAL TERMS SECTION */}
                    <div className="px-6 pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Principal Amount (৳) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.principal_amount}
                                    onChange={e => setData('principal_amount', e.target.value)}
                                    className="w-full h-11 rounded-xl border-amber-200 bg-white focus:border-[#E88A1A] text-sm font-extrabold text-amber-900 px-3 shadow-sm"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.principal_amount && <p className="text-red-500 text-xs mt-1">{errors.principal_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Percent className="w-3.5 h-3.5 text-amber-600" /> Interest Rate <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.interest_rate}
                                    onChange={e => setData('interest_rate', e.target.value)}
                                    className="w-full h-11 rounded-xl border-amber-200 bg-white focus:border-[#E88A1A] text-sm font-bold text-gray-900 px-3 shadow-sm"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.interest_rate && <p className="text-red-500 text-xs mt-1">{errors.interest_rate}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-amber-600" /> Interest Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.interest_type}
                                    onChange={e => setData('interest_type', e.target.value)}
                                    className="w-full h-11 rounded-xl border-amber-200 bg-white focus:border-[#E88A1A] text-sm font-bold text-gray-900 px-3 shadow-sm"
                                >
                                    <option value="monthly">Monthly Interest</option>
                                    <option value="flat">Flat Interest</option>
                                </select>
                                {errors.interest_type && <p className="text-red-500 text-xs mt-1">{errors.interest_type}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-gray-500" /> Due Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={e => setData('due_date', e.target.value)}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-white focus:border-gray-300 text-sm font-medium text-gray-700 px-3 shadow-sm"
                                />
                                {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
                            </div>

                        </div>
                    </div>

                    {/* SECTION 2: MODULAR PLEDGED ITEMS */}
                    <div className="px-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <Landmark className="w-5 h-5 text-[#E88A1A]" />
                                <span className="text-sm font-bold text-gray-800">Pledged Items</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-200/80">
                                    Total Items: {data.items.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer"
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                >
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={index} className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 rounded-2xl p-4 border border-amber-200/60 shadow-sm relative space-y-4 hover:border-amber-400/80 transition-all">
                                    
                                    {/* Card Header Tag & Remove Action */}
                                    <div className="flex justify-between items-center border-b border-amber-100 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-[#E88A1A] text-white flex items-center justify-center text-xs font-extrabold">
                                                {index + 1}
                                            </span>
                                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                                                Pledged Item #{index + 1}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl transition-colors flex items-center gap-1 disabled:opacity-30"
                                            disabled={data.items.length === 1}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>

                                    {/* Row 1: Stock Type, Category, Product, Item Name */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Stock Type</label>
                                            <select
                                                value={item.stock_type}
                                                onChange={e => handleItemChange(index, 'stock_type', e.target.value)}
                                                className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800"
                                            >
                                                <option value="readymade">Ready Made</option>
                                                <option value="custom">Custom Order</option>
                                                <option value="raw_gold">Raw Gold</option>
                                                <option value="scrap">Scrap/Old</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Category</label>
                                            <select
                                                value={item.category_id}
                                                onChange={e => handleItemChange(index, 'category_id', e.target.value)}
                                                className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800"
                                            >
                                                <option value="">— Select Category —</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Product</label>
                                            <select
                                                value={item.product_id}
                                                onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                                                className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800"
                                                disabled={item.stock_type !== 'readymade' && item.stock_type !== 'custom'}
                                            >
                                                <option value="">— Select Product —</option>
                                                {products.filter(p => !item.category_id || p.category_id == item.category_id).map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Product Name</label>
                                            <input
                                                type="text"
                                                value={item.item_name}
                                                onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                                                placeholder="e.g. Gold Necklace 22k"
                                                className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800 focus:border-[#E88A1A]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Row 2: Metal, Purity, Qty, Rate */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Metal & Purity</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={item.metal_type}
                                                    onChange={e => handleItemChange(index, 'metal_type', e.target.value)}
                                                    className="w-1/2 h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800"
                                                >
                                                    <option value="gold">Gold</option>
                                                    <option value="silver">Silver</option>
                                                    <option value="platinum">Platinum</option>
                                                </select>
                                                <select
                                                    value={item.purity_id}
                                                    onChange={e => handleItemChange(index, 'purity_id', e.target.value)}
                                                    className="w-1/2 h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800"
                                                >
                                                    <option value="">— Purity —</option>
                                                    {purities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Qty (Pcs)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-center text-gray-800 focus:border-[#E88A1A]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                                                Rate ({item.weight_unit === 'traditional' ? '/ Vori' : '/ Gram'})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.weight_unit === 'traditional' ? item.rate_per_vori : item.rate_per_gram}
                                                onChange={e => handleItemChange(index, item.weight_unit === 'traditional' ? 'rate_per_vori' : 'rate_per_gram', e.target.value)}
                                                className="w-full h-9 rounded-xl border-gray-200 bg-white text-xs font-bold text-gray-800 focus:border-[#E88A1A]"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1 text-right">Est. Value (৳)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.estimated_value}
                                                onChange={e => handleItemChange(index, 'estimated_value', e.target.value)}
                                                className="w-full h-9 text-xs font-extrabold text-right rounded-lg border-amber-300 bg-amber-50/80 text-amber-900"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Weight Options */}
                                    <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={item.weight_unit === 'traditional'}
                                                    onChange={() => handleItemChange(index, 'weight_unit', 'traditional')}
                                                    className="text-[#E88A1A] focus:ring-[#E88A1A] w-3.5 h-3.5"
                                                />
                                                Traditional (Vori)
                                            </label>
                                            <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={item.weight_unit === 'gram'}
                                                    onChange={() => handleItemChange(index, 'weight_unit', 'gram')}
                                                    className="text-[#E88A1A] focus:ring-[#E88A1A] w-3.5 h-3.5"
                                                />
                                                Gram (g)
                                            </label>
                                        </div>
                                    </div>

                                    {/* Traditional Weight Entry */}
                                    {item.weight_unit === 'traditional' && (
                                        <div className="grid grid-cols-4 gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                            <div>
                                                <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">Vori</label>
                                                <input type="number" value={item.vori} onChange={e => handleItemChange(index, 'vori', e.target.value)} className="w-full h-8 text-xs rounded-lg border-amber-200" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">Ana</label>
                                                <input type="number" value={item.ana} onChange={e => handleItemChange(index, 'ana', e.target.value)} className="w-full h-8 text-xs rounded-lg border-amber-200" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">Roti</label>
                                                <input type="number" value={item.roti} onChange={e => handleItemChange(index, 'roti', e.target.value)} className="w-full h-8 text-xs rounded-lg border-amber-200" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">Point</label>
                                                <input type="number" step="0.01" value={item.point} onChange={e => handleItemChange(index, 'point', e.target.value)} className="w-full h-8 text-xs rounded-lg border-amber-200" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Final Weights & Photo */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Gross Wt (g)</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={item.gross_weight}
                                                onChange={e => handleItemChange(index, 'gross_weight', e.target.value)}
                                                readOnly={item.weight_unit === 'traditional'}
                                                className={`w-full h-9 text-xs font-mono font-bold rounded-lg border-gray-200 ${item.weight_unit === 'traditional' ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Stone/Less (g)</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={item.stone_weight}
                                                onChange={e => handleItemChange(index, 'stone_weight', e.target.value)}
                                                className="w-full h-9 text-xs font-mono font-bold rounded-lg border-gray-200 bg-white text-rose-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Net Wt (g)</label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={item.net_weight}
                                                onChange={e => handleItemChange(index, 'net_weight', e.target.value)}
                                                readOnly
                                                className="w-full h-9 text-xs font-mono font-bold rounded-lg border-gray-200 bg-gray-100 text-gray-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Item Photo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => handleItemChange(index, 'image', e.target.files[0])}
                                                className="w-full text-[10px] font-medium text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                            />
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 min-h-[48px] text-white rounded-xl font-bold text-sm transition-all shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Save className="w-4 h-4" />
                            Save Mortgage
                        </button>
                    </div>

                </div>
            </form>

            {/* ── QUICK ADD CUSTOMER MODAL (REACT DOM PORTAL) ── */}
            {isAddCustomerModalOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-amber-500/20 text-left my-8">
                            
                            {/* Modal Header */}
                            <div className="px-6 py-4 flex items-center justify-between text-white shadow-md" style={{ backgroundColor: 'rgb(177,118,51)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <UserPlus className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold tracking-tight text-white">Add Customer</h3>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddCustomerModalOpen(false)}
                                    className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleQuickAddCustomer} className="p-6 space-y-6">
                                {customerError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                                        {customerError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Customer Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newCustomer.name}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                            className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#E88A1A]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Phone Number <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newCustomer.phone}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#E88A1A]"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Address <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newCustomer.address}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                            className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#E88A1A]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            NID Number
                                        </label>
                                        <input
                                            type="text"
                                            value={newCustomer.nid_number}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, nid_number: e.target.value })}
                                            className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#E88A1A]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={newCustomer.status}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                                            className="w-full h-10 rounded-xl border-gray-300 bg-gray-50 focus:bg-white text-xs font-bold text-gray-900 focus:border-[#E88A1A]"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Modal Footer Actions */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddCustomerModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={customerSubmitting}
                                        className="px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs hover:opacity-90 active:opacity-100 cursor-pointer disabled:opacity-60"
                                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                                    >
                                        {customerSubmitting ? (
                                            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {customerSubmitting ? 'Saving...' : 'Save Customer'}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            , document.body)}
        </AuthenticatedLayout>
    );
}
