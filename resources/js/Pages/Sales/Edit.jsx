import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    ShoppingBag, Plus, Trash2, ArrowLeft, Save, UserPlus, Calculator, 
    Search, Image as ImageIcon, X, PackagePlus, Check, Gem, Sparkles, Filter,
    Scale, CreditCard, Coins, CheckCircle2, ShieldCheck, Printer
} from 'lucide-react';

export default function Edit({ sale, customers = [], products = [], branches = [], defaultVatRate = 5 }) {
    const [customerList, setCustomerList] = useState(customers);
    const [productList, setProductList] = useState(products);

    const initialItems = (sale.items && sale.items.length > 0)
        ? sale.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            gross_weight: item.gross_weight,
            stone_weight: item.stone_weight || 0,
            net_weight: item.net_weight,
            rate_per_gram: item.rate_per_gram,
            making_charge: item.making_charge || 0,
            stone_charge: item.stone_charge || 0,
            quantity: item.quantity || 1,
            total_amount: item.total_amount,
        }))
        : [{
            product_id: '',
            gross_weight: '',
            stone_weight: 0,
            net_weight: '',
            rate_per_gram: '',
            making_charge: 0,
            stone_charge: 0,
            quantity: 1,
            total_amount: 0,
        }];

    const initialVatPercent = (sale.tax && sale.subtotal && Number(sale.subtotal) > 0)
        ? ((Number(sale.tax) / Number(sale.subtotal)) * 100).toFixed(2)
        : defaultVatRate;

    const { data, setData, put, processing, errors } = useForm({
        customer_id: sale.customer_id || (customers.length > 0 ? customers[0].id : ''),
        branch_id: sale.branch_id || (branches.length > 0 ? branches[0].id : ''),
        invoice_no: sale.invoice_no,
        sale_date: sale.sale_date ? String(sale.sale_date).substring(0, 10) : new Date().toISOString().split('T')[0],
        sale_type: sale.sale_type || 'retail',
        items: initialItems,
        subtotal: Number(sale.subtotal || 0),
        discount: Number(sale.discount || 0),
        vat_percent: initialVatPercent,
        tax: Number(sale.tax || 0),
        old_gold_exchange_value: Number(sale.old_gold_exchange_value || 0),
        grand_total: Number(sale.grand_total || 0),
        paid_amount: Number(sale.paid_amount || 0),
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

    // Recalculate totals
    useEffect(() => {
        const sub = data.items.reduce((acc, item) => acc + (Number(item.total_amount) || 0), 0);
        const disc = Number(data.discount) || 0;
        const oldGold = Number(data.old_gold_exchange_value) || 0;
        const taxableAmount = Math.max(0, sub - disc);
        const vatRate = Number(data.vat_percent) || 0;
        const taxVal = (taxableAmount * vatRate) / 100;
        const grand = Math.max(0, taxableAmount + taxVal - oldGold);

        setData(prev => ({
            ...prev,
            subtotal: sub,
            tax: taxVal,
            grand_total: grand
        }));
    }, [data.items, data.discount, data.vat_percent, data.old_gold_exchange_value]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('sales.update', sale.id));
    };

    const selectedCustomer = customerList.find(c => c.id === Number(data.customer_id));
    const dueAmount = Math.max(0, Number(data.grand_total) - Number(data.paid_amount));

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Sale Invoice #${sale.invoice_no}`} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('sales.index')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-6 h-6 text-[#E88A1A]" />
                                Edit Sale Invoice #{sale.invoice_no}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">Update items, pricing, customer and payment records</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('sales.show', sale.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <Printer className="w-4 h-4" /> View Invoice
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Branch */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                    Branch *
                                </label>
                                <select
                                    value={data.branch_id}
                                    onChange={(e) => setData('branch_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-300 text-sm focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                                    required
                                >
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                {errors.branch_id && <p className="text-xs text-rose-600 mt-1">{errors.branch_id}</p>}
                            </div>

                            {/* Customer */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                    Customer *
                                </label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-300 text-sm focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                                    required
                                >
                                    {customerList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.phone ? `(${c.phone})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && <p className="text-xs text-rose-600 mt-1">{errors.customer_id}</p>}
                            </div>

                            {/* Sale Date */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                    Sale Date *
                                </label>
                                <input
                                    type="date"
                                    value={data.sale_date}
                                    onChange={(e) => setData('sale_date', e.target.value)}
                                    className="w-full rounded-xl border-gray-300 text-sm focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                                    required
                                />
                                {errors.sale_date && <p className="text-xs text-rose-600 mt-1">{errors.sale_date}</p>}
                            </div>

                            {/* Invoice No */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                    Invoice No
                                </label>
                                <input
                                    type="text"
                                    value={data.invoice_no}
                                    readOnly
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-gray-600 text-sm font-mono font-bold cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {selectedCustomer && (
                            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
                                <span><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</span>
                                <span><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</span>
                            </div>
                        )}
                    </div>

                    {/* Items Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Gem className="w-5 h-5 text-[#E88A1A]" />
                                Invoice Items Breakdown
                            </h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-amber-700" /> Add Line
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2.5 min-w-[200px]">Product / Item</th>
                                        <th className="px-3 py-2.5 w-24">Gross (g)</th>
                                        <th className="px-3 py-2.5 w-20">Stone (g)</th>
                                        <th className="px-3 py-2.5 w-24">Net (g)</th>
                                        <th className="px-3 py-2.5 w-28">Rate/g (৳)</th>
                                        <th className="px-3 py-2.5 w-24">Making (৳)</th>
                                        <th className="px-3 py-2.5 w-24">Stone (৳)</th>
                                        <th className="px-3 py-2.5 w-16 text-center">Qty</th>
                                        <th className="px-3 py-2.5 w-32 text-right">Total (৳)</th>
                                        <th className="px-3 py-2.5 w-10 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-amber-50/20">
                                            <td className="px-3 py-2">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-xs py-1.5 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                                                    required
                                                >
                                                    <option value="">Select Item...</option>
                                                    {productList.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} {p.sku ? `(${p.sku})` : ''} - {p.purity?.name || '22K'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={item.gross_weight}
                                                    onChange={(e) => handleItemChange(idx, 'gross_weight', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-xs py-1.5 text-right font-mono"
                                                    required
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={item.stone_weight}
                                                    onChange={(e) => handleItemChange(idx, 'stone_weight', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-xs py-1.5 text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={item.net_weight}
                                                    readOnly
                                                    className="w-full rounded-lg border-gray-200 bg-gray-50 text-xs py-1.5 text-right font-mono font-bold text-gray-700"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.rate_per_gram}
                                                    onChange={(e) => handleItemChange(idx, 'rate_per_gram', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-xs py-1.5 text-right font-mono font-bold"
                                                    required
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.making_charge}
                                                    onChange={(e) => handleItemChange(idx, 'making_charge', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-xs py-1.5 text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.stone_charge}
                                                    onChange={(e) => handleItemChange(idx, 'stone_charge', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-xs py-1.5 text-right font-mono"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-xs py-1.5 text-center font-mono font-bold"
                                                    required
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right font-black text-gray-900 font-mono text-sm">
                                                ৳ {Number(item.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Calculations & Payment Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <CreditCard className="w-5 h-5 text-[#E88A1A]" />
                                Payment & Adjustments
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Special Discount (৳)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.discount}
                                        onChange={(e) => setData('discount', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm font-mono text-right"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        VAT (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.vat_percent}
                                        onChange={(e) => setData('vat_percent', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm font-mono text-right"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Old Gold Exchange (৳)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.old_gold_exchange_value}
                                        onChange={(e) => setData('old_gold_exchange_value', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm font-mono text-right text-amber-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">
                                        Paid Amount (৳) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.paid_amount}
                                        onChange={(e) => setData('paid_amount', e.target.value)}
                                        className="w-full rounded-xl border-emerald-400 bg-emerald-50/50 text-sm font-mono text-right font-black text-emerald-900"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Invoice Final Summary Card */}
                        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10 rounded-2xl border border-amber-200 p-6 space-y-3 font-sans">
                            <h3 className="font-extrabold text-amber-900 uppercase text-xs tracking-wider border-b border-amber-200 pb-2">
                                Invoice Final Summary
                            </h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-gray-700 font-medium">
                                    <span>Subtotal:</span>
                                    <span className="font-mono font-bold">৳ {Number(data.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>

                                {Number(data.discount) > 0 && (
                                    <div className="flex justify-between text-rose-600 font-medium">
                                        <span>Discount:</span>
                                        <span className="font-mono">- ৳ {Number(data.discount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-700 font-medium">
                                    <span>VAT ({data.vat_percent}%):</span>
                                    <span className="font-mono">+ ৳ {Number(data.tax || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>

                                {Number(data.old_gold_exchange_value) > 0 && (
                                    <div className="flex justify-between text-amber-800 font-medium">
                                        <span>Old Gold Exchange:</span>
                                        <span className="font-mono">- ৳ {Number(data.old_gold_exchange_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-base font-black text-gray-900 border-t border-amber-200 pt-2">
                                    <span>Grand Total:</span>
                                    <span className="font-mono text-[#E88A1A]">৳ {Number(data.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between text-sm font-bold text-emerald-800">
                                    <span>Paid Amount:</span>
                                    <span className="font-mono">৳ {Number(data.paid_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between text-sm font-bold text-rose-700 border-t border-amber-200/60 pt-1">
                                    <span>Remaining Due:</span>
                                    <span className="font-mono">৳ {dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-4 bg-[#E88A1A] hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {processing ? 'Updating Invoice...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
