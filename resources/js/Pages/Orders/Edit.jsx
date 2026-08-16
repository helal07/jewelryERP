import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    Upload, 
    Sparkles, 
    Calendar, 
    User, 
    DollarSign, 
    Scale, 
    Building2 
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Edit({ order, customers, purities, branches }) {
    const { t } = useLanguage();

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        branch_id: order.branch_id || '',
        customer_id: order.customer_id || '',
        order_date: order.order_date || '',
        delivery_date: order.delivery_date || '',
        product_description: order.product_description || '',
        metal_type: order.metal_type || 'Gold',
        purity_id: order.purity_id || '',
        estimated_weight: order.estimated_weight || '',
        estimated_amount: order.estimated_amount || '',
        advance_amount: order.advance_amount || '',
        status: order.status || 'new',
        reference_image: null,
    });

    const [imagePreview, setImagePreview] = useState(
        order.reference_image ? `/storage/${order.reference_image}` : null
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('reference_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const calculatedDue = Math.max(
        0, 
        (parseFloat(data.estimated_amount) || 0) - (parseFloat(data.advance_amount) || 0)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('orders.update', order.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('orders.index')}
                            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Edit Order #{order.order_no}
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Order ${order.order_no}`} />

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                
                {/* Main Order Information Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-600" />
                        1. Customer & Order Status
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Branch */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                            <select
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="">Select Branch</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Customer */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Customer</label>
                            <select
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="">Select Customer</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                ))}
                            </select>
                        </div>

                        {/* Order Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="new">New Order</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_production">In Production</option>
                                <option value="ready">Ready for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Order Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Order Date</label>
                            <input
                                type="date"
                                value={data.order_date}
                                onChange={(e) => setData('order_date', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        {/* Delivery Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Date</label>
                            <input
                                type="date"
                                value={data.delivery_date}
                                onChange={(e) => setData('delivery_date', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Specs Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-amber-600" />
                        2. Jewelry Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Metal Type</label>
                            <select
                                value={data.metal_type}
                                onChange={(e) => setData('metal_type', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Platinum">Platinum</option>
                                <option value="Diamond">Diamond</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Purity</label>
                            <select
                                value={data.purity_id}
                                onChange={(e) => setData('purity_id', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="">Select Purity</option>
                                {purities.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.percentage}%)</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Weight (g)</label>
                            <input
                                type="number"
                                step="0.001"
                                value={data.estimated_weight}
                                onChange={(e) => setData('estimated_weight', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Description</label>
                        <textarea
                            rows="3"
                            value={data.product_description}
                            onChange={(e) => setData('product_description', e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                    </div>
                </div>

                {/* Financial Estimates Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                        3. Pricing & Advance Payment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Amount (৳)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.estimated_amount}
                                onChange={(e) => setData('estimated_amount', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Advance Received (৳)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.advance_amount}
                                onChange={(e) => setData('advance_amount', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-emerald-600 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Calculated Remaining Due (৳)</label>
                            <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-rose-600">
                                ৳{calculatedDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Link
                        href={route('orders.index')}
                        className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-8 py-2.5 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 hover:opacity-90 active:opacity-100 cursor-pointer"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Save className="w-4 h-4" />
                        {processing ? 'Updating...' : 'Update Order'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
