import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { 
    ArrowLeft, 
    Save, 
    Upload, 
    Sparkles, 
    Calendar, 
    User, 
    Building2,
    UserPlus, 
    PackagePlus, 
    Package, 
    X, 
    Calculator, 
    FileText, 
    CreditCard, 
    Phone, 
    Hash
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const cleanNumber = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (/^0+[0-9]/.test(str)) {
        str = str.replace(/^0+/, '');
    }
    return str;
};

export default function Create({ customers: initialCustomers, purities, branches, products: initialProducts, categories, suppliers: initialSuppliers }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const [customers, setCustomers] = useState(initialCustomers || []);
    const [products, setProducts] = useState(initialProducts || []);
    const [suppliers, setSuppliers] = useState(initialSuppliers || []);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Modal States
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    const handleNumberFocus = (e) => {
        if (e.target.value === '0' || e.target.value === '0.00' || e.target.value === '০') {
            e.target.value = '';
        }
    };

    // Full Customer Form State
    const [customerForm, setCustomerForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        nid_number: '',
        opening_balance: '',
        credit_limit: '',
        status: 'active',
        photo: null
    });
    const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
    const [customerErrors, setCustomerErrors] = useState({});
    const [isSavingCustomer, setIsSavingCustomer] = useState(false);

    // Full Product Form State
    const [productForm, setProductForm] = useState({
        name: '',
        barcode: '',
        category_id: categories?.[0]?.id || '',
        supplier_id: suppliers?.[0]?.id || '',
        metal_type: 'gold',
        purity_id: purities?.[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        stock_type: 'ready_stock',
        rate_per_vori: '',
        vori: '',
        ana: '',
        roti: '',
        point: '',
        gross_weight: '',
        vat_percentage: '',
        making_charge_type: 'per_gram',
        making_charge_value: '',
        stone_charge: '',
        photo: null,
        description: '',
        unit: 'piece',
        status: 'active'
    });
    const [productPhotoPreview, setProductPhotoPreview] = useState(null);
    const [productErrors, setProductErrors] = useState({});
    const [isSavingProduct, setIsSavingProduct] = useState(false);

    // Traditional Weight State for Main Form
    const [weightCalc, setWeightCalc] = useState({
        vori: '',
        ana: '',
        roti: '',
        point: ''
    });

    // Main Order Form State
    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches?.[0]?.id || '',
        customer_id: '',
        product_id: '',
        product_name: '',
        category: categories?.[0]?.name || 'Bangle',
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        product_description: '',
        metal_type: 'Gold',
        purity_id: purities?.[0]?.id || '',
        rate_per_vori: '',
        vori: '',
        ana: '',
        roti: '',
        point: '',
        estimated_weight: '',
        making_charge: '',
        vat_amount: '',
        hallmark_charge: '',
        stone_charge: '',
        estimated_amount: '',
        advance_amount: '',
        reference_image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);

    // Selected customer info preview
    useEffect(() => {
        if (data.customer_id) {
            const found = customers.find(c => c.id == data.customer_id);
            setSelectedCustomer(found || null);
        } else {
            setSelectedCustomer(null);
        }
    }, [data.customer_id, customers]);

    // Handle selecting an existing product
    const handleProductSelect = (productId) => {
        setData('product_id', productId);
        if (!productId) return;

        const prod = products.find(p => p.id == productId);
        if (prod) {
            setData((prev) => ({
                ...prev,
                product_id: prod.id,
                product_name: prod.name,
                metal_type: prod.metal_type ? (prod.metal_type.charAt(0).toUpperCase() + prod.metal_type.slice(1)) : prev.metal_type,
                purity_id: prod.purity_id || prev.purity_id,
                estimated_weight: prod.gross_weight || prev.estimated_weight,
                product_description: prod.name + (prod.sku ? ` (${prod.sku})` : ''),
            }));
        }
    };

    // Customer photo handle
    const handleCustomerPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomerForm({ ...customerForm, photo: file });
            const reader = new FileReader();
            reader.onloadend = () => setCustomerPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Product photo handle
    const handleProductPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductForm({ ...productForm, photo: file });
            const reader = new FileReader();
            reader.onloadend = () => setProductPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Traditional Vori -> Grams calculation in Product Modal
    const handleProductVoriCalcChange = (field, value) => {
        const next = { ...productForm, [field]: value };
        const vori = parseFloat(next.vori || 0);
        const ana = parseFloat(next.ana || 0);
        const roti = parseFloat(next.roti || 0);
        const point = parseFloat(next.point || 0);

        const totalVori = vori + (ana / 16) + (roti / 96) + (point / 960);
        const totalGrams = (totalVori * 11.664).toFixed(3);

        setProductForm({
            ...next,
            gross_weight: totalGrams > 0 ? totalGrams : next.gross_weight
        });
    };

    // Traditional Vori -> Grams calculation in Order Form
    const handleWeightCalcChange = (field, rawValue) => {
        const value = cleanNumber(rawValue);
        const nextCalc = { ...weightCalc, [field]: value };
        setWeightCalc(nextCalc);

        const vori = parseFloat(nextCalc.vori || 0);
        const ana = parseFloat(nextCalc.ana || 0);
        const roti = parseFloat(nextCalc.roti || 0);
        const point = parseFloat(nextCalc.point || 0);

        const totalVori = vori + (ana / 16) + (roti / 96) + (point / 960);
        const totalGrams = (totalVori * 11.664).toFixed(3);

        setData((prev) => {
            const updated = {
                ...prev,
                [field]: value,
                estimated_weight: totalGrams > 0 ? totalGrams : prev.estimated_weight,
            };
            return calculateTotalAmount(updated, totalVori);
        });
    };

    // Auto-calculate estimated total amount based on Rate/Vori + Weight + Making Charge + Stone + VAT + Hallmark
    const calculateTotalAmount = (currentData, computedVori = null) => {
        const vori = computedVori !== null ? computedVori : (
            parseFloat(currentData.vori || 0) + 
            (parseFloat(currentData.ana || 0) / 16) + 
            (parseFloat(currentData.roti || 0) / 96) + 
            (parseFloat(currentData.point || 0) / 960)
        );

        const rate = parseFloat(currentData.rate_per_vori || 0);
        const metalCost = vori > 0 && rate > 0 ? (vori * rate) : 0;

        const making = parseFloat(currentData.making_charge || 0);
        const vat = parseFloat(currentData.vat_amount || 0);
        const hallmark = parseFloat(currentData.hallmark_charge || 0);
        const stone = parseFloat(currentData.stone_charge || 0);

        const total = metalCost + making + vat + hallmark + stone;

        if (total > 0) {
            currentData.estimated_amount = total.toFixed(2);
        }
        return currentData;
    };

    const handleFieldChange = (field, rawValue) => {
        const value = (field === 'making_charge' || field === 'vat_amount' || field === 'hallmark_charge' || field === 'stone_charge' || field === 'rate_per_vori' || field === 'estimated_amount' || field === 'advance_amount') ? cleanNumber(rawValue) : rawValue;
        setData((prev) => {
            const nextData = { ...prev, [field]: value };
            return calculateTotalAmount(nextData);
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('reference_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('reference_image', null);
        setImagePreview(null);
    };

    // Calculated remaining due
    const calculatedDue = Math.max(
        0, 
        (parseFloat(data.estimated_amount) || 0) - (parseFloat(data.advance_amount) || 0)
    );

    // Save Full Customer via Axios
    const handleQuickCustomerSubmit = async (e) => {
        e.preventDefault();
        setCustomerErrors({});
        setIsSavingCustomer(true);

        const formData = new FormData();
        Object.keys(customerForm).forEach(key => {
            const val = customerForm[key];
            if (val !== null && val !== undefined && val !== '') {
                formData.append(key, val);
            }
        });

        try {
            const response = await axios.post(route('customers.store'), formData, {
                headers: { 
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.customer) {
                const newCustomer = response.data.customer;
                setCustomers((prev) => [newCustomer, ...prev]);
                setData('customer_id', newCustomer.id);
                setSelectedCustomer(newCustomer);
                setShowCustomerModal(false);
                setCustomerForm({
                    name: '', phone: '', email: '', address: '', nid_number: '', opening_balance: '', credit_limit: '', status: 'active', photo: null
                });
                setCustomerPhotoPreview(null);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setCustomerErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
                alert(t('Failed to save customer. Please check inputs.'));
            }
        } finally {
            setIsSavingCustomer(false);
        }
    };

    // Save Full Product via Axios
    const handleQuickProductSubmit = async (e) => {
        e.preventDefault();
        setProductErrors({});
        setIsSavingProduct(true);

        const payload = {
            products: [{
                name: productForm.name,
                barcode: productForm.barcode,
                category_id: productForm.category_id,
                supplier_id: productForm.supplier_id,
                metal_type: productForm.metal_type,
                purity_id: productForm.purity_id,
                date: productForm.date,
                stock_type: productForm.stock_type,
                rate_per_vori: productForm.rate_per_vori,
                gross_weight: productForm.gross_weight,
                vori: productForm.vori,
                ana: productForm.ana,
                roti: productForm.roti,
                point: productForm.point,
                making_charge_type: productForm.making_charge_type,
                making_charge_value: productForm.making_charge_value,
                stone_charge: productForm.stone_charge,
                vat_percentage: productForm.vat_percentage,
                description: productForm.description,
                unit: 'piece',
                status: 'active'
            }]
        };

        try {
            const response = await axios.post(route('products.store'), payload, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (response.data && (response.data.product || response.data.products)) {
                const newProd = response.data.product || response.data.products[0];
                setProducts([newProd, ...products]);
                
                setData((prev) => ({
                    ...prev,
                    product_id: newProd.id,
                    product_name: newProd.name,
                    metal_type: newProd.metal_type ? (newProd.metal_type.charAt(0).toUpperCase() + newProd.metal_type.slice(1)) : prev.metal_type,
                    purity_id: newProd.purity_id || prev.purity_id,
                    estimated_weight: newProd.gross_weight || prev.estimated_weight,
                    rate_per_vori: newProd.rate_per_vori || prev.rate_per_vori,
                    making_charge: newProd.making_charge_value || prev.making_charge,
                    stone_charge: newProd.stone_charge || prev.stone_charge,
                    vori: productForm.vori || prev.vori,
                    ana: productForm.ana || prev.ana,
                    roti: productForm.roti || prev.roti,
                    point: productForm.point || prev.point,
                    product_description: newProd.name + ' - Custom Product',
                }));

                setShowProductModal(false);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setProductErrors(err.response.data.errors);
            } else {
                alert(t('Failed to add product. Please check inputs.'));
            }
        } finally {
            setIsSavingProduct(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('orders.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('orders.index')}
                            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl shadow-xs hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-[#b17633]" />
                                {t('New Order')}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">{t('Record custom jewelry order specifications & customer advance')}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('New Order')} />

            <div className="max-w-5xl mx-auto pb-16">
                <form onSubmit={handleSubmit}>
                    {/* Unified Single Section Container */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-sm space-y-6">
                        
                        {/* Order & Customer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Branch */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Branch')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => setData('branch_id', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    >
                                        <option value="">{t('Select Branch')}</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.branch_id && <p className="text-xs text-rose-500 mt-1">{errors.branch_id}</p>}
                            </div>

                            {/* Customer */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Customer')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex-1">
                                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <select
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                        >
                                            <option value="">{t('Select Customer')}</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} {c.phone ? `(${c.phone})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomerModal(true)}
                                        className="p-2 border rounded-xl shadow-xs transition-all shrink-0 hover:opacity-90 active:opacity-100 cursor-pointer bg-amber-50 text-[#b17633] border-amber-300"
                                        title={t('Add Customer')}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                {errors.customer_id && <p className="text-xs text-rose-500 mt-1">{errors.customer_id}</p>}
                            </div>

                            {/* Order Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Order Date')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={data.order_date}
                                        onChange={(e) => setData('order_date', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                </div>
                                {errors.order_date && <p className="text-xs text-rose-500 mt-1">{errors.order_date}</p>}
                            </div>

                            {/* Delivery Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Delivery Date')}
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={data.delivery_date}
                                        onChange={(e) => setData('delivery_date', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                </div>
                                {errors.delivery_date && <p className="text-xs text-rose-500 mt-1">{errors.delivery_date}</p>}
                            </div>
                        </div>

                        {/* Customer Information Preview */}
                        {selectedCustomer && (
                            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900">{selectedCustomer.name}</span>
                                    {selectedCustomer.phone && <span className="text-gray-600">{t('Phone')}: {isBn ? toBn(selectedCustomer.phone) : selectedCustomer.phone}</span>}
                                    {selectedCustomer.address && <span className="text-gray-500">| {selectedCustomer.address}</span>}
                                </div>
                                {selectedCustomer.due_balance !== undefined && (
                                    <div className="font-semibold">
                                        <span className="text-gray-500 mr-1">{t('Due Amount')}:</span>
                                        <span className={Number(selectedCustomer.due_balance) > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                            {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(selectedCustomer.due_balance)) : fmtBDT(selectedCustomer.due_balance)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border-t border-gray-100"></div>

                        {/* Product & Specifications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Product Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Select Product')}
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex-1">
                                        <Package className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <select
                                            value={data.product_id}
                                            onChange={(e) => handleProductSelect(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                        >
                                            <option value="">{t('Select Existing Product')}</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} {p.sku ? `(${p.sku})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowProductModal(true)}
                                        className="p-2 border rounded-xl shadow-xs transition-all shrink-0 hover:opacity-90 active:opacity-100 cursor-pointer bg-amber-50 text-[#b17633] border-amber-300"
                                        title={t('Add Product')}
                                    >
                                        <PackagePlus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Product Name')}
                                </label>
                                <input
                                    type="text"
                                    value={data.product_name}
                                    onChange={(e) => setData('product_name', e.target.value)}
                                    placeholder="e.g. 22K Gold Bridal Bangle"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Category')}
                                </label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                >
                                    {categories && categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="Bangle">Bangle</option>
                                            <option value="Ring">Ring</option>
                                            <option value="Necklace">Necklace</option>
                                            <option value="Chain">Chain</option>
                                            <option value="Earring">Earring</option>
                                            <option value="Bracelet">Bracelet</option>
                                            <option value="Pendant">Pendant</option>
                                            <option value="Crown">Crown</option>
                                            <option value="Anklet">Anklet</option>
                                            <option value="Bridal Set">Bridal Set</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Metal Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Metal')} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.metal_type}
                                    onChange={(e) => setData('metal_type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                >
                                    <option value="Gold">{t('Gold')}</option>
                                    <option value="Silver">{t('Silver')}</option>
                                    <option value="Platinum">{t('Platinum')}</option>
                                    <option value="Diamond">{t('Diamond')}</option>
                                </select>
                            </div>

                            {/* Purity */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Purity')} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.purity_id}
                                    onChange={(e) => setData('purity_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                >
                                    <option value="">{t('Select Purity')}</option>
                                    {purities.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.percentage}%)</option>
                                    ))}
                                </select>
                                {errors.purity_id && <p className="text-xs text-rose-500 mt-1">{errors.purity_id}</p>}
                            </div>

                            {/* Rate / Vori */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Rate/Vori')} ({isBn ? '৳' : 'BDT'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.rate_per_vori ?? ''}
                                    onChange={(e) => handleFieldChange('rate_per_vori', e.target.value)}
                                    onFocus={handleNumberFocus}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-amber-800 focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                />
                            </div>
                        </div>

                        {/* Weight in Vori, Ana, Roti, Point and Grams */}
                        <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-200/80">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('Vori')}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={data.vori ?? ''}
                                        onChange={(e) => handleWeightCalcChange('vori', e.target.value)}
                                        onFocus={handleNumberFocus}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('Ana')}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        max="15"
                                        value={data.ana ?? ''}
                                        onChange={(e) => handleWeightCalcChange('ana', e.target.value)}
                                        onFocus={handleNumberFocus}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('Roti')}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        max="5"
                                        value={data.roti ?? ''}
                                        onChange={(e) => handleWeightCalcChange('roti', e.target.value)}
                                        onFocus={handleNumberFocus}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('Point')}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        max="9"
                                        value={data.point ?? ''}
                                        onChange={(e) => handleWeightCalcChange('point', e.target.value)}
                                        onFocus={handleNumberFocus}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold text-amber-900 mb-1">
                                        {t('Weight (g)')} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.estimated_weight ?? ''}
                                        onChange={(e) => setData('estimated_weight', cleanNumber(e.target.value))}
                                        onFocus={handleNumberFocus}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-amber-300 rounded-xl text-sm font-bold text-gray-900 bg-amber-50/50 focus:ring-2 focus:ring-[#b17633]/20"
                                    />
                                </div>
                            </div>
                            {errors.estimated_weight && <p className="text-xs text-rose-500 mt-1">{errors.estimated_weight}</p>}
                        </div>

                        {/* Charges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('Making Charge')} ({isBn ? '৳' : 'BDT'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.making_charge ?? ''}
                                    onChange={(e) => handleFieldChange('making_charge', e.target.value)}
                                    onFocus={handleNumberFocus}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('Tax / VAT')} ({isBn ? '৳' : 'BDT'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.vat_amount ?? ''}
                                    onChange={(e) => handleFieldChange('vat_amount', e.target.value)}
                                    onFocus={handleNumberFocus}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('Hallmark Charge')} ({isBn ? '৳' : 'BDT'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.hallmark_charge ?? ''}
                                    onChange={(e) => handleFieldChange('hallmark_charge', e.target.value)}
                                    onFocus={handleNumberFocus}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('Stone Charge')} ({isBn ? '৳' : 'BDT'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.stone_charge ?? ''}
                                    onChange={(e) => handleFieldChange('stone_charge', e.target.value)}
                                    onFocus={handleNumberFocus}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>
                        </div>

                        {/* Description & Photo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Product Description')} <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.product_description}
                                    onChange={(e) => setData('product_description', e.target.value)}
                                    placeholder={t('Item specifications, engraving, polish, stone settings...')}
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                />
                                {errors.product_description && <p className="text-xs text-rose-500 mt-1">{errors.product_description}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    {t('Reference Photo')}
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex flex-col items-center justify-center h-[86px] border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#b17633] hover:bg-amber-50/30 transition-all">
                                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-500 font-medium">{t('Upload Photo')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>

                                    {imagePreview && (
                                        <div className="relative w-[86px] h-[86px] rounded-xl overflow-hidden border border-gray-200 shadow-xs shrink-0 group">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                                                title="Remove photo"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Order Financials & Advance */}
                        <div className="bg-amber-50/30 p-4 sm:p-5 rounded-2xl border border-amber-100/80 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    {t('Grand Total')} ({isBn ? '৳' : 'BDT'}) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.estimated_amount ?? ''}
                                    onChange={(e) => setData('estimated_amount', cleanNumber(e.target.value))}
                                    onFocus={handleNumberFocus}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                />
                                {errors.estimated_amount && <p className="text-xs text-rose-500 mt-1">{errors.estimated_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    {t('Paid Amount')} ({isBn ? '৳' : 'BDT'})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={data.advance_amount ?? ''}
                                    onChange={(e) => setData('advance_amount', cleanNumber(e.target.value))}
                                    onFocus={handleNumberFocus}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 bg-white focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                />
                                {errors.advance_amount && <p className="text-xs text-rose-500 mt-1">{errors.advance_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    {t('Due Amount')}
                                </label>
                                <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-rose-600 flex items-center h-[38px]">
                                    {isBn ? '৳ ' : 'BDT '} {isBn ? toBn(fmtBDT(calculatedDue)) : fmtBDT(calculatedDue)}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('orders.index')}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                {t('Cancel')}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-7 py-2.5 text-white rounded-xl text-sm font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-4 h-4" />
                                {processing ? t('Saving...') : t('Save Changes')}
                            </button>
                        </div>

                    </div>
                </form>
            </div>

            {/* Customer Creation Modal (React Portal) */}
            {showCustomerModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-100 text-left my-8">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-amber-600 via-[#b17633] to-orange-600 text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{t('Add Customer')}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCustomerModal(false)}
                                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleQuickCustomerSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('Customer Name')} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            value={customerForm.name}
                                            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                                            placeholder={t('Enter contact name')}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                        />
                                    </div>
                                    {customerErrors.name && <p className="text-xs text-rose-500 mt-1">{customerErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('Phone')} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            value={customerForm.phone}
                                            onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                            placeholder="01700000000"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                        />
                                    </div>
                                    {customerErrors.phone && <p className="text-xs text-rose-500 mt-1">{customerErrors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('Opening Balance')} ({isBn ? '৳' : 'BDT'})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={customerForm.opening_balance}
                                        onFocus={handleNumberFocus}
                                        onChange={(e) => setCustomerForm({ ...customerForm, opening_balance: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('Credit Limit')} ({isBn ? '৳' : 'BDT'})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={customerForm.credit_limit}
                                        onFocus={handleNumberFocus}
                                        onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('Email')}
                                    </label>
                                    <input
                                        type="email"
                                        value={customerForm.email}
                                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                        placeholder="customer@email.com"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('NID / Passport')}
                                    </label>
                                    <input
                                        type="text"
                                        value={customerForm.nid_number}
                                        onChange={(e) => setCustomerForm({ ...customerForm, nid_number: e.target.value })}
                                        placeholder="NID / Passport #"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('Address')}
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={customerForm.address}
                                        onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                                        placeholder={t('Full address...')}
                                        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerModal(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingCustomer}
                                    style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                    className="px-6 py-2 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {isSavingCustomer ? t('Saving...') : t('Save Customer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Product Creation Modal (React Portal) */}
            {showProductModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 text-left my-8">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-amber-600 via-[#b17633] to-orange-600 text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <PackagePlus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{t('Add Product')}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Layout */}
                        <form onSubmit={handleQuickProductSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        {t('Product Name')} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        placeholder="e.g. 22K Gold Bridal Necklace"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    />
                                    {productErrors['products.0.name'] && <p className="text-xs text-rose-500 mt-1">{productErrors['products.0.name']}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        {t('Barcode')}
                                    </label>
                                    <div className="relative">
                                        <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={productForm.barcode}
                                            onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                                            placeholder="# Scan or type..."
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        {t('Category')} <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    >
                                        <option value="">{t('Select Category')}</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        {t('Metal')} <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={productForm.metal_type}
                                        onChange={(e) => setProductForm({ ...productForm, metal_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    >
                                        <option value="gold">{t('Gold')}</option>
                                        <option value="silver">{t('Silver')}</option>
                                        <option value="platinum">{t('Platinum')}</option>
                                        <option value="diamond">{t('Diamond')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        {t('Purity')} <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={productForm.purity_id}
                                        onChange={(e) => setProductForm({ ...productForm, purity_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#b17633]/20 focus:border-[#b17633]"
                                    >
                                        <option value="">{t('Select Purity')}</option>
                                        {purities.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">{t('Gross Wt')}</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={productForm.gross_weight}
                                        onFocus={handleNumberFocus}
                                        onChange={(e) => setProductForm({ ...productForm, gross_weight: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowProductModal(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingProduct}
                                    style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                    className="px-6 py-2 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {isSavingProduct ? t('Saving...') : t('Add Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
