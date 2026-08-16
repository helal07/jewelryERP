import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
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

export default function Create({ customers: initialCustomers, purities, branches, products: initialProducts, categories, suppliers: initialSuppliers }) {
    const { t } = useLanguage();

    const [customers, setCustomers] = useState(initialCustomers || []);
    const [products, setProducts] = useState(initialProducts || []);
    const [suppliers, setSuppliers] = useState(initialSuppliers || []);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Modal States
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

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
    const handleWeightCalcChange = (field, value) => {
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

    const handleFieldChange = (field, value) => {
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
                alert('Customer Save Error: ' + err.response.data.message);
            } else {
                alert('Failed to save customer. Please check inputs.');
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
                
                // Auto-fill order form with new product specs
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
                alert('Failed to add product. Please check inputs.');
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
                            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl shadow-xs hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="h-6 w-6" style={{ color: 'rgb(177,118,51)' }} />
                                {t('newOrder') || 'New Order'}
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="New Order" />

            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* Unified Single Section Container */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-sm space-y-6">
                        
                        {/* Order & Customer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Branch */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Branch <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => setData('branch_id', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="">Select Branch</option>
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
                                    Customer <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex-1">
                                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <select
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">Select Customer</option>
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
                                        className="p-2 border rounded-xl shadow-xs transition-all shrink-0 hover:opacity-90 active:opacity-100 cursor-pointer"
                                        style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.3)' }}
                                        title="Add Customer"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                {errors.customer_id && <p className="text-xs text-rose-500 mt-1">{errors.customer_id}</p>}
                            </div>

                            {/* Order Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Order Date <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={data.order_date}
                                        onChange={(e) => setData('order_date', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                {errors.order_date && <p className="text-xs text-rose-500 mt-1">{errors.order_date}</p>}
                            </div>

                            {/* Delivery Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Delivery Date
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={data.delivery_date}
                                        onChange={(e) => setData('delivery_date', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                                    {selectedCustomer.phone && <span className="text-gray-600">Tel: {selectedCustomer.phone}</span>}
                                    {selectedCustomer.address && <span className="text-gray-500">| {selectedCustomer.address}</span>}
                                </div>
                                {selectedCustomer.due_balance !== undefined && (
                                    <div className="font-semibold">
                                        <span className="text-gray-500 mr-1">Due:</span>
                                        <span className={Number(selectedCustomer.due_balance) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                            ৳{Number(selectedCustomer.due_balance).toLocaleString()}
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
                                    Select Product
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex-1">
                                        <Package className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <select
                                            value={data.product_id}
                                            onChange={(e) => handleProductSelect(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">Select Existing Product</option>
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
                                        className="p-2 border rounded-xl shadow-xs transition-all shrink-0 hover:opacity-90 active:opacity-100 cursor-pointer"
                                        style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.3)' }}
                                        title="Add New Product"
                                    >
                                        <PackagePlus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    value={data.product_name}
                                    onChange={(e) => setData('product_name', e.target.value)}
                                    placeholder="e.g. 22K Gold Bridal Bangle"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Category
                                </label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                                    Metal Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.metal_type}
                                    onChange={(e) => setData('metal_type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="Gold">Gold</option>
                                    <option value="Silver">Silver</option>
                                    <option value="Platinum">Platinum</option>
                                    <option value="Diamond">Diamond</option>
                                </select>
                            </div>

                            {/* Purity */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Purity <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.purity_id}
                                    onChange={(e) => setData('purity_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">Select Purity</option>
                                    {purities.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.percentage}%)</option>
                                    ))}
                                </select>
                                {errors.purity_id && <p className="text-xs text-rose-500 mt-1">{errors.purity_id}</p>}
                            </div>

                            {/* Rate / Vori */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Rate / Vori
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.rate_per_vori}
                                    onChange={(e) => handleFieldChange('rate_per_vori', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-amber-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>
                        </div>

                        {/* Weight in Vori, Ana, Roti, Point and Grams */}
                        <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-200/80">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Vori</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={data.vori}
                                        onChange={(e) => handleWeightCalcChange('vori', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Ana</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="15"
                                        value={data.ana}
                                        onChange={(e) => handleWeightCalcChange('ana', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Roti</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="5"
                                        value={data.roti}
                                        onChange={(e) => handleWeightCalcChange('roti', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Point</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="9"
                                        value={data.point}
                                        onChange={(e) => handleWeightCalcChange('point', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold text-amber-900 mb-1">
                                        Weight (g) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={data.estimated_weight}
                                        onChange={(e) => setData('estimated_weight', e.target.value)}
                                        placeholder="0.000"
                                        className="w-full px-3 py-2 border border-amber-300 rounded-xl text-sm font-bold text-gray-900 bg-amber-50/50 focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                            </div>
                            {errors.estimated_weight && <p className="text-xs text-rose-500 mt-1">{errors.estimated_weight}</p>}
                        </div>

                        {/* Charges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Making Charge
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.making_charge}
                                    onChange={(e) => handleFieldChange('making_charge', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    VAT Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.vat_amount}
                                    onChange={(e) => handleFieldChange('vat_amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Hallmark Charge
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.hallmark_charge}
                                    onChange={(e) => handleFieldChange('hallmark_charge', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Stone Charge
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.stone_charge}
                                    onChange={(e) => handleFieldChange('stone_charge', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                                />
                            </div>
                        </div>

                        {/* Description & Photo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Product Description <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.product_description}
                                    onChange={(e) => setData('product_description', e.target.value)}
                                    placeholder="Item specifications, engraving, polish, stone settings..."
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {errors.product_description && <p className="text-xs text-rose-500 mt-1">{errors.product_description}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Reference Photo
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex flex-col items-center justify-center h-[86px] border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all">
                                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-500 font-medium">Upload photo</span>
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
                                                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
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
                                    Estimated Total <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.estimated_amount}
                                    onChange={(e) => setData('estimated_amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {errors.estimated_amount && <p className="text-xs text-rose-500 mt-1">{errors.estimated_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Advance Paid
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.advance_amount}
                                    onChange={(e) => setData('advance_amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {errors.advance_amount && <p className="text-xs text-rose-500 mt-1">{errors.advance_amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Due Balance
                                </label>
                                <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-rose-600 flex items-center h-[38px]">
                                    ৳{calculatedDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href={route('orders.index')}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-7 py-2.5 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Order'}
                            </button>
                        </div>

                    </div>
                </form>
            </div>

            {/* Customer Creation Modal */}
            <Modal show={showCustomerModal} onClose={() => setShowCustomerModal(false)} maxWidth="3xl">
                <div className="p-6 text-left space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar bg-white rounded-2xl">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)' }}>
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Customer</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCustomerModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleQuickCustomerSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Contact Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={customerForm.name}
                                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                                        placeholder="Enter contact name"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                {customerErrors.name && <p className="text-xs text-rose-500 mt-1">{customerErrors.name}</p>}
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Contact Number <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={customerForm.phone}
                                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                                        placeholder="Enter contact number"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                {customerErrors.phone && <p className="text-xs text-rose-500 mt-1">{customerErrors.phone}</p>}
                            </div>

                            {/* Opening Balance */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Opening Balance (BDT)
                                </label>
                                <div className="relative">
                                    <span className="text-gray-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">BDT</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={customerForm.opening_balance}
                                        onChange={(e) => setCustomerForm({ ...customerForm, opening_balance: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Credit Limit */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Credit Limit (BDT)
                                </label>
                                <div className="relative">
                                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={customerForm.credit_limit}
                                        onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={customerForm.email}
                                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                    placeholder="Optional email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            {/* NID / Passport No */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    NID / Passport No
                                </label>
                                <div className="relative">
                                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={customerForm.nid_number}
                                        onChange={(e) => setCustomerForm({ ...customerForm, nid_number: e.target.value })}
                                        placeholder="National ID or Passport"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Full Address
                                </label>
                                <textarea
                                    rows="2"
                                    value={customerForm.address}
                                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                                    placeholder="Full address (Optional)"
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {customerErrors.address && <p className="text-xs text-rose-500 mt-1">{customerErrors.address}</p>}
                            </div>

                            {/* Photo Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Customer Photo
                                </label>
                                <div className="flex items-center gap-4">
                                    {customerPhotoPreview && (
                                        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300 shrink-0">
                                            <img src={customerPhotoPreview} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCustomerPhotoChange}
                                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 sticky bottom-0 bg-white z-10">
                            <button
                                type="button"
                                onClick={() => setShowCustomerModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingCustomer}
                                className="px-6 py-2 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-all hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-3.5 h-3.5" />
                                {isSavingCustomer ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Product Creation Modal */}
            <Modal show={showProductModal} onClose={() => setShowProductModal(false)} maxWidth="5xl">
                <div className="p-6 text-left space-y-5 bg-white rounded-2xl max-h-[88vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'rgba(177,118,51,0.1)', color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.3)' }}>
                                <PackagePlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Product</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowProductModal(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Layout */}
                    <form onSubmit={handleQuickProductSubmit} className="space-y-5">
                        <div className="bg-[#FFFDF7] rounded-2xl border border-amber-200/80 p-5 space-y-4">
                            
                            {/* Row 1: Product Name | Barcode */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        Product Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        placeholder="e.g. 22K Gold Bridal Necklace"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    {productErrors['products.0.name'] && <p className="text-xs text-rose-500 mt-1">{productErrors['products.0.name']}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        Barcode / Code
                                    </label>
                                    <div className="relative">
                                        <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={productForm.barcode}
                                            onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                                            placeholder="# Scan or type..."
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Category | Supplier | Metal Type | Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        Category <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        Supplier / Brand
                                    </label>
                                    <div className="flex gap-1.5">
                                        <select
                                            value={productForm.supplier_id}
                                            onChange={(e) => setProductForm({ ...productForm, supplier_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">Select Supplier</option>
                                            {suppliers.map((sup) => (
                                                <option key={sup.id} value={sup.id}>{sup.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="px-2.5 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-300 hover:bg-amber-100"
                                            title="Supplier"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        Metal Type <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={productForm.metal_type}
                                        onChange={(e) => setProductForm({ ...productForm, metal_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="gold">Gold</option>
                                        <option value="silver">Silver</option>
                                        <option value="platinum">Platinum</option>
                                        <option value="diamond">Diamond</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={productForm.date}
                                        onChange={(e) => setProductForm({ ...productForm, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Stock Type | Rate / Vori */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">Stock Type</label>
                                    <select
                                        value={productForm.stock_type}
                                        onChange={(e) => setProductForm({ ...productForm, stock_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        <option value="ready_stock">Ready Stock</option>
                                        <option value="order_stock">Order Stock</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1">Rate / Vori</label>
                                    <div className="relative">
                                        <span className="text-gray-400 font-medium text-xs absolute left-3 top-1/2 -translate-y-1/2">BDT</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={productForm.rate_per_vori}
                                            onChange={(e) => setProductForm({ ...productForm, rate_per_vori: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Weight Calculator Box & Charges / Photo */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                                {/* Left Box: Weight Calculator */}
                                <div className="lg:col-span-6 bg-white p-4 rounded-xl border border-amber-200/90 shadow-xs space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                                        <Calculator className="w-4 h-4 text-amber-600" />
                                        Weight Calculator
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">VORI</label>
                                            <input
                                                type="number"
                                                value={productForm.vori}
                                                onChange={(e) => handleProductVoriCalcChange('vori', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 border border-amber-200 rounded-lg text-sm bg-white font-semibold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">ANA</label>
                                            <input
                                                type="number"
                                                value={productForm.ana}
                                                onChange={(e) => handleProductVoriCalcChange('ana', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 border border-amber-200 rounded-lg text-sm bg-white font-semibold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">ROTI</label>
                                            <input
                                                type="number"
                                                value={productForm.roti}
                                                onChange={(e) => handleProductVoriCalcChange('roti', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 border border-amber-200 rounded-lg text-sm bg-white font-semibold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 mb-1">POINT</label>
                                            <input
                                                type="number"
                                                value={productForm.point}
                                                onChange={(e) => handleProductVoriCalcChange('point', e.target.value)}
                                                placeholder="0"
                                                className="w-full px-2 py-1.5 border border-amber-200 rounded-lg text-sm bg-white font-semibold text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Grid: Weight In Gm, VAT %, M.C Type, Mk. Charge, Photo */}
                                <div className="lg:col-span-6 grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                                            Weight In Gm <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            required
                                            value={productForm.gross_weight}
                                            onChange={(e) => setProductForm({ ...productForm, gross_weight: e.target.value })}
                                            placeholder="0.000"
                                            className="w-full px-3 py-1.5 border border-amber-300 bg-amber-50/50 rounded-xl text-sm font-bold text-gray-900"
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-800 mb-1">VAT %</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={productForm.vat_percentage}
                                                onChange={(e) => setProductForm({ ...productForm, vat_percentage: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full pr-7 pl-3 py-1.5 border border-gray-200 rounded-xl text-sm bg-white"
                                            />
                                            <span className="text-gray-400 font-bold text-xs absolute right-2.5 top-1/2 -translate-y-1/2">%</span>
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-800 mb-1">M.C Type</label>
                                        <select
                                            value={productForm.making_charge_type}
                                            onChange={(e) => setProductForm({ ...productForm, making_charge_type: e.target.value })}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-xl text-xs bg-white font-semibold"
                                        >
                                            <option value="per_gram">Per Gram</option>
                                            <option value="fixed">Fixed</option>
                                        </select>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                                            Mk. Charge <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={productForm.making_charge_value}
                                            onChange={(e) => setProductForm({ ...productForm, making_charge_value: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-sm bg-white"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-800 mb-1">Photo</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProductPhotoChange}
                                                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                                            />
                                            {productPhotoPreview && (
                                                <img src={productPhotoPreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowProductModal(false)}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingProduct}
                                className="px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Save className="w-4 h-4" />
                                {isSavingProduct ? 'Adding Product...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
