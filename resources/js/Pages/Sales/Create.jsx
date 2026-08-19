import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import axios from 'axios';
import { 
    ShoppingBag, Plus, Trash2, ArrowLeft, Save, UserPlus, Calculator, 
    Search, Image as ImageIcon, X, PackagePlus, Check, Gem, Sparkles, Filter,
    Scale, CreditCard, Coins, CheckCircle2, ShieldCheck, Printer
} from 'lucide-react';
import Modal from '@/Components/Modal';

export default function Create({ customers = [], products = [], branches = [], autoInvoiceNo, defaultVatRate = 5 }) {
    // Local state for dynamic customer & product lists (allowing inline pop-up additions)
    const [customerList, setCustomerList] = useState(customers);
    const [productList, setProductList] = useState(products);

    // Pop-up modal states
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);

    // Product Grid Search & Filter states
    const [productSearch, setProductSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Inline Customer Form State (Full Form)
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        nid_number: '',
        opening_balance: '',
        credit_limit: '',
        type: 'Retail',
        address: '',
    });

    // Inline Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        purity_name: '22K Gold',
        gross_weight: '',
        stone_weight: '0',
        selling_price: '',
        making_charge: '0',
    });

    const { data, setData, post, processing, errors } = useForm({
        customer_id: customers.length > 0 ? customers[0].id : '',
        branch_id: branches.length > 0 ? branches[0].id : '',
        invoice_no: autoInvoiceNo || `INV-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        sale_date: new Date().toISOString().split('T')[0],
        sale_type: 'retail',
        items: [
            {
                product_id: '',
                gross_weight: '',
                stone_weight: 0,
                net_weight: '',
                rate_per_gram: '',
                making_charge: 0,
                stone_charge: 0,
                quantity: 1,
                total_amount: 0,
            }
        ],
        subtotal: 0,
        discount: 0,
        vat_percent: defaultVatRate,
        tax: 0,
        old_gold_exchange_value: 0,
        grand_total: 0,
        paid_amount: 0,
    });

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                product_id: '',
                gross_weight: '',
                stone_weight: 0,
                net_weight: '',
                rate_per_gram: '',
                making_charge: 0,
                stone_charge: 0,
                quantity: 1,
                total_amount: 0,
            }
        ]);
    };

    const addProductToSale = (prod) => {
        const gross = Number(prod.gross_weight || prod.weight || 10);
        const stone = Number(prod.stone_weight || 0);
        const net = Math.max(0, gross - stone);
        const rate = Number(prod.selling_price || 11500);
        const making = Number(prod.making_charge || 0);
        const total = (net * rate) + making;

        const newItem = {
            product_id: prod.id,
            gross_weight: gross,
            stone_weight: stone,
            net_weight: net,
            rate_per_gram: rate,
            making_charge: making,
            stone_charge: Number(prod.stone_charge || 0),
            quantity: 1,
            total_amount: total,
        };

        if (data.items.length === 1 && !data.items[0].product_id) {
            setData('items', [newItem]);
        } else {
            setData('items', [...data.items, newItem]);
        }
    };

    const removeItem = (index) => {
        if (data.items.length === 1) {
            setData('items', [{
                product_id: '',
                gross_weight: '',
                stone_weight: 0,
                net_weight: '',
                rate_per_gram: '',
                making_charge: 0,
                stone_charge: 0,
                quantity: 1,
                total_amount: 0,
            }]);
            return;
        }
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const handleProductSelect = (index, productId) => {
        const prod = productList.find(p => p.id === Number(productId));
        const newItems = [...data.items];

        if (prod) {
            const gross = Number(prod.gross_weight || prod.weight || 0);
            const stone = Number(prod.stone_weight || 0);
            const net = Math.max(0, gross - stone);
            const rate = Number(prod.selling_price || 0);
            const making = Number(prod.making_charge || 0);
            const total = (net * rate) + making;

            newItems[index] = {
                ...newItems[index],
                product_id: prod.id,
                gross_weight: gross,
                stone_weight: stone,
                net_weight: net,
                rate_per_gram: rate,
                making_charge: making,
                stone_charge: prod.stone_charge || 0,
                quantity: 1,
                total_amount: total,
            };
        } else {
            newItems[index].product_id = '';
        }

        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;

        const gross = Number(newItems[index].gross_weight || 0);
        const stone = Number(newItems[index].stone_weight || 0);
        const net = Math.max(0, gross - stone);
        newItems[index].net_weight = net;

        const rate = Number(newItems[index].rate_per_gram || 0);
        const making = Number(newItems[index].making_charge || 0);
        const stoneChg = Number(newItems[index].stone_charge || 0);
        const qty = Number(newItems[index].quantity || 1);

        newItems[index].total_amount = ((net * rate) + making + stoneChg) * qty;

        setData('items', newItems);
    };

    // Calculate subtotal, VAT Amount (from vat_percent), and grand total
    useEffect(() => {
        const sub = data.items.reduce((acc, item) => acc + Number(item.total_amount || 0), 0);
        const disc = Number(data.discount || 0);
        const vatPct = Number(data.vat_percent || 0);
        const oldGold = Number(data.old_gold_exchange_value || 0);
        
        const taxVal = Math.max(0, (sub - disc) * (vatPct / 100));
        const grand = Math.max(0, sub - disc + taxVal - oldGold);

        setData(prev => ({
            ...prev,
            subtotal: sub,
            tax: taxVal,
            grand_total: grand,
            paid_amount: prev.paid_amount || grand,
        }));
    }, [JSON.stringify(data.items), data.discount, data.vat_percent, data.old_gold_exchange_value]);

    // Handle Quick Add Customer Submit
    const handleAddCustomerSubmit = (e) => {
        e.preventDefault();
        if (!newCustomer.name) return;

        axios.post(route('customers.store'), newCustomer)
            .then(res => {
                if (res.data.success && res.data.customer) {
                    const created = res.data.customer;
                    setCustomerList(prev => [created, ...prev]);
                    setData('customer_id', created.id);
                    setNewCustomer({ name: '', phone: '', email: '', nid_number: '', opening_balance: '', credit_limit: '', type: 'Retail', address: '' });
                    setIsCustomerModalOpen(false);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Failed to save customer. Please check the fields and try again.');
            });
    };

    // Handle Quick Add Product Submit
    const handleAddProductSubmit = (e) => {
        e.preventDefault();
        if (!newProduct.name) return;

        axios.post(route('products.store'), {
            products: [{
                name: newProduct.name,
                sku: newProduct.sku || `PROD-${Math.floor(100 + Math.random() * 900)}`,
                category_id: 1, // Fallback default
                metal_type: 'gold', 
                purity_id: 1, 
                gross_weight: parseFloat(newProduct.gross_weight || 10),
                stone_weight: parseFloat(newProduct.stone_weight || 0),
                rate_per_vori: (parseFloat(newProduct.selling_price || 11500) * 11.664).toFixed(2),
                making_charge_type: 'fixed',
                making_charge_value: parseFloat(newProduct.making_charge || 500),
                stone_charge: 0,
                vat_percentage: 5,
                wastage_percentage: 0,
                unit: 'piece',
                status: 'active'
            }]
        })
        .then(res => {
            if (res.data.success && res.data.product) {
                const created = res.data.product;
                // Add legacy properties used by POS UI if they are missing
                created.selling_price = parseFloat(newProduct.selling_price || 11500);
                created.purity = { name: newProduct.purity_name };
                
                setProductList(prev => [created, ...prev]);
                addProductToSale(created);
                setNewProduct({ name: '', sku: '', purity_name: '22K Gold', gross_weight: '', stone_weight: '0', selling_price: '', making_charge: '0' });
                setIsProductModalOpen(false);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Failed to save product. Please try again.');
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const selectedCust = customerList.find(c => c.id == data.customer_id) || { name: 'Walk-in Customer' };
        const selectedBr = branches.find(b => b.id == data.branch_id) || { name: 'Main Showroom' };

        const enrichedItems = data.items.map(it => {
            const prod = productList.find(p => p.id == it.product_id) || {};
            return {
                ...it,
                product: prod
            };
        });

        const saleSnapshot = {
            invoice_no: data.invoice_no,
            sale_date: data.sale_date,
            customer: selectedCust,
            branch: selectedBr,
            items: enrichedItems,
            subtotal: data.subtotal,
            discount: data.discount,
            tax: data.tax,
            old_gold_exchange_value: data.old_gold_exchange_value,
            grand_total: data.grand_total,
            paid_amount: data.paid_amount,
            due_amount: Math.max(0, data.grand_total - data.paid_amount)
        };

        setCompletedSale(saleSnapshot);

        post(route('sales.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsReceiptModalOpen(true);
            },
            onError: () => {
                setIsReceiptModalOpen(true);
            }
        });
    };

    const handleNewSale = () => {
        setIsReceiptModalOpen(false);
        setCompletedSale(null);
        
        const newInvoice = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

        setData({
            invoice_no: newInvoice,
            sale_date: new Date().toISOString().split('T')[0],
            branch_id: branches[0]?.id || '',
            customer_id: customerList[0]?.id || '',
            items: [{
                product_id: '',
                gross_weight: '',
                stone_weight: '0',
                net_weight: '',
                rate_per_gram: '',
                making_charge: '0',
                quantity: 1,
                total_amount: 0
            }],
            subtotal: 0,
            discount: 0,
            vat_percent: defaultVatRate || 5,
            tax: 0,
            old_gold_exchange_value: 0,
            grand_total: 0,
            paid_amount: 0
        });
    };

    // Filter products for the visual catalog
    const filteredProducts = productList.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                            (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
        const matchCat = selectedCategory === 'ALL' || (p.purity?.name && p.purity.name.includes(selectedCategory));
        return matchSearch && matchCat;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FEF9E7] p-3 rounded-xl border border-amber-200/60 shadow-sm text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-amber-700" />
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Add Sale</h2>
                            <p className="text-[11px] text-gray-500 font-medium">Issue POS multi-product sales invoice</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('sales.index')}
                            className="px-3 py-1.5 bg-white hover:bg-amber-50 border border-amber-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sales List
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Add Sale" />

            <div className="-m-6 p-4 sm:p-6 bg-[#FEF9E7] min-h-screen">
                <div className="flex flex-col xl:flex-row gap-5 pb-20 items-start">

                    {/* LEFT / MAIN COLUMN: UNIFIED ELEGANT POS INVOICE FORM (70% WIDTH) */}
                    <form onSubmit={handleSubmit} className="w-full xl:w-[70%]">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-5 space-y-4">
                            
                            {/* 1. Invoice Fields - 4 Field Single Compact Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                {/* Invoice No */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Invoice Number *</label>
                                    <input
                                        type="text"
                                        value={data.invoice_no}
                                        onChange={(e) => setData('invoice_no', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-xs font-bold text-gray-900 py-1.5"
                                        required
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Sale Date *</label>
                                    <input
                                        type="date"
                                        value={data.sale_date}
                                        onChange={(e) => setData('sale_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-xs py-1.5 font-medium"
                                        required
                                    />
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Branch *</label>
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => setData('branch_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-xs py-1.5 font-medium"
                                        required
                                    >
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Customer Select + Add Customer Icon Button */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Customer *</label>
                                    <div className="flex items-center gap-1.5">
                                        <select
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-xs py-1.5 font-medium"
                                            required
                                        >
                                            <option value="">Select Customer</option>
                                            {customerList.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomerModalOpen(true)}
                                            className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer"
                                            title="Add New Customer Pop-Up"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Line Items Section (2-Row Per Product Selection Layout) */}
                            <div className="space-y-2.5">
                                <div className="flex justify-end items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Row
                                    </button>
                                </div>

                                {/* Product Items List (2-Row Per Item Layout) */}
                                <div className="space-y-2.5">
                                    {data.items.map((item, idx) => (
                                        <div key={idx} className="bg-amber-50/30 border border-amber-200/80 rounded-xl p-3 space-y-2 transition-all hover:border-amber-400 hover:shadow-xs">
                                            
                                            {/* ROW 1: Product Selection Dropdown & Quick Actions */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1 flex items-center gap-1.5">
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 text-xs py-1.5 font-bold text-gray-900 bg-white"
                                                        required
                                                    >
                                                        <option value="">Select Product Item *</option>
                                                        {productList.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} ({p.purity?.name || '22K'}) - ৳{Number(p.selling_price || 11500).toLocaleString()}/g</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsProductModalOpen(true)}
                                                        className="p-1.5 text-amber-700 bg-white hover:bg-amber-100 rounded-lg border border-amber-300 flex-shrink-0 cursor-pointer shadow-2xs"
                                                        title="Add New Product Pop-Up"
                                                    >
                                                        <PackagePlus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* ROW 2: Item Metrics (Gross, Net, Rate, Making, Qty, Total) in 6 Columns */}
                                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs bg-white p-2.5 rounded-lg border border-gray-200/80">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Gross (g) *</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={item.gross_weight}
                                                        onChange={(e) => handleItemChange(idx, 'gross_weight', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 focus:border-amber-500 text-xs font-semibold py-1 text-center"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Net (g)</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={item.net_weight}
                                                        readOnly
                                                        className="w-full rounded-md border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 py-1 text-center"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Rate/g *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.rate_per_gram}
                                                        onChange={(e) => handleItemChange(idx, 'rate_per_gram', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 focus:border-amber-500 text-xs font-bold py-1 text-right"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Making (BDT)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.making_charge}
                                                        onChange={(e) => handleItemChange(idx, 'making_charge', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 focus:border-amber-500 text-xs py-1 text-right"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Qty *</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 focus:border-amber-500 text-xs font-bold text-center py-1"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-amber-900 uppercase mb-0.5 text-right">Total (BDT)</label>
                                                    <div className="py-1 px-2 bg-amber-50 rounded-md border border-amber-200 text-right font-black text-gray-900 text-xs truncate">
                                                        ৳ {Number(item.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 0})}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Payment & Calculation Summary Section */}
                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Old Gold Exchange Value (BDT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.old_gold_exchange_value}
                                                onChange={(e) => setData('old_gold_exchange_value', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 focus:border-amber-500 text-xs font-bold text-amber-700 py-1.5"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-700 mb-1">Discount (BDT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.discount}
                                                onChange={(e) => setData('discount', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 focus:border-amber-500 text-xs font-bold text-right py-1.5"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-[#FEF9E7] p-3.5 rounded-xl border border-amber-200/90 space-y-2.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600 font-semibold">Subtotal:</span>
                                            <span className="font-bold text-gray-900">BDT {Number(data.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-700 font-bold">VAT (%):</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    value={data.vat_percent}
                                                    onChange={(e) => setData('vat_percent', e.target.value)}
                                                    className="w-16 rounded-lg border-amber-300 focus:border-amber-500 text-xs font-bold text-right py-1"
                                                />
                                                <span className="font-bold text-gray-700">%</span>
                                                <span className="text-[11px] font-bold text-gray-900 ml-1">
                                                    (BDT {Number(data.tax).toLocaleString('en-US', {minimumFractionDigits: 2})})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-t border-amber-200 pt-2 text-sm font-black text-amber-900">
                                            <span>Grand Total:</span>
                                            <span>BDT {Number(data.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-gray-700 font-bold">Paid Amount:</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.paid_amount}
                                                onChange={(e) => setData('paid_amount', e.target.value)}
                                                className="w-28 rounded-lg border-amber-300 text-xs font-bold text-emerald-700 text-right py-1"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-rose-700 border-t border-amber-200/80 pt-1">
                                            <span>Due Balance:</span>
                                            <span>BDT {Number(Math.max(0, data.grand_total - data.paid_amount)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-black text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                                >
                                    <ShoppingBag className="w-5 h-5" /> Sale
                                </button>
                            </div>

                        </div>
                    </form>

                    {/* RIGHT COLUMN: VISUAL PRODUCT CATALOG WITH IMAGES (30% WIDTH) */}
                    <div className="w-full xl:w-[30%] space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200/90 p-4 space-y-3 sticky top-6">
                            
                            {/* Search & Filter Bar */}
                            <div className="space-y-2 text-xs">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Search jewelry by name or SKU..."
                                        className="w-full pl-8 text-xs rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 py-1.5"
                                    />
                                </div>

                                {/* Category Filter Chips */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
                                    {['ALL', '22K', '21K', '18K', 'Silver'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                                                selectedCategory === cat
                                                    ? 'bg-amber-600 text-white shadow-xs'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Grid Cards */}
                            <div className="grid grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                                {filteredProducts.length === 0 ? (
                                    <div className="col-span-2 py-8 text-center text-gray-400 text-xs font-medium">
                                        No products found matching "{productSearch}"
                                    </div>
                                ) : (
                                    filteredProducts.map(prod => (
                                        <div
                                            key={prod.id}
                                            onClick={() => addProductToSale(prod)}
                                            className="bg-white rounded-lg border border-gray-200 p-2.5 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                        >
                                            {/* Product Image / Placeholder Graphic */}
                                            <div className="h-24 w-full bg-gradient-to-br from-amber-100/70 via-amber-50 to-yellow-100/60 rounded-md overflow-hidden flex items-center justify-center relative border border-amber-200/50">
                                                {prod.image ? (
                                                    <img 
                                                        src={prod.image} 
                                                        alt={prod.name} 
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center text-amber-800">
                                                        <Gem className="w-7 h-7 text-amber-600 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[9px] font-black text-amber-900 mt-1 uppercase tracking-wider">
                                                            {prod.purity?.name || '22K Gold'}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <span className="absolute top-1 right-1 bg-amber-900 text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                                    {prod.purity?.name || '22K'}
                                                </span>
                                            </div>

                                            {/* Product Info */}
                                            <div className="mt-2 text-xs space-y-1">
                                                <h4 className="font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors leading-tight">
                                                    {prod.name}
                                                </h4>
                                                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                                                    <span>Wt: {prod.gross_weight || prod.weight || 10}g</span>
                                                    <span>SKU: {prod.sku || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                                    <span className="font-black text-amber-900 text-xs">
                                                        ৳ {Number(prod.selling_price || 11500).toLocaleString()}
                                                    </span>
                                                    <span className="p-1 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white text-amber-700 rounded transition-colors">
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* POP-UP MODAL 1: ADD CUSTOMER (FULL REGISTRATION FORM) */}
            <Modal show={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} maxWidth="2xl">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-amber-700" />
                            Add Customer
                        </h3>
                        <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleAddCustomerSubmit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Customer Full Name *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                                    placeholder="e.g. Mohammad Rahim" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Mobile / Phone Number *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                                    placeholder="017XXXXXXXX" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                                    placeholder="customer@gmail.com" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">NID / Passport Number</label>
                                <input 
                                    type="text" 
                                    value={newCustomer.nid_number}
                                    onChange={(e) => setNewCustomer({...newCustomer, nid_number: e.target.value})}
                                    placeholder="1990XXXXXXXXXXXXX" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2"
                                />
                            </div>



                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Opening Balance (BDT)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newCustomer.opening_balance}
                                    onChange={(e) => setNewCustomer({...newCustomer, opening_balance: e.target.value})}
                                    placeholder="0.00" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Credit Limit (BDT)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newCustomer.credit_limit}
                                    onChange={(e) => setNewCustomer({...newCustomer, credit_limit: e.target.value})}
                                    placeholder="50000.00" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-gray-700 mb-1">Full Address / Location</label>
                                <textarea 
                                    rows="2"
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                                    placeholder="House, Road, Area, City, District" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsCustomerModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* POP-UP MODAL 2: ADD PRODUCT (FULL FORM) */}
            <Modal show={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} maxWidth="xl">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <PackagePlus className="w-5 h-5 text-amber-700" />
                            Add Product
                        </h3>
                        <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="sm:col-span-2">
                                <label className="block font-bold text-gray-700 mb-1">Product Item Name *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    placeholder="e.g. 22K Royal Gold Bridal Necklace" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">SKU / Tag Code</label>
                                <input 
                                    type="text" 
                                    value={newProduct.sku}
                                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                                    placeholder="PROD-101" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2 font-bold"
                                />
                            </div>



                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Purity / Karat *</label>
                                <select
                                    value={newProduct.purity_name}
                                    onChange={(e) => setNewProduct({...newProduct, purity_name: e.target.value})}
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2 font-bold"
                                >
                                    <option value="22K Gold">22K Gold (91.6% Pure)</option>
                                    <option value="21K Gold">21K Gold (87.5% Pure)</option>
                                    <option value="18K Gold">18K Gold (75.0% Pure)</option>
                                    <option value="Silver">Silver (92.5% Pure)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Gross Weight (g) *</label>
                                <input 
                                    type="number" 
                                    step="0.001"
                                    required
                                    value={newProduct.gross_weight}
                                    onChange={(e) => setNewProduct({...newProduct, gross_weight: e.target.value})}
                                    placeholder="11.664" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2 font-bold text-center"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Stone Weight (g)</label>
                                <input 
                                    type="number" 
                                    step="0.001"
                                    value={newProduct.stone_weight}
                                    onChange={(e) => setNewProduct({...newProduct, stone_weight: e.target.value})}
                                    placeholder="0.000" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2 text-center"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Selling Rate/g (BDT) *</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    required
                                    value={newProduct.selling_price}
                                    onChange={(e) => setNewProduct({...newProduct, selling_price: e.target.value})}
                                    placeholder="11500" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2 font-bold text-right"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Making Charge (BDT)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newProduct.making_charge}
                                    onChange={(e) => setNewProduct({...newProduct, making_charge: e.target.value})}
                                    placeholder="2000" 
                                    className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 py-2 text-right"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── INVOICE POP-UP MODAL UPON CLICKING SALE ── */}
            {isReceiptModalOpen && completedSale && (
                <Modal show={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} maxWidth="md">
                    <div className="p-6 bg-white rounded-3xl text-gray-900 space-y-4 font-sans border border-amber-200">
                        
                        {/* Modal Action Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3.5 no-print">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-amber-700" />
                                <div>
                                    <h3 className="text-base font-black text-gray-900 uppercase">
                                        Invoice #{completedSale.invoice_no}
                                    </h3>
                                    <p className="text-[11px] text-emerald-700 font-bold">Transaction completed successfully</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsReceiptModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Printable Mini Thermal POS Receipt Slip */}
                        <div className="flex justify-center bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-inner max-h-[60vh] overflow-y-auto">
                            <div className="mini-pos-receipt w-[80mm] max-w-[80mm] bg-white p-4 shadow-md rounded-xl border border-gray-300 text-xs font-mono text-gray-900 space-y-2.5">
                                
                                {/* 1. Header & Store Info */}
                                <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-gray-400">
                                    <div className="flex justify-center items-center gap-1">
                                        <Gem className="w-4 h-4 text-amber-700" />
                                        <h1 className="font-black text-sm uppercase tracking-wider text-gray-900">ROYAL JEWELRY ERP</h1>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-700 uppercase">{completedSale.branch?.name || 'MAIN SHOWROOM'}</p>
                                    <p className="text-[10px] text-gray-600">Mob: +880 1700-000000</p>
                                    <div className="pt-0.5">
                                        <span className="bg-gray-900 text-white px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                                            CASH RECEIPT MEMO
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Transaction Meta Info */}
                                <div className="text-[10px] space-y-0.5 border-b border-dashed border-gray-400 pb-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">INV NO:</span>
                                        <span className="font-bold text-gray-900">{completedSale.invoice_no}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">DATE:</span>
                                        <span>{new Date(completedSale.sale_date || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">CUSTOMER:</span>
                                        <span className="font-bold">{completedSale.customer?.name || 'Walk-in Customer'}</span>
                                    </div>
                                    {completedSale.customer?.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">PHONE:</span>
                                            <span>{completedSale.customer.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Itemized Jewelry Table */}
                                <div className="space-y-2 border-b-2 border-dashed border-gray-400 pb-2.5">
                                    <div className="grid grid-cols-12 font-bold border-b border-gray-300 pb-1 text-[9px] uppercase text-gray-700">
                                        <span className="col-span-6">ITEM</span>
                                        <span className="col-span-2 text-center">QTY</span>
                                        <span className="col-span-4 text-right">TOTAL</span>
                                    </div>

                                    {completedSale.items?.map((item, idx) => (
                                        <div key={idx} className="space-y-0.5 text-[10px]">
                                            <div className="font-bold text-gray-900">
                                                {item.product?.name || 'Gold Product'}
                                                <span className="ml-1 text-[8px] bg-gray-100 text-gray-800 px-1 rounded border border-gray-300">
                                                    {item.product?.purity?.name || '22K'}
                                                </span>
                                            </div>
                                            <div className="text-[9px] text-gray-600">
                                                Net: {Number(item.net_weight || 0).toFixed(3)}g | Rate: ৳{Number(item.rate_per_gram || 0).toLocaleString()}
                                            </div>
                                            <div className="grid grid-cols-12 text-[9px] text-gray-700">
                                                <span className="col-span-6 text-gray-500">
                                                    Mk: ৳{Number(item.making_charge || 0).toLocaleString()}
                                                </span>
                                                <span className="col-span-2 text-center font-bold">{item.quantity || 1}</span>
                                                <span className="col-span-4 text-right font-bold text-gray-900">
                                                    ৳{Number(item.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 4. Mini POS Financial Totals */}
                                <div className="space-y-1 text-[10px] border-b-2 border-dashed border-gray-400 pb-2.5">
                                    <div className="flex justify-between text-gray-600">
                                        <span>SUBTOTAL:</span>
                                        <span className="font-bold text-gray-900">৳{Number(completedSale.subtotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                    {Number(completedSale.discount || 0) > 0 && (
                                        <div className="flex justify-between text-rose-700 font-semibold">
                                            <span>DISCOUNT:</span>
                                            <span>-৳{Number(completedSale.discount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    )}
                                    {Number(completedSale.tax || 0) > 0 && (
                                        <div className="flex justify-between text-gray-800">
                                            <span>VAT / TAX:</span>
                                            <span>+৳{Number(completedSale.tax).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    )}
                                    {Number(completedSale.old_gold_exchange_value || 0) > 0 && (
                                        <div className="flex justify-between text-amber-800 font-semibold">
                                            <span>OLD GOLD EXCH:</span>
                                            <span>-৳{Number(completedSale.old_gold_exchange_value).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xs font-black text-gray-900 border-t-2 border-black pt-1 pb-0.5">
                                        <span>GRAND TOTAL:</span>
                                        <span>৳{Number(completedSale.grand_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>

                                    <div className="flex justify-between font-bold text-emerald-800">
                                        <span>PAID AMOUNT:</span>
                                        <span>৳{Number(completedSale.paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>

                                    {completedSale.due_amount > 0 ? (
                                        <div className="flex justify-between font-bold text-rose-700 text-[10px] border-t border-rose-200 pt-0.5">
                                            <span>DUE BALANCE:</span>
                                            <span>৳{completedSale.due_amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center font-black text-emerald-800 text-[9px] uppercase bg-emerald-50 py-0.5 rounded border border-emerald-200 mt-0.5">
                                            *** PAID IN FULL ***
                                        </div>
                                    )}
                                </div>

                                {/* 5. Barcode & Footer Note */}
                                <div className="text-center pt-1 space-y-1">
                                    <div className="font-mono text-xs font-black tracking-widest text-gray-800">
                                        |||| | ||| || |||| | |||
                                    </div>
                                    <div className="text-[8px] text-gray-600">
                                        THANK YOU FOR YOUR PURCHASE!
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Action Controls: Print or Back (for new sale) */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100 no-print">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button
                                type="button"
                                onClick={handleNewSale}
                                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back (For New Sale)
                            </button>
                        </div>

                    </div>
                </Modal>
            )}

        </AuthenticatedLayout>
    );
}
