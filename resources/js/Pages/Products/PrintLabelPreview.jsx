import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, Gem } from 'lucide-react';
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

export default function PrintLabelPreview({ products = [] }) {
    const [showPrice, setShowPrice] = useState(true);
    const [showWeight, setShowWeight] = useState(true);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white">
            <Head title="Print Labels" />

            {/* Screen Controls Header (Hidden in Print) */}
            <div className="print:hidden bg-white border-b border-gray-200 shadow-xs sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('products.print-labels')}
                            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Back
                        </Link>
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                            {products.length} {products.length === 1 ? 'Label' : 'Labels'}
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
                    </div>
                </div>
            </div>

            {/* Label Cards Grid */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 print:p-0 print:m-0">
                {products.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
                        <Gem className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800">No Products Selected</h3>
                        <Link
                            href={route('products.print-labels')}
                            className="inline-flex items-center mt-4 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
                        {products.map((product, idx) => (
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
                )}
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    @page {
                        size: A4;
                        margin: 8mm;
                    }
                }
            `}</style>
        </div>
    );
}
