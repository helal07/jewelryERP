import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    Package, Printer, Filter
} from 'lucide-react';
import useFilter from '@/Hooks/useFilter';
import { useLanguage } from '@/Context/LanguageContext';

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InventoryReport({ products = [], summary = {}, branches = [], purities = [], filters = {} }) {
    const { t } = useLanguage();
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [metalType, setMetalType] = useState(filters.metal_type || '');
    const [purityId, setPurityId] = useState(filters.purity_id || '');

    useFilter(route('reports.inventory'), {
        branch_id: branchId,
        metal_type: metalType,
        purity_id: purityId,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Package className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('inventoryReport') || 'Inventory Report'}
                    </h2>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer print:hidden"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Printer className="w-4 h-4" />
                        {t('print') || 'Print'}
                    </button>
                </div>
            }
        >
            <Head title="Inventory Report" />

            {/* Print Letterhead (Only visible in Print) */}
            <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Jewelry ERP</h1>
                        <h2 className="text-sm font-semibold text-gray-700">Inventory & Stock Valuation Report</h2>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                        <p>Printed: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch</label>
                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Metal Type</label>
                        <select
                            value={metalType}
                            onChange={(e) => setMetalType(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Metals</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="platinum">Platinum</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purity</label>
                        <select
                            value={purityId}
                            onChange={(e) => setPurityId(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Purities</option>
                            {purities.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Items</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{summary.total_items || 0}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Stock Weight</p>
                    <p className="text-2xl font-black text-amber-900 mt-1">{summary.total_weight_gm || 0} g</p>
                    <p className="text-xs text-gray-500 mt-0.5">≈ {summary.total_weight_vori || 0} Vori</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Stock Valuation</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">৳ {fmtBDT(summary.total_valuation)}</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Artisan Holding</p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{summary.artisan_holding_gm || 0} g</p>
                </div>
            </div>

            {/* Product Inventory Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                <th className="p-3.5">Barcode / SKU</th>
                                <th className="p-3.5">Item Name</th>
                                <th className="p-3.5">Category</th>
                                <th className="p-3.5">Purity</th>
                                <th className="p-3.5 text-right">Net Weight</th>
                                <th className="p-3.5 text-right">Stock Qty</th>
                                <th className="p-3.5 text-right">Valuation</th>
                                <th className="p-3.5">Branch</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length > 0 ? (
                                products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-gray-50/50">
                                        <td className="p-3.5 font-bold text-amber-800 whitespace-nowrap">{prod.barcode || prod.sku || '—'}</td>
                                        <td className="p-3.5 font-semibold text-gray-900">{prod.name}</td>
                                        <td className="p-3.5 text-gray-700">{prod.category?.name || '—'}</td>
                                        <td className="p-3.5 text-gray-700">{prod.purity?.name || '—'}</td>
                                        <td className="p-3.5 text-right font-bold text-gray-900">{prod.net_weight} g</td>
                                        <td className="p-3.5 text-right font-semibold text-gray-700">{prod.quantity || 1}</td>
                                        <td className="p-3.5 text-right font-bold text-emerald-600">৳ {fmtBDT(prod.selling_price)}</td>
                                        <td className="p-3.5 text-gray-600">{prod.branch?.name || '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-gray-400">
                                        No inventory items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
