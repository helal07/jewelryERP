import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import axios from 'axios';
import { 
    Plus, Trash2, ArrowLeft, X, UserPlus, PackagePlus, ShoppingBag,
    Printer, Building2, Gem, CheckCircle2
} from 'lucide-react';
import Modal from '@/Components/Modal';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function WholesaleCreate({ customers = [], products = [], branches = [], autoInvoiceNo, latestMetalPrices = {} }) {
    const [customerList, setCustomerList] = useState(customers);
    const [productList, setProductList] = useState(products);

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);

    // Customer Adding Full Form State
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        nid_number: '',
        opening_balance: '',
        customer_type: 'wholesale',
        address: ''
    });

    // Inline Product Full Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        purity_name: '22K Gold',
        gross_weight: '',
        stone_weight: '0',
        selling_price: '',
        making_charge: '0',
        stone_charge: '0',
        stock_quantity: '1',
        description: ''
    });

    const { data, setData, post, processing, errors } = useForm({
        invoice_no: autoInvoiceNo || `WS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-0001`,
        sale_date: new Date().toISOString().split('T')[0],
        branch_id: branches[0]?.id || '',
        customer_id: customers[0]?.id || '',
        sale_type: 'wholesale',
        items: [
            {
                product_id: '',
                gross_weight: '',
                stone_weight: '0',
                net_weight: '',
                rate_per_gram: '',
                making_charge_type: 'fixed',
                making_charge: '0',
                stone_charge: '0',
                hallmark_charge: '0',
                quantity: 1,
                total_amount: 0
            }
        ],
        subtotal: 0,
        discount: 0,
        vat_type: 'percent',
        vat_rate: 5,
        tax: 0,
        total_making_charge: 0,
        total_stone_charge: 0,
        total_hallmark_charge: 0,
        grand_total: 0,
        paid_amount: 0,
        notes: ''
    });

    const recalculateAll = (itemsList, discountVal = data.discount, vatType = data.vat_type, vatRate = data.vat_rate) => {
        let newSubtotal = 0;
        let totalMk = 0;
        let totalStone = 0;
        let totalHm = 0;
        let totalNetWeight = 0;

        const updatedItems = itemsList.map(item => {
            const gross = parseFloat(item.gross_weight) || 0;
            const stone = parseFloat(item.stone_weight) || 0;
            const net = Math.max(0, gross - stone);
            const rate = parseFloat(item.rate_per_gram) || 0;
            const makingRate = parseFloat(item.making_charge) || 0;
            const makingType = item.making_charge_type || 'fixed';
            const making = makingType === 'per_gram' ? (makingRate * gross) : makingRate;
            const stoneChg = parseFloat(item.stone_charge) || 0;
            const hallmarkChg = parseFloat(item.hallmark_charge) || 0;
            const qty = parseInt(item.quantity) || 1;

            const itemTotal = ((net * rate) + making + stoneChg + hallmarkChg) * qty;

            newSubtotal += itemTotal;
            totalMk += (making * qty);
            totalStone += (stoneChg * qty);
            totalHm += (hallmarkChg * qty);
            totalNetWeight += (net * qty);

            return {
                ...item,
                net_weight: net.toFixed(3),
                total_amount: itemTotal
            };
        });

        const disc = parseFloat(discountVal) || 0;
        const vType = vatType || 'percent';
        const vRate = parseFloat(vatRate) || 0;
        const metalPrice = Math.max(0, newSubtotal - totalMk - totalStone - totalHm);

        let taxVal = 0;
        if (vType === 'percent') {
            taxVal = Math.max(0, (metalPrice - disc) * (vRate / 100));
        } else {
            const totalVori = totalNetWeight / 11.664;
            taxVal = totalVori * vRate;
        }

        const finalGrandTotal = Math.max(0, newSubtotal - disc + taxVal);

        return {
            items: updatedItems,
            subtotal: newSubtotal,
            total_making_charge: totalMk,
            total_stone_charge: totalStone,
            total_hallmark_charge: totalHm,
            tax: taxVal,
            grand_total: finalGrandTotal
        };
    };

    const handleVARPChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };
        
        const vori = parseFloat(newItems[index].weight_vori) || 0;
        const ana = parseFloat(newItems[index].weight_ana) || 0;
        const roti = parseFloat(newItems[index].weight_roti) || 0;
        const point = parseFloat(newItems[index].weight_point) || 0;

        const totalVori = vori + (ana / 16) + (roti / 96) + (point / 960);
        const grams = totalVori * 11.664;
        
        newItems[index].gross_weight = grams > 0 ? grams.toFixed(3) : '';

        const calc = recalculateAll(newItems, data.discount, data.vat_type, data.vat_rate);
        setData(prev => ({
            ...prev,
            items: calc.items,
            subtotal: calc.subtotal,
            total_making_charge: calc.total_making_charge,
            total_stone_charge: calc.total_stone_charge,
            total_hallmark_charge: calc.total_hallmark_charge,
            tax: calc.tax,
            grand_total: calc.grand_total,
            paid_amount: calc.grand_total
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };

        if (field === 'gross_weight') {
            newItems[index].weight_vori = '';
            newItems[index].weight_ana = '';
            newItems[index].weight_roti = '';
            newItems[index].weight_point = '';
        }

        if (field === 'rate_per_vori') {
            newItems[index].rate_per_gram = Number(value) / 11.664;
        }

        if (field === 'product_id') {
            const selectedProduct = productList.find(p => p.id == value);
            if (selectedProduct) {
                let ratePerGram = 0;
                if (selectedProduct.purity_id && latestMetalPrices[selectedProduct.purity_id]) {
                    ratePerGram = Number(latestMetalPrices[selectedProduct.purity_id]);
                } else if (selectedProduct.rate_per_vori) {
                    ratePerGram = Number(selectedProduct.rate_per_vori) / 11.664;
                }
                const ratePerVori = ratePerGram * 11.664;

                newItems[index].gross_weight = selectedProduct.gross_weight || '';
                newItems[index].stone_weight = selectedProduct.stone_weight || '0';
                newItems[index].rate_per_vori = ratePerVori > 0 ? ratePerVori.toFixed(2) : '';
                newItems[index].rate_per_gram = ratePerGram;
                newItems[index].making_charge = selectedProduct.making_charge || '0';
                newItems[index].stone_charge = selectedProduct.stone_charge || '0';
            }
        }

        const calc = recalculateAll(newItems, data.discount, data.vat_type, data.vat_rate);
        setData(prev => ({
            ...prev,
            items: calc.items,
            subtotal: calc.subtotal,
            total_making_charge: calc.total_making_charge,
            total_stone_charge: calc.total_stone_charge,
            total_hallmark_charge: calc.total_hallmark_charge,
            tax: calc.tax,
            grand_total: calc.grand_total,
            paid_amount: calc.grand_total
        }));
    };

    const handleDiscountChange = (val) => {
        const calc = recalculateAll(data.items, val, data.vat_type, data.vat_rate);
        setData(prev => ({
            ...prev,
            discount: val,
            subtotal: calc.subtotal,
            tax: calc.tax,
            grand_total: calc.grand_total,
            paid_amount: calc.grand_total
        }));
    };

    const handleVatChange = (field, val) => {
        const vatType = field === 'vat_type' ? val : data.vat_type;
        const vatRate = field === 'vat_rate' ? val : data.vat_rate;
        const calc = recalculateAll(data.items, data.discount, vatType, vatRate);
        setData(prev => ({
            ...prev,
            [field]: val,
            tax: calc.tax,
            grand_total: calc.grand_total,
            paid_amount: calc.grand_total
        }));
    };

    const addItemRow = () => {
        const newItems = [
            ...data.items,
            {
                product_id: '',
                gross_weight: '',
                stone_weight: '0',
                net_weight: '',
                rate_per_gram: '',
                making_charge_type: 'fixed',
                making_charge: '0',
                stone_charge: '0',
                hallmark_charge: '0',
                quantity: 1,
                total_amount: 0
            }
        ];
        const calc = recalculateAll(newItems, data.discount, data.vat_type, data.vat_rate);
        setData(prev => ({
            ...prev,
            items: calc.items,
            subtotal: calc.subtotal,
            total_making_charge: calc.total_making_charge,
            total_stone_charge: calc.total_stone_charge,
            total_hallmark_charge: calc.total_hallmark_charge,
            tax: calc.tax,
            grand_total: calc.grand_total,
            paid_amount: calc.grand_total
        }));
    };

    const removeItemRow = (index) => {
        if (data.items.length === 1) return;
        const newItems = data.items.filter((_, i) => i !== index);
        const calc = recalculateAll(newItems, data.discount, data.vat_type, data.vat_rate);
        setData(prev => ({
            ...prev,
            items: calc.items,
            subtotal: calc.subtotal,
            total_making_charge: calc.total_making_charge,
            total_stone_charge: calc.total_stone_charge,
            total_hallmark_charge: calc.total_hallmark_charge,
            tax: calc.tax,
            grand_total: calc.grand_total,
            paid_amount: calc.grand_total
        }));
    };

    const handleSaveCustomer = (e) => {
        e.preventDefault();
        axios.post(route('customers.store'), {
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            nid_number: newCustomer.nid_number,
            opening_balance: newCustomer.opening_balance || 0,
            customer_type: newCustomer.customer_type,
            address: newCustomer.address,
            branch_id: data.branch_id || 1
        }, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(res => {
            const created = res.data?.customer || res.data;
            setCustomerList(prev => [created, ...prev]);
            setData('customer_id', created.id);
            setNewCustomer({ name: '', phone: '', email: '', nid_number: '', opening_balance: '', customer_type: 'wholesale', address: '' });
            setIsCustomerModalOpen(false);
        }).catch(err => {
            alert(err.response?.data?.message || 'Error saving customer. Please check input fields.');
        });
    };

    const handleSaveProduct = (e) => {
        e.preventDefault();
        const created = {
            id: Date.now(),
            name: newProduct.name,
            sku: newProduct.sku || `PROD-${Date.now().toString().slice(-4)}`,
            gross_weight: newProduct.gross_weight,
            stone_weight: newProduct.stone_weight || '0',
            selling_price: newProduct.selling_price || 12000,
            making_charge: newProduct.making_charge || '0',
            stone_charge: newProduct.stone_charge || '0',
            stock_quantity: newProduct.stock_quantity || '1',
            description: newProduct.description || '',
            purity: { name: newProduct.purity_name }
        };

        setProductList(prev => [created, ...prev]);
        setData('items', [
            ...data.items,
            {
                product_id: created.id,
                gross_weight: created.gross_weight,
                stone_weight: created.stone_weight,
                net_weight: Math.max(0, parseFloat(created.gross_weight) - parseFloat(created.stone_weight)).toFixed(3),
                rate_per_gram: created.selling_price,
                making_charge: created.making_charge,
                quantity: parseInt(created.stock_quantity) || 1,
                total_amount: 0
            }
        ]);
        setNewProduct({
            name: '',
            sku: '',
            purity_name: '22K Gold',
            gross_weight: '',
            stone_weight: '0',
            selling_price: '',
            making_charge: '0',
            stone_charge: '0',
            stock_quantity: '1',
            description: ''
        });
        setIsProductModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const selectedCust = customerList.find(c => c.id == data.customer_id) || { name: 'Customer' };
        const selectedBr = branches.find(b => b.id == data.branch_id) || { name: 'Main Branch' };

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
            grand_total: data.grand_total,
            paid_amount: data.paid_amount,
            due_amount: Math.max(0, data.grand_total - data.paid_amount)
        };

        setCompletedSale(saleSnapshot);

        post(route('sales.wholesale.store'), {
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
        
        const newInvoice = `WS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

        setData({
            invoice_no: newInvoice,
            sale_date: new Date().toISOString().split('T')[0],
            branch_id: branches[0]?.id || '',
            customer_id: customerList[0]?.id || '',
            sale_type: 'wholesale',
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
            tax: 0,
            grand_total: 0,
            paid_amount: 0,
            notes: ''
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-amber-700" />
                        Wholesale Sale
                    </h2>
                    <Link
                        href={route('sales.wholesale')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Wholesales
                    </Link>
                </div>
            }
        >
            <Head title="Wholesale Sale" />

            {/* UNIFIED SINGLE SECTION CONTAINER */}
            <div className="max-w-7xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
                    
                    {/* Top Row: Invoice No, Customer (+ Icon), Date, Branch */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
                        <div>
                            <label className="block text-gray-700 mb-1 font-bold">Invoice #</label>
                            <input
                                type="text"
                                value={data.invoice_no}
                                onChange={(e) => setData('invoice_no', e.target.value)}
                                className="w-full rounded-xl border-amber-300 bg-amber-50/50 font-mono font-bold text-amber-900 py-2"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-gray-700 font-bold">Customer *</label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomerModalOpen(true)}
                                    className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                    title="Add Customer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <select
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                                className="w-full rounded-xl border-gray-300 py-2 font-bold"
                                required
                            >
                                {customerList.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.phone || 'Client'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1 font-bold">Date *</label>
                            <input
                                type="date"
                                value={data.sale_date}
                                onChange={(e) => setData('sale_date', e.target.value)}
                                className="w-full rounded-xl border-gray-300 py-2 font-bold"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1 font-bold">Branch *</label>
                            <select
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                className="w-full rounded-xl border-gray-300 py-2 font-bold"
                                required
                            >
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Middle Section: Items Table */}
                    <div className="space-y-3 border-t border-b border-gray-100 py-5">
                        {data.items.map((item, idx) => (
                            <div key={idx} className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs font-semibold">
                                <div className="sm:col-span-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-gray-700 font-bold">Product *</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsProductModalOpen(true)}
                                            className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                            title="Add Product"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <select
                                        value={item.product_id}
                                        onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 py-1.5 font-bold text-[10px] xl:text-xs"
                                        required
                                    >
                                        <option value="">Select Product...</option>
                                        {productList.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.purity?.name || '22K'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-gray-700 mb-1 text-[10px] uppercase">
                                        <span className="flex justify-between">
                                            <span>Wt (V-A-R-P)</span>
                                            <span className="text-amber-700">Gross | Net</span>
                                        </span>
                                    </label>
                                    <div className="flex gap-0.5">
                                        <input type="number" step="1" value={item.weight_vori||''} onChange={(e)=>handleVARPChange(idx,'weight_vori',e.target.value)} placeholder="V" className="w-[14%] rounded border-gray-300 py-1.5 text-center font-bold text-[10px] px-0.5" />
                                        <input type="number" step="1" value={item.weight_ana||''} onChange={(e)=>handleVARPChange(idx,'weight_ana',e.target.value)} placeholder="A" className="w-[14%] rounded border-gray-300 py-1.5 text-center font-bold text-[10px] px-0.5" />
                                        <input type="number" step="1" value={item.weight_roti||''} onChange={(e)=>handleVARPChange(idx,'weight_roti',e.target.value)} placeholder="R" className="w-[14%] rounded border-gray-300 py-1.5 text-center font-bold text-[10px] px-0.5" />
                                        <input type="number" step="1" value={item.weight_point||''} onChange={(e)=>handleVARPChange(idx,'weight_point',e.target.value)} placeholder="P" className="w-[14%] rounded border-gray-300 py-1.5 text-center font-bold text-[10px] px-0.5" />
                                        
                                        <input type="number" step="0.001" value={item.gross_weight} onChange={(e)=>handleItemChange(idx,'gross_weight',e.target.value)} placeholder="Gross" className="w-[22%] rounded border-amber-300 bg-amber-50 py-1.5 text-center font-black text-[10px] px-0.5" required />
                                        
                                        <input type="number" value={item.net_weight} readOnly placeholder="Net" className="w-[22%] rounded border-gray-200 bg-gray-100 py-1.5 text-center font-bold text-[10px] px-0.5" />
                                    </div>
                                </div>

                                <div className="sm:col-span-1">
                                    <label className="block text-gray-700 mb-1 text-[10px] uppercase">Rate/Vori (৳)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.rate_per_vori}
                                        onChange={(e) => handleItemChange(idx, 'rate_per_vori', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 py-1.5 text-right font-bold text-[10px] px-1"
                                        required
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-gray-700 mb-1 text-[10px] uppercase">Mk Type & Charge (৳)</label>
                                    <div className="flex gap-1">
                                        <select
                                            value={item.making_charge_type}
                                            onChange={(e) => handleItemChange(idx, 'making_charge_type', e.target.value)}
                                            className="w-1/2 rounded-xl border-gray-300 py-1.5 text-[10px] px-1"
                                        >
                                            <option value="fixed">Fixed</option>
                                            <option value="per_gram">Per/g</option>
                                        </select>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.making_charge}
                                            onChange={(e) => handleItemChange(idx, 'making_charge', e.target.value)}
                                            className="w-1/2 rounded-xl border-gray-300 py-1.5 text-right font-bold text-[10px] px-1"
                                        />
                                    </div>
                                </div>
                                
                                <div className="sm:col-span-1">
                                    <label className="block text-gray-700 mb-1 text-[10px] uppercase">Stone</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.stone_charge}
                                        onChange={(e) => handleItemChange(idx, 'stone_charge', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 py-1.5 text-right font-bold text-[10px] px-1"
                                    />
                                </div>

                                <div className="sm:col-span-1">
                                    <label className="block text-gray-700 mb-1 text-[10px] uppercase">Hallmark</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.hallmark_charge}
                                        onChange={(e) => handleItemChange(idx, 'hallmark_charge', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 py-1.5 text-right font-bold text-[10px] px-1"
                                    />
                                </div>

                                <div className="sm:col-span-1 flex flex-col items-center justify-between h-full">
                                    <label className="block text-gray-700 mb-1 text-[10px] uppercase text-center w-full">Qty</label>
                                    <div className="flex items-center gap-1 w-full justify-center">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                            className="w-full rounded-xl border-gray-300 py-1.5 text-center font-bold text-[10px] px-1"
                                            required
                                        />
                                        {data.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(idx)}
                                                className="text-rose-600 hover:text-rose-800 p-1 flex-shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addItemRow}
                            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-dashed border-amber-300 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 text-amber-700" /> Add Item
                        </button>
                    </div>

                    {/* Bottom Row: Totals & Sale Submit Button */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 text-xs font-semibold items-end pt-2">
                        <div className="sm:col-span-6 space-y-3">
                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Notes</label>
                                <input
                                    type="text"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Wholesale order notes..."
                                    className="w-full text-xs rounded-xl border-gray-300 py-2"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6 bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2.5">
                            <div className="flex justify-between text-gray-700">
                                <span>Total Metal Price:</span>
                                <span className="font-bold text-gray-900">৳ {fmtBDT(Math.max(0, data.subtotal - data.total_making_charge - data.total_stone_charge - data.total_hallmark_charge))}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <div className="flex flex-col gap-1 w-1/2">
                                    <span className="text-gray-700 font-bold">VAT On Metal:</span>
                                    <div className="flex items-center gap-1">
                                        <select 
                                            value={data.vat_type} 
                                            onChange={(e) => handleVatChange('vat_type', e.target.value)}
                                            className="w-20 rounded-md border-gray-300 text-[10px] py-1 px-1"
                                        >
                                            <option value="percent">%</option>
                                            <option value="fixed_per_vori">Fixed/Vori</option>
                                        </select>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.vat_rate}
                                            onChange={(e) => handleVatChange('vat_rate', e.target.value)}
                                            className="w-16 rounded-md border-gray-300 text-xs font-bold text-right py-1 px-1"
                                        />
                                    </div>
                                </div>
                                <div className="text-right w-1/2">
                                    <span className="font-bold text-gray-900">৳ {fmtBDT(data.tax)}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between text-gray-700 text-xs">
                                <span>Stone:</span>
                                <span className="font-bold text-gray-900">৳ {fmtBDT(data.total_stone_charge)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 text-xs">
                                <span>Mk. Charge:</span>
                                <span className="font-bold text-gray-900">৳ {fmtBDT(data.total_making_charge)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 text-xs">
                                <span>Hallmark:</span>
                                <span className="font-bold text-gray-900">৳ {fmtBDT(data.total_hallmark_charge)}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-700 font-bold">Discount (৳):</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.discount}
                                    onChange={(e) => handleDiscountChange(e.target.value)}
                                    className="w-32 rounded-lg border-gray-300 text-xs font-bold text-right py-1"
                                />
                            </div>

                            <div className="flex justify-between text-sm font-black text-amber-900 border-t border-b border-amber-300 py-1.5">
                                <span>Receivable Amount:</span>
                                <span>৳ {fmtBDT(data.grand_total)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-bold">Received (৳):</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.paid_amount}
                                    onChange={(e) => setData('paid_amount', e.target.value)}
                                    className="w-32 rounded-lg border-amber-300 text-xs font-black text-emerald-700 text-right py-1"
                                    required
                                />
                            </div>

                            <div className="flex justify-between text-xs font-bold text-rose-700 border-t border-amber-200 pt-1">
                                <span>Due:</span>
                                <span>৳ {fmtBDT(Math.max(0, data.grand_total - data.paid_amount))}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                            >
                                <ShoppingBag className="w-4 h-4" /> Sale
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── CUSTOMER ADDING FULL FORM POP-UP MODAL ── */}
            <Modal show={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} maxWidth="lg">
                <div className="p-6 bg-white rounded-3xl text-gray-900 space-y-4 font-sans border border-amber-200">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-amber-700" />
                            <h3 className="text-base font-black text-gray-900">
                                Add Customer
                            </h3>
                        </div>
                        <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs font-semibold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Customer Full Name *</label>
                                <input
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    placeholder="Rahim Enterprise"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Mobile Phone *</label>
                                <input
                                    type="text"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder="01711000000"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Email Address</label>
                                <input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder="dealer@example.com"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">NID / Trade License No</label>
                                <input
                                    type="text"
                                    value={newCustomer.nid_number}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, nid_number: e.target.value })}
                                    placeholder="TRAD-987654"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Customer Type</label>
                                <select
                                    value={newCustomer.customer_type}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, customer_type: e.target.value })}
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold"
                                >
                                    <option value="wholesale">Wholesale Dealer / Merchant</option>
                                    <option value="retail">Retail Customer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Opening Balance (BDT)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newCustomer.opening_balance}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, opening_balance: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold text-emerald-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1 font-bold">Full Address</label>
                            <textarea
                                value={newCustomer.address}
                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                rows="2"
                                placeholder="Dealer shop address..."
                                className="w-full text-xs rounded-xl border-gray-300"
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold shadow-md cursor-pointer">Save Customer</button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── FULL PRODUCT CREATION POP-UP MODAL ── */}
            <Modal show={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} maxWidth="lg">
                <div className="p-6 bg-white rounded-3xl text-gray-900 space-y-4 font-sans border border-amber-200">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-2">
                            <PackagePlus className="w-5 h-5 text-amber-700" />
                            <h3 className="text-base font-black text-gray-900">Add Product</h3>
                        </div>
                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs font-semibold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <label className="block text-gray-700 mb-1 font-bold">Product Name *</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="22K Gold Bangle / Chain"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">SKU / Item Code</label>
                                <input
                                    type="text"
                                    value={newProduct.sku}
                                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                    placeholder="PROD-1024"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Gold Purity / Karat *</label>
                                <select
                                    value={newProduct.purity_name}
                                    onChange={(e) => setNewProduct({ ...newProduct, purity_name: e.target.value })}
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold"
                                >
                                    <option value="24K Pure Gold">24K Pure Gold (99.9%)</option>
                                    <option value="22K Gold">22K Gold (91.6%)</option>
                                    <option value="21K Gold">21K Gold (87.5%)</option>
                                    <option value="18K Gold">18K Gold (75.0%)</option>
                                    <option value="14K Gold">14K Gold (58.5%)</option>
                                    <option value="Traditional Gold">Traditional Gold (Sanatani)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Gross Wt (g) *</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={newProduct.gross_weight}
                                    onChange={(e) => setNewProduct({ ...newProduct, gross_weight: e.target.value })}
                                    placeholder="11.664"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Stone Wt (g)</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={newProduct.stone_weight}
                                    onChange={(e) => setNewProduct({ ...newProduct, stone_weight: e.target.value })}
                                    placeholder="0.000"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Rate / Gram (BDT) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.selling_price}
                                    onChange={(e) => setNewProduct({ ...newProduct, selling_price: e.target.value })}
                                    placeholder="11500"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold text-emerald-700"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Making / Labor Charge (BDT)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.making_charge}
                                    onChange={(e) => setNewProduct({ ...newProduct, making_charge: e.target.value })}
                                    placeholder="2000"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Stone Charge (BDT)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProduct.stone_charge}
                                    onChange={(e) => setNewProduct({ ...newProduct, stone_charge: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-bold">Stock Quantity *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newProduct.stock_quantity}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                                    className="w-full text-xs rounded-xl border-gray-300 py-2 text-center font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1 font-bold">Description / Notes</label>
                            <textarea
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                rows="2"
                                placeholder="Product specifications, design code..."
                                className="w-full text-xs rounded-xl border-gray-300"
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold shadow-md cursor-pointer">Save Product</button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── INVOICE POP-UP MODAL UPON CLICKING SALE ── */}
            {isReceiptModalOpen && completedSale && (
                <Modal show={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} maxWidth="md">
                    <div className="p-6 bg-white rounded-3xl text-gray-900 space-y-4 font-sans border border-amber-200">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3.5 no-print">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-amber-700" />
                                <div>
                                    <h3 className="text-base font-black text-gray-900 uppercase">
                                        Wholesale Invoice #{completedSale.invoice_no}
                                    </h3>
                                    <p className="text-[11px] text-emerald-700 font-bold">Wholesale sale created successfully</p>
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

                        <div className="flex justify-center bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-inner max-h-[60vh] overflow-y-auto">
                            <div className="mini-pos-receipt w-[80mm] max-w-[80mm] bg-white p-4 shadow-md rounded-xl border border-gray-300 text-xs font-mono text-gray-900 space-y-2.5">
                                <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-gray-400">
                                    <div className="flex justify-center items-center gap-1">
                                        <Gem className="w-4 h-4 text-amber-700" />
                                        <h1 className="font-black text-sm uppercase tracking-wider text-gray-900">ROYAL JEWELRY ERP</h1>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-700 uppercase">{completedSale.branch?.name || 'MAIN SHOWROOM'}</p>
                                    <p className="text-[10px] text-gray-600">Mob: +880 1700-000000</p>
                                    <div className="pt-0.5">
                                        <span className="bg-gray-900 text-white px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                                            WHOLESALE MEMO
                                        </span>
                                    </div>
                                </div>

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
                                        <span className="font-bold">{completedSale.customer?.name || 'Client'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 border-b-2 border-dashed border-gray-400 pb-2.5">
                                    <div className="grid grid-cols-12 font-bold border-b border-gray-300 pb-1 text-[9px] uppercase text-gray-700">
                                        <span className="col-span-6">ITEM</span>
                                        <span className="col-span-2 text-center">QTY</span>
                                        <span className="col-span-4 text-right">TOTAL</span>
                                    </div>

                                    {completedSale.items?.map((item, idx) => (
                                        <div key={idx} className="space-y-0.5 text-[10px]">
                                            <div className="font-bold text-gray-900">
                                                {item.product?.name || 'Gold Item'}
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

                                <div className="space-y-1 text-[10px] border-b-2 border-dashed border-gray-400 pb-2.5">
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
                            </div>
                        </div>

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
