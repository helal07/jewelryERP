import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Printer, X, Plus, ArrowLeft, Gem } from 'lucide-react';
import axios from 'axios';
import Barcode from 'react-barcode';

function SafeBarcode({ value }) {
    const rawVal = String(value || '').trim();
    const sanitized = rawVal.length > 0 ? rawVal : 'PROD-000';

    try {
        return (
            <Barcode 
                value={sanitized} 
                width={1.1} 
                height={30} 
                fontSize={11} 
                margin={0}
                background="transparent"
                displayValue={true} 
            />
        );
    } catch (err) {
        return (
            <div className="text-center font-mono text-xs font-bold py-1 tracking-wider bg-gray-50 border border-dashed border-gray-300 rounded">
                *{sanitized}*
            </div>
        );
    }
}

export default function PrintLabels({ categories = [], initialProducts = [] }) {
    const [searchForm, setSearchForm] = useState({
        category_id: '',
        name: '',
        sku: ''
    });

    const [searchResults, setSearchResults] = useState(initialProducts);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Modal Preview State
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showPrice, setShowPrice] = useState(true);
    const [showWeight, setShowWeight] = useState(true);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setIsSearching(true);
        try {
            const response = await axios.get(route('products.print-labels.search'), {
                params: searchForm
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setSearchForm({ category_id: '', name: '', sku: '' });
        setSearchResults(initialProducts);
    };

    const addProductToList = (product) => {
        if (!selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
        }
    };

    const removeProductFromList = (productId) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    const updateQuantity = (productId, qty) => {
        const parsed = Math.max(1, Math.min(50, parseInt(qty, 10) || 1));
        setSelectedProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, quantity: parsed } : p)
        );
    };

    const handleOpenPreview = () => {
        if (selectedProducts.length === 0) {
            alert('Please add at least one product first.');
            return;
        }
        setShowPreviewModal(true);
    };

    const handlePrint = () => {
        window.print();
    };

    // Flatten selected products based on quantity for rendering
    const expandedProducts = selectedProducts.flatMap(item =>
        Array(item.quantity || 1).fill(item)
    );

    return (
        <AuthenticatedLayout>
            <Head title="Print Label" />

            <div className="py-6 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-xs border border-amber-200" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                            <Printer className="w-6 h-6 text-amber-700" />
                        </div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-900">Print Label</h2>
                            <Link 
                                href={route('products.create')} 
                                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                Add New Product
                            </Link>
                        </div>
                    </div>

                    {/* Main Panel */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
                        {/* Search Form */}
                        <form onSubmit={handleSearch}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                        value={searchForm.category_id}
                                        onChange={(e) => setSearchForm({ ...searchForm, category_id: e.target.value })}
                                    >
                                        <option value="">— Select —</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                        value={searchForm.name}
                                        onChange={(e) => setSearchForm({ ...searchForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Product Code</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                        value={searchForm.sku}
                                        onChange={(e) => setSearchForm({ ...searchForm, sku: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center gap-3">
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="px-6 py-2 rounded-lg font-bold text-xs shadow-xs text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                >
                                    {isSearching ? 'Searching...' : 'Search'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-6 py-2 rounded-lg font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>

                        {/* Search Results List (if results exist) */}
                        {searchResults.length > 0 && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <div className="bg-gray-50 px-4 py-2.5 font-bold text-xs text-gray-700 border-b border-gray-200 flex items-center justify-between">
                                    <span>Products</span>
                                    <span className="text-[11px] text-gray-500 font-normal">({searchResults.length} available)</span>
                                </div>
                                <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                                    {searchResults.map(product => {
                                        const isSelected = Boolean(selectedProducts.find(p => p.id === product.id));
                                        return (
                                            <div key={product.id} className="px-4 py-2.5 hover:bg-amber-50/40 flex items-center justify-between gap-3 text-xs">
                                                <div>
                                                    <span className="font-bold text-gray-900">{product.name}</span>
                                                    <span className="ml-2 font-mono text-[11px] text-gray-500">{product.sku}</span>
                                                    <span className="ml-2 text-gray-400">• {product.category?.name || 'Category'}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addProductToList(product)}
                                                    disabled={isSelected}
                                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-gray-100 text-gray-400 cursor-default'
                                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                    }`}
                                                >
                                                    {isSelected ? 'Added' : '+ Add'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Selected Products Table */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <table className="w-full text-xs text-left">
                                <thead className="text-white" style={{ backgroundColor: 'rgb(177,118,51)' }}>
                                    <tr>
                                        <th className="px-4 py-3 font-bold w-12 text-center">SL</th>
                                        <th className="px-4 py-3 font-bold">Product</th>
                                        <th className="px-4 py-3 font-bold text-center w-28">Quantity</th>
                                        <th className="px-4 py-3 font-bold text-center w-20">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                                No products in the list. Search and click "+ Add" above.
                                            </td>
                                        </tr>
                                    ) : (
                                        selectedProducts.map((product, index) => (
                                            <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-center text-gray-500 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-gray-900">{product.name}</div>
                                                    <div className="text-[11px] text-gray-500 font-mono">{product.sku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        value={product.quantity || 1}
                                                        onChange={(e) => updateQuantity(product.id, e.target.value)}
                                                        className="w-14 py-1 px-2 text-center text-xs font-bold border border-gray-200 rounded-md focus:ring-1 focus:ring-amber-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProductFromList(product.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer"
                                                        title="Remove"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex justify-center items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleOpenPreview}
                                disabled={selectedProducts.length === 0}
                                className="px-8 py-2.5 rounded-lg font-bold text-xs text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                Preview
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedProducts([])}
                                disabled={selectedProducts.length === 0}
                                className="px-8 py-2.5 rounded-lg font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* In-Page Print Preview Modal (No New Tab Opened) */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:static print:bg-white">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full">
                        
                        {/* Modal Header (Hidden on Print) */}
                        <div className="print:hidden px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                                    Back
                                </button>
                                <span className="text-xs font-bold text-gray-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                                    {expandedProducts.length} {expandedProducts.length === 1 ? 'Label' : 'Labels'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs">
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={showWeight}
                                        onChange={(e) => setShowWeight(e.target.checked)}
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-gray-700 font-medium">Weights</span>
                                </label>

                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={showPrice}
                                        onChange={(e) => setShowPrice(e.target.checked)}
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-gray-700 font-medium">Price / Rate</span>
                                </label>

                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                                    style={{ backgroundColor: 'rgb(177,118,51)' }}
                                >
                                    <Printer className="w-4 h-4 mr-1.5" />
                                    Print
                                </button>

                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Labels Preview Grid */}
                        <div id="printable-labels-area" className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] print:p-0 print:m-0 print:max-h-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
                                {expandedProducts.map((product, idx) => (
                                    <div
                                        key={`${product.id}-${idx}`}
                                        className="bg-white border border-gray-300 rounded-xl p-3.5 shadow-xs print:border print:border-gray-500 print:rounded-none print:shadow-none print:p-2.5 flex flex-col justify-between"
                                        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                                    >
                                        {/* Header / Shop Name */}
                                        <div className="border-b border-gray-200 pb-1.5 mb-1.5 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Gem className="w-3.5 h-3.5 text-amber-600 print:text-black" />
                                                <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Jewelry ERP</span>
                                            </div>
                                            {product.purity?.name && (
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 print:bg-transparent print:border print:border-black px-1.5 py-0.2 rounded font-mono">
                                                    {product.purity.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Name & SKU */}
                                        <div className="text-center my-1">
                                            <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-mono tracking-wider">{product.sku}</p>
                                        </div>

                                        {/* Barcode */}
                                        <div className="flex justify-center my-2 print:my-1 overflow-hidden">
                                            <SafeBarcode value={product.sku || product.id} />
                                        </div>

                                        {/* Spec Details */}
                                        {showWeight && (
                                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] border-t border-gray-100 pt-1.5 print:pt-1">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Gross:</span>
                                                    <span className="font-semibold text-gray-900">{product.gross_weight || 0}g</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Net:</span>
                                                    <span className="font-bold text-gray-900">{product.net_weight || product.gross_weight || 0}g</span>
                                                </div>
                                                {Number(product.stone_weight) > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Stone:</span>
                                                        <span className="font-medium text-gray-700">{product.stone_weight}g</span>
                                                    </div>
                                                )}
                                                {product.metal_type && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Metal:</span>
                                                        <span className="font-medium capitalize text-gray-800">{product.metal_type}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Price / Rate */}
                                        {showPrice && (product.rate_per_vori || product.making_charge_value) && (
                                            <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-200 flex items-center justify-between text-[10px]">
                                                {product.rate_per_vori ? (
                                                    <span className="font-bold text-amber-900 print:text-black">
                                                        Rate: {Number(product.rate_per_vori).toLocaleString()}
                                                    </span>
                                                ) : <span></span>}
                                                {product.making_charge_value && (
                                                    <span className="text-gray-600 font-medium">
                                                        MC: {product.making_charge_value}{product.making_charge_type === 'percentage' ? '%' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Print Stylesheet */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-labels-area, #printable-labels-area * {
                        visibility: visible;
                    }
                    #printable-labels-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    @page {
                        size: A4;
                        margin: 8mm;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
