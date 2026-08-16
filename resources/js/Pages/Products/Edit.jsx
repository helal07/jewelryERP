import React, { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import {
    Gem, ArrowLeft, Save, Image as ImageIcon,
    Scale, Percent, Hash, FileText, Tag, Layers
} from 'lucide-react';

export default function Edit({ product, categories, purities }) {
    const { t } = useLanguage();
    const [imagePreview, setImagePreview] = useState(
        product.image ? `/storage/${product.image}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: product.name || '',
        category_id: product.category_id || '',
        metal_type: product.metal_type || '',
        purity_id: product.purity_id || '',
        gross_weight: product.gross_weight || '',
        stone_weight: product.stone_weight || '0',
        making_charge_type: product.making_charge_type || 'fixed',
        making_charge_value: product.making_charge_value || '',
        stone_charge: product.stone_charge || '0',
        wastage_percentage: product.wastage_percentage || '0',
        unit: product.unit || 'piece',
        image: null,
        description: product.description || '',
        status: product.status || 'active',
    });

    const filteredPurities = useMemo(() => {
        if (!data.metal_type) return purities;
        return purities.filter(p => p.metal_type === data.metal_type);
    }, [data.metal_type, purities]);

    const previewNetWeight = useMemo(() => {
        const gross = parseFloat(data.gross_weight) || 0;
        const stone = parseFloat(data.stone_weight) || 0;
        return Math.max(0, gross - stone).toFixed(3);
    }, [data.gross_weight, data.stone_weight]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('products.update', product.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Edit Product
                    </h2>
                    <Link
                        href={route('products.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('back', 'Back')}
                    </Link>
                </div>
            }
        >
            <Head title="Edit Product" />

            <div className="max-w-5xl mx-auto pb-12">
                {/* SKU display */}
                <div className="mb-4 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
                    <Hash className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm text-indigo-700 font-medium">SKU: <span className="font-mono font-bold">{product.sku}</span></span>
                    {product.barcode && (
                        <span className="text-sm text-indigo-600 ml-4">Barcode: <span className="font-mono">{product.barcode}</span></span>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Tag className="w-5 h-5 mr-2 text-indigo-500" />
                                Basic Information
                            </h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Gem className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.category_id ? 'border-red-500' : ''}`}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Metal Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.metal_type}
                                        onChange={e => {
                                            setData('metal_type', e.target.value);
                                            setData('purity_id', '');
                                        }}
                                        className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.metal_type ? 'border-red-500' : ''}`}
                                        required
                                    >
                                        <option value="">Select Metal Type</option>
                                        <option value="gold">Gold</option>
                                        <option value="silver">Silver</option>
                                        <option value="platinum">Platinum</option>
                                        <option value="diamond">Diamond</option>
                                        <option value="mixed">Mixed</option>
                                    </select>
                                    {errors.metal_type && <p className="mt-1 text-sm text-red-600">{errors.metal_type}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Purity <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.purity_id}
                                        onChange={e => setData('purity_id', e.target.value)}
                                        className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.purity_id ? 'border-red-500' : ''}`}
                                        required
                                    >
                                        <option value="">Select Purity</option>
                                        {filteredPurities.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.percentage}%)</option>
                                        ))}
                                    </select>
                                    {errors.purity_id && <p className="mt-1 text-sm text-red-600">{errors.purity_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.unit}
                                        onChange={e => setData('unit', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="piece">Piece</option>
                                        <option value="gram">Gram</option>
                                        <option value="pair">Pair</option>
                                        <option value="set">Set</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weight Details */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Scale className="w-5 h-5 mr-2 text-indigo-500" />
                                Weight Details
                            </h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gross Weight (g) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={data.gross_weight}
                                        onChange={e => setData('gross_weight', e.target.value)}
                                        className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.gross_weight ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {errors.gross_weight && <p className="mt-1 text-sm text-red-600">{errors.gross_weight}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stone Weight (g)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={data.stone_weight}
                                        onChange={e => setData('stone_weight', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Net Weight (g) <span className="text-xs text-indigo-500 font-normal">(auto-calculated)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={previewNetWeight}
                                            readOnly
                                            className="block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-700 font-semibold sm:text-sm cursor-not-allowed"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded">Auto</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charges & Wastage */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Percent className="w-5 h-5 mr-2 text-indigo-500" />
                                Charges & Wastage
                            </h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Making Charge Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.making_charge_type}
                                        onChange={e => setData('making_charge_type', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="fixed">Fixed Amount</option>
                                        <option value="per_gram">Per Gram</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Making Charge Value <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm font-medium">
                                                {data.making_charge_type === 'percentage' ? '%' : 'BDT '}
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.making_charge_value}
                                            onChange={e => setData('making_charge_value', e.target.value)}
                                            style={{ paddingLeft: '2.5rem' }}
                                            className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.making_charge_value ? 'border-red-500' : ''}`}
                                            required
                                        />
                                    </div>
                                    {errors.making_charge_value && <p className="mt-1 text-sm text-red-600">{errors.making_charge_value}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stone Charge</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm font-medium">BDT </span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.stone_charge}
                                            onChange={e => setData('stone_charge', e.target.value)}
                                            style={{ paddingLeft: '2.5rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wastage Percentage</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm font-medium">%</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            max="100"
                                            value={data.wastage_percentage}
                                            onChange={e => setData('wastage_percentage', e.target.value)}
                                            style={{ paddingLeft: '2.5rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image, Description & Status */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                                Additional Details
                            </h3>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <ImageIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Product Image
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {imagePreview && (
                                                <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-300 shrink-0 shadow-sm">
                                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            rows="4"
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="Optional product description..."
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-200 h-fit">
                                    <div className="flex items-center h-5 mt-1">
                                        <input
                                            id="status"
                                            type="checkbox"
                                            checked={data.status === 'active'}
                                            onChange={e => setData('status', e.target.checked ? 'active' : 'inactive')}
                                            className="w-5 h-5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="status" className="font-semibold text-gray-900 cursor-pointer select-none">
                                            Active Product
                                        </label>
                                        <p className="text-gray-500 mt-1">Enable this to make the product available for sales and inventory operations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Update Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

