import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import {
    ArrowLeft, Edit, Printer, Gem, Scale, Percent,
    Tag, Layers, Hash, Info, Package
} from 'lucide-react';

export default function Show({ product }) {
    const { t } = useLanguage();

    const metalTypeColors = {
        gold: 'bg-amber-100 text-amber-800 border-amber-200',
        silver: 'bg-gray-100 text-gray-700 border-gray-200',
        platinum: 'bg-blue-100 text-blue-800 border-blue-200',
        diamond: 'bg-purple-100 text-purple-800 border-purple-200',
        mixed: 'bg-teal-100 text-teal-800 border-teal-200',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Product Details
                    </h2>
                    <div className="flex items-center gap-3">
                        <a
                            href={route('products.print-label', product.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Label
                        </a>
                        <Link
                            href={route('products.edit', product.id)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                        <Link
                            href={route('products.index')}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('back', 'Back')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Product: ${product.name}`} />

            <div className="max-w-5xl mx-auto pb-12 space-y-6">

                {/* Product Header Card */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                                {product.image ? (
                                    <img
                                        className="h-48 w-48 rounded-2xl object-cover border border-gray-200 shadow-md"
                                        src={`/storage/${product.image}`}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200/50 shadow-md">
                                        <Gem className="h-16 w-16 text-indigo-400" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                            <Hash className="w-3 h-3 mr-1" /> {product.sku}
                                        </span>
                                        {product.barcode && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono bg-gray-100 text-gray-600 border border-gray-200">
                                                Barcode: {product.barcode}
                                            </span>
                                        )}
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${
                                            product.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-rose-100 text-rose-700 border-rose-200'
                                        }`}>
                                            {product.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Category</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{product.category?.name || '—'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Metal Type</p>
                                        <span className={`mt-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${metalTypeColors[product.metal_type] || ''}`}>
                                            {product.metal_type?.charAt(0).toUpperCase() + product.metal_type?.slice(1)}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Purity</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{product.purity?.name || '—'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Unit</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{product.unit}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weight & Charges Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weight */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Scale className="w-5 h-5 mr-2 text-indigo-500" />
                                Weight Details
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Gross Weight</span>
                                <span className="text-sm font-bold text-gray-900">{product.gross_weight} g</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Stone Weight</span>
                                <span className="text-sm font-bold text-gray-900">{product.stone_weight} g</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-indigo-50 -mx-6 px-6 rounded-lg">
                                <span className="text-sm font-medium text-indigo-700">Net Weight</span>
                                <span className="text-lg font-bold text-indigo-700">{product.net_weight} g</span>
                            </div>
                        </div>
                    </div>

                    {/* Charges */}
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Percent className="w-5 h-5 mr-2 text-indigo-500" />
                                Charges & Wastage
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Making Charge Type</span>
                                <span className="text-sm font-bold text-gray-900 capitalize">{product.making_charge_type?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Making Charge Value</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {product.making_charge_type === 'percentage' ? `${product.making_charge_value}%` : `BDT ${Number(product.making_charge_value).toLocaleString()}`}
                                    {product.making_charge_type === 'per_gram' && '/g'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Stone Charge</span>
                                <span className="text-sm font-bold text-gray-900">BDT {Number(product.stone_charge).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600">Wastage</span>
                                <span className="text-sm font-bold text-gray-900">{product.wastage_percentage}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-indigo-500" />
                                Description
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

