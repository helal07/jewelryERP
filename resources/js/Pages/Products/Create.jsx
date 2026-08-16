import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import Modal from '@/Components/Modal';
import {
    ArrowLeft, Save, Plus, Trash2, Tag, Percent, Image as ImageIcon,
    UserPlus, Calculator, Factory, Hash, Calendar, DollarSign, Layers
} from 'lucide-react';
import axios from 'axios';

export default function Create({ categories, purities, suppliers: initialSuppliers }) {
    const { t } = useLanguage();
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    
    // Modal State
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [supplierForm, setSupplierForm] = useState({
        company_name: '', name: '', phone: '', email: '', address: '', nid_number: '', opening_balance: '', credit_limit: '', status: 'active'
    });
    const [supplierErrors, setSupplierErrors] = useState({});

    // Generate a default empty product row
    const getEmptyProduct = () => ({
        stock_type: 'ready_stock',
        date: new Date().toISOString().split('T')[0],
        metal_type: '',
        purity_id: '',
        rate_per_vori: '',
        category_id: '',
        supplier_id: '',
        barcode: '',
        name: '',
        vori: '',
        ana: '',
        roti: '',
        point: '',
        gross_weight: '',
        stone_weight: '',
        making_charge_type: 'per_gram',
        making_charge_value: '',
        stone_charge: '',
        vat_percentage: '',
        wastage_percentage: '',
        unit: 'piece',
        image: null,
        description: '',
        status: 'active',
    });

    const { data, setData, post, processing, errors } = useForm({
        products: [getEmptyProduct()],
    });

    const addRow = () => {
        setData('products', [...data.products, getEmptyProduct()]);
    };

    const removeRow = (index) => {
        if (data.products.length > 1) {
            const newProducts = [...data.products];
            newProducts.splice(index, 1);
            setData('products', newProducts);
        }
    };

    const updateProduct = (index, field, value) => {
        const newProducts = [...data.products];
        newProducts[index][field] = value;
        setData('products', newProducts);
    };

    // Auto-calculate Weight in Gm when Vori/Ana/Roti/Point changes
    const handleVoriCalcChange = (index, field, value) => {
        const newProducts = [...data.products];
        newProducts[index][field] = value;
        
        // Vori formula: 1 Vori = 11.664g, 1 Vori = 16 Ana, 1 Ana = 6 Roti, 1 Roti = 10 Point
        const vori = parseFloat(newProducts[index].vori || 0);
        const ana = parseFloat(newProducts[index].ana || 0);
        const roti = parseFloat(newProducts[index].roti || 0);
        const point = parseFloat(newProducts[index].point || 0);

        const totalVori = vori + (ana / 16) + (roti / (16 * 6)) + (point / (16 * 6 * 10));
        const totalGrams = (totalVori * 11.664).toFixed(3);
        
        // Only update if it's > 0 to not wipe out manual gram entries unnecessarily
        if (totalGrams > 0) {
            newProducts[index].gross_weight = totalGrams;
        }

        setData('products', newProducts);
    };

    const handleSupplierSubmit = async (e) => {
        e.preventDefault();
        setSupplierErrors({});
        try {
            const response = await axios.post(route('suppliers.store'), supplierForm);
            if (response.data.success) {
                // Add new supplier to list
                setSuppliers([...suppliers, response.data.supplier]);
                // Close modal and reset form
                setShowSupplierModal(false);
                setSupplierForm({ company_name: '', name: '', phone: '', email: '', address: '', nid_number: '', opening_balance: '', credit_limit: '', status: 'active' });
                // Optional: Automatically select this supplier in the current row being edited
                // (Would require tracking which row opened the modal)
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setSupplierErrors(error.response.data.errors);
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    const submitAndStay = (e) => {
        e.preventDefault();
        post(route('products.store', { stay: 1 }), {
            onSuccess: () => {
                setData('products', [getEmptyProduct()]);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 tracking-tight">
                        Add Product
                    </h2>
                    <Link
                        href={route('products.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Add Product" />

            {/* Golden-white mixed background */}
            <div className="min-h-screen bg-gradient-to-br from-[#FFFCF5] via-white to-[#FFF8E7] pt-8 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <form onSubmit={submit} className="space-y-6">
                    
                    {data.products.map((product, index) => (
                        <div key={index} className="bg-white/90 backdrop-blur-md shadow-xl shadow-amber-900/5 rounded-3xl border border-amber-200/60 overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                                    
                                    {/* 1. Product Name */}
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={product.name}
                                            onChange={e => updateProduct(index, 'name', e.target.value)}
                                            placeholder="e.g. 22K Gold Bridal Necklace"
                                            className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-base font-medium shadow-sm py-2.5 ${errors[`products.${index}.name`] ? 'border-red-500' : ''}`}
                                            required
                                        />
                                    </div>

                                    {/* 2. Barcode / Pr. Code */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Barcode / Code</label>
                                        <div className="relative">
                                            <Hash className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={product.barcode}
                                                onChange={e => updateProduct(index, 'barcode', e.target.value)}
                                                placeholder="Scan or type..."
                                                className="block w-full pl-9 py-2.5 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                                        <select
                                            value={product.category_id}
                                            onChange={e => updateProduct(index, 'category_id', e.target.value)}
                                            className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-sm shadow-sm ${errors[`products.${index}.category_id`] ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 4. Brand / Supplier */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier / Brand</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={product.supplier_id}
                                                onChange={e => updateProduct(index, 'supplier_id', e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-sm shadow-sm"
                                            >
                                                <option value="">Select Supplier</option>
                                                {suppliers.map(sup => (
                                                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setShowSupplierModal(true)}
                                                className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 border border-amber-200 transition-colors shadow-sm"
                                                title="Add New Supplier"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* 5. Metal Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Metal Type <span className="text-red-500">*</span></label>
                                        <select
                                            value={product.metal_type}
                                            onChange={e => updateProduct(index, 'metal_type', e.target.value)}
                                            className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-sm shadow-sm ${errors[`products.${index}.metal_type`] ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="">Select Metal</option>
                                            <option value="gold">Gold</option>
                                            <option value="silver">Silver</option>
                                            <option value="platinum">Platinum</option>
                                            <option value="diamond">Diamond</option>
                                        </select>
                                    </div>


                                    
                                    {/* 7. Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={product.date}
                                                onChange={e => updateProduct(index, 'date', e.target.value)}
                                                className="block w-full pl-9 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* 8. Stock Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Type</label>
                                        <select
                                            value={product.stock_type}
                                            onChange={e => updateProduct(index, 'stock_type', e.target.value)}
                                            className="block w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-sm shadow-sm"
                                        >
                                            <option value="ready_stock">Ready Stock</option>
                                            <option value="order_stock">Order Stock</option>
                                        </select>
                                    </div>

                                    {/* 9. Rate / Vori */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate / Vori</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500 font-medium text-sm">BDT</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={product.rate_per_vori}
                                                onChange={e => updateProduct(index, 'rate_per_vori', e.target.value)}
                                                placeholder="0.00"
                                                className="block w-full pl-12 rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Divider */}
                                <hr className="my-6 border-gray-200" />

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Weight Calculator Panel */}
                                    <div className="lg:col-span-6 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                        <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center">
                                            <Calculator className="w-4 h-4 mr-1.5" /> Weight Calculator
                                        </h4>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Vori</label>
                                                <input
                                                    type="number" step="any"
                                                    value={product.vori}
                                                    onChange={e => handleVoriCalcChange(index, 'vori', e.target.value)}
                                                    className="block w-full rounded border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm px-2 py-1.5"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Ana</label>
                                                <input
                                                    type="number" step="any"
                                                    value={product.ana}
                                                    onChange={e => handleVoriCalcChange(index, 'ana', e.target.value)}
                                                    className="block w-full rounded border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm px-2 py-1.5"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Roti</label>
                                                <input
                                                    type="number" step="any"
                                                    value={product.roti}
                                                    onChange={e => handleVoriCalcChange(index, 'roti', e.target.value)}
                                                    className="block w-full rounded border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm px-2 py-1.5"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Point</label>
                                                <input
                                                    type="number" step="any"
                                                    value={product.point}
                                                    onChange={e => handleVoriCalcChange(index, 'point', e.target.value)}
                                                    className="block w-full rounded border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm px-2 py-1.5"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Core Weights & Charges */}
                                    <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Weight In Gm <span className="text-red-500">*</span></label>
                                            <input
                                                type="number" step="0.001"
                                                value={product.gross_weight}
                                                onChange={e => updateProduct(index, 'gross_weight', e.target.value)}
                                                className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm bg-yellow-50 font-semibold ${errors[`products.${index}.gross_weight`] ? 'border-red-500' : ''}`}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">VAT %</label>
                                            <div className="relative">
                                                <Percent className="w-3 h-3 absolute right-3 top-3 text-gray-400" />
                                                <input
                                                    type="number" step="0.01"
                                                    value={product.vat_percentage}
                                                    onChange={e => updateProduct(index, 'vat_percentage', e.target.value)}
                                                    className="block w-full pr-8 rounded-lg border-gray-300 focus:border-amber-500 text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">M.C Type</label>
                                            <select
                                                value={product.making_charge_type}
                                                onChange={e => updateProduct(index, 'making_charge_type', e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm py-1.5"
                                            >
                                                <option value="per_gram">Per Gram</option>
                                                <option value="fixed">Fixed</option>
                                                <option value="percentage">% of Price</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Mk. Charge <span className="text-red-500">*</span></label>
                                            <input
                                                type="number" step="0.01"
                                                value={product.making_charge_value}
                                                onChange={e => updateProduct(index, 'making_charge_value', e.target.value)}
                                                className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${errors[`products.${index}.making_charge_value`] ? 'border-red-500' : ''}`}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Photo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => updateProduct(index, 'image', e.target.files[0])}
                                                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Error display for this row */}
                                {Object.keys(errors).some(key => key.startsWith(`products.${index}.`)) && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                        There are validation errors in this row. Please check required fields.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end mt-8">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto flex items-center justify-center px-10 py-3.5 text-base font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg shadow-amber-500/30 focus:ring-4 focus:ring-amber-500/30 disabled:opacity-50 transform hover:-translate-y-0.5"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Saving...' : 'Add Product'}
                        </button>
                    </div>
                </form>
                </div>
            </div>

            {/* Add Supplier Modal */}
            <Modal show={showSupplierModal} onClose={() => setShowSupplierModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-amber-500" /> Add New Supplier
                    </h2>
                    <form onSubmit={handleSupplierSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={supplierForm.company_name}
                                    onChange={e => setSupplierForm({...supplierForm, company_name: e.target.value})}
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.company_name ? 'border-red-500' : ''}`}
                                />
                                {supplierErrors.company_name && <p className="mt-1 text-xs text-red-600">{supplierErrors.company_name[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={supplierForm.name}
                                    onChange={e => setSupplierForm({...supplierForm, name: e.target.value})}
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.name ? 'border-red-500' : ''}`}
                                />
                                {supplierErrors.name && <p className="mt-1 text-xs text-red-600">{supplierErrors.name[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={supplierForm.phone}
                                    onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})}
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.phone ? 'border-red-500' : ''}`}
                                />
                                {supplierErrors.phone && <p className="mt-1 text-xs text-red-600">{supplierErrors.phone[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={supplierForm.email}
                                    onChange={e => setSupplierForm({...supplierForm, email: e.target.value})}
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.email ? 'border-red-500' : ''}`}
                                />
                                {supplierErrors.email && <p className="mt-1 text-xs text-red-600">{supplierErrors.email[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NID Number</label>
                                <input
                                    type="text"
                                    value={supplierForm.nid_number}
                                    onChange={e => setSupplierForm({...supplierForm, nid_number: e.target.value})}
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.nid_number ? 'border-red-500' : ''}`}
                                />
                                {supplierErrors.nid_number && <p className="mt-1 text-xs text-red-600">{supplierErrors.nid_number[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                                <input
                                    type="number" step="0.01"
                                    value={supplierForm.opening_balance}
                                    onChange={e => setSupplierForm({...supplierForm, opening_balance: e.target.value})}
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.opening_balance ? 'border-red-500' : ''}`}
                                />
                                {supplierErrors.opening_balance && <p className="mt-1 text-xs text-red-600">{supplierErrors.opening_balance[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                                <input
                                    type="number" step="0.01"
                                    value={supplierForm.credit_limit}
                                    onChange={e => setSupplierForm({...supplierForm, credit_limit: e.target.value})}
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.credit_limit ? 'border-red-500' : ''}`}
                                />
                                {supplierErrors.credit_limit && <p className="mt-1 text-xs text-red-600">{supplierErrors.credit_limit[0]}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    value={supplierForm.address}
                                    onChange={e => setSupplierForm({...supplierForm, address: e.target.value})}
                                    rows="2"
                                    className={`block w-full rounded-lg border-gray-300 focus:border-amber-500 text-sm ${supplierErrors.address ? 'border-red-500' : ''}`}
                                ></textarea>
                                {supplierErrors.address && <p className="mt-1 text-xs text-red-600">{supplierErrors.address[0]}</p>}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSupplierModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg hover:bg-amber-700"
                            >
                                Save Supplier
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}

