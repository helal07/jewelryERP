import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Printer, ArrowLeft, Gem, Phone, MapPin, 
    CheckCircle2, ShieldCheck, FileText, User, Calendar, Tag
} from 'lucide-react';

export default function Show({ sale }) {
    const [paperWidth, setPaperWidth] = useState('80mm'); // '80mm' | '58mm'

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('print') === 'true') {
            setTimeout(() => {
                window.print();
            }, 400);
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const currentSale = sale || {};
    const dueAmount = currentSale.due_amount !== undefined 
        ? Number(currentSale.due_amount) 
        : Math.max(0, Number(currentSale.grand_total || 0) - Number(currentSale.paid_amount || 0));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-amber-700" />
                            Invoice #{currentSale.invoice_no}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <button
                            onClick={handlePrint}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                            <Printer className="w-4 h-4" /> Print
                        </button>

                        <Link
                            href={route('sales.index')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Invoice #${currentSale.invoice_no}`} />

            {/* Strict POS Printer Print Styles */}
            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: ${paperWidth === '58mm' ? '58mm auto' : '80mm auto'};
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    header, nav, aside, [class*="sidebar"], .sidebar, button, .no-print, .print\\:hidden {
                        display: none !important;
                    }
                    .mini-pos-receipt, .mini-pos-receipt * {
                        visibility: visible !important;
                    }
                    .mini-pos-receipt {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: ${paperWidth === '58mm' ? '56mm' : '78mm'} !important;
                        margin: 0 !important;
                        padding: 2mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        background-color: #ffffff !important;
                        color: #000000 !important;
                        font-size: ${paperWidth === '58mm' ? '10px' : '11px'} !important;
                        line-height: 1.25 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ── LEFT COLUMN (8 Cols): ON-SCREEN FULL INVOICE DETAILS CARD ── */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/90 space-y-6 no-print">
                    
                    {/* Store Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-100 pb-5 gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Gem className="w-6 h-6 text-amber-700" />
                                <h3 className="text-xl font-black text-amber-900 uppercase">ROYAL JEWELRY ERP</h3>
                            </div>
                            <p className="text-xs font-bold text-amber-700 uppercase mt-0.5">
                                Branch: {currentSale.branch?.name || 'Main Showroom'}
                            </p>
                        </div>

                        <div className="text-right bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">INVOICE NUMBER</span>
                            <span className="text-lg font-mono font-black text-amber-950">{currentSale.invoice_no}</span>
                            <p className="text-[11px] text-gray-600 mt-0.5">
                                Date: {new Date(currentSale.sale_date || Date.now()).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">CUSTOMER</span>
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-amber-700" />
                                {currentSale.customer?.name || 'Walk-in Customer'}
                            </h4>
                            {currentSale.customer?.phone && (
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" /> {currentSale.customer.phone}
                                </p>
                            )}
                        </div>

                        <div className="sm:text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">PAYMENT STATUS</span>
                            <span className={`inline-block px-3 py-1 text-xs font-black uppercase rounded-full border ${
                                dueAmount <= 0 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                    : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}>
                                {dueAmount <= 0 ? 'PAID IN FULL' : `DUE: ৳ ${dueAmount.toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                                <tr>
                                    <th className="px-3 py-2.5">Item</th>
                                    <th className="px-2 py-2.5 text-center">Purity</th>
                                    <th className="px-2 py-2.5 text-right">Net Wt</th>
                                    <th className="px-2 py-2.5 text-right">Rate/g</th>
                                    <th className="px-2 py-2.5 text-right">Making</th>
                                    <th className="px-2 py-2.5 text-center">Qty</th>
                                    <th className="px-3 py-2.5 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                                {currentSale.items?.map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td className="px-3 py-2.5 font-bold text-gray-900">
                                            {item.product?.name || 'Gold Product'}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                                                {item.product?.purity?.name || '22K'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-right font-bold text-gray-900">{Number(item.net_weight || 0).toFixed(3)}g</td>
                                        <td className="px-2 py-2.5 text-right">৳{Number(item.rate_per_gram || 0).toLocaleString()}</td>
                                        <td className="px-2 py-2.5 text-right text-gray-600">৳{Number(item.making_charge || 0).toLocaleString()}</td>
                                        <td className="px-2 py-2.5 text-center font-bold">{item.quantity || 1}</td>
                                        <td className="px-3 py-2.5 text-right font-black text-gray-900">
                                            ৳{Number(item.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Totals */}
                    <div className="flex justify-end pt-2">
                        <div className="w-full sm:w-64 space-y-1.5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span className="font-bold text-gray-900">৳{Number(currentSale.subtotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                            </div>
                            {Number(currentSale.discount || 0) > 0 && (
                                <div className="flex justify-between text-rose-600 font-semibold">
                                    <span>Discount:</span>
                                    <span>- ৳{Number(currentSale.discount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                            )}
                            {Number(currentSale.tax || 0) > 0 && (
                                <div className="flex justify-between text-gray-700">
                                    <span>VAT / Tax:</span>
                                    <span>+ ৳{Number(currentSale.tax).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                            )}
                            {Number(currentSale.old_gold_exchange_value || 0) > 0 && (
                                <div className="flex justify-between text-amber-800 font-semibold">
                                    <span>Old Gold Exch:</span>
                                    <span>- ৳{Number(currentSale.old_gold_exchange_value).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-black text-amber-900 border-t border-b border-amber-300 py-1.5">
                                <span>Grand Total:</span>
                                <span>৳{Number(currentSale.grand_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between font-bold text-emerald-700">
                                <span>Paid Amount:</span>
                                <span>৳{Number(currentSale.paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                            </div>
                            {dueAmount > 0 && (
                                <div className="flex justify-between font-bold text-rose-600">
                                    <span>Due Balance:</span>
                                    <span>৳{dueAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (5 Cols): LIVE POS THERMAL RECEIPT SLIP PREVIEW ── */}
                <div className="lg:col-span-5 space-y-4">
                    
                    {/* Thermal Settings Control Bar */}
                    <div className="bg-amber-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between no-print">
                        <div className="text-xs">
                            <h4 className="font-extrabold flex items-center gap-1.5">
                                <Printer className="w-4 h-4 text-amber-400" /> POS Receipt
                            </h4>
                        </div>
                        <div className="bg-amber-950 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-amber-800">
                            <button
                                type="button"
                                onClick={() => setPaperWidth('80mm')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${
                                    paperWidth === '80mm' 
                                        ? 'bg-amber-500 text-white font-black shadow-xs' 
                                        : 'text-amber-300 hover:text-white'
                                }`}
                            >
                                80mm
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaperWidth('58mm')}
                                className={`px-2.5 py-1 rounded-lg transition-all ${
                                    paperWidth === '58mm' 
                                        ? 'bg-amber-500 text-white font-black shadow-xs' 
                                        : 'text-amber-300 hover:text-white'
                                }`}
                            >
                                58mm
                            </button>
                        </div>
                    </div>

                    {/* DEDICATED MINI POS THERMAL RECEIPT CONTAINER */}
                    <div className="flex justify-center bg-gray-100/60 p-4 rounded-2xl border border-gray-200 shadow-inner">
                        <div className={`mini-pos-receipt ${paperWidth === '58mm' ? 'w-[58mm]' : 'w-[80mm]'} bg-white p-4 shadow-lg rounded-xl border border-gray-300 text-xs font-mono text-gray-900 space-y-2.5`}>
                            
                            {/* 1. Header & Store Info */}
                            <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-gray-400">
                                <div className="flex justify-center items-center gap-1">
                                    <Gem className="w-4 h-4 text-amber-700" />
                                    <h1 className="font-black text-sm uppercase tracking-wider text-gray-900">ROYAL JEWELRY ERP</h1>
                                </div>
                                <p className="text-[10px] font-bold text-gray-700 uppercase">{currentSale.branch?.name || 'MAIN SHOWROOM'}</p>
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
                                    <span className="font-bold text-gray-900">{currentSale.invoice_no}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">DATE:</span>
                                    <span>{new Date(currentSale.sale_date || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">CUSTOMER:</span>
                                    <span className="font-bold">{currentSale.customer?.name || 'Walk-in'}</span>
                                </div>
                                {currentSale.customer?.phone && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">PHONE:</span>
                                        <span>{currentSale.customer.phone}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[9px] text-gray-500 pt-0.5">
                                    <span>SERVED BY:</span>
                                    <span>{currentSale.creator?.name || 'Staff'}</span>
                                </div>
                            </div>

                            {/* 3. Itemized Jewelry Table */}
                            <div className="space-y-2 border-b-2 border-dashed border-gray-400 pb-2.5">
                                <div className="grid grid-cols-12 font-bold border-b border-gray-300 pb-1 text-[9px] uppercase text-gray-700">
                                    <span className="col-span-6">ITEM</span>
                                    <span className="col-span-2 text-center">QTY</span>
                                    <span className="col-span-4 text-right">TOTAL</span>
                                </div>

                                {currentSale.items?.map((item, idx) => (
                                    <div key={item.id || idx} className="space-y-0.5 text-[10px]">
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
                                    <span className="font-bold text-gray-900">৳{Number(currentSale.subtotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                                {Number(currentSale.discount || 0) > 0 && (
                                    <div className="flex justify-between text-rose-700 font-semibold">
                                        <span>DISCOUNT:</span>
                                        <span>-৳{Number(currentSale.discount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                )}
                                {Number(currentSale.tax || 0) > 0 && (
                                    <div className="flex justify-between text-gray-800">
                                        <span>VAT / TAX:</span>
                                        <span>+৳{Number(currentSale.tax).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                )}
                                {Number(currentSale.old_gold_exchange_value || 0) > 0 && (
                                    <div className="flex justify-between text-amber-800 font-semibold">
                                        <span>OLD GOLD EXCH:</span>
                                        <span>-৳{Number(currentSale.old_gold_exchange_value).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-xs font-black text-gray-900 border-t-2 border-black pt-1 pb-0.5">
                                    <span>GRAND TOTAL:</span>
                                    <span>৳{Number(currentSale.grand_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>

                                <div className="flex justify-between font-bold text-emerald-800">
                                    <span>PAID AMOUNT:</span>
                                    <span>৳{Number(currentSale.paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>

                                {dueAmount > 0 ? (
                                    <div className="flex justify-between font-bold text-rose-700 text-[10px] border-t border-rose-200 pt-0.5">
                                        <span>DUE BALANCE:</span>
                                        <span>৳{dueAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                    </div>
                                ) : (
                                    <div className="text-center font-black text-emerald-800 text-[9px] uppercase bg-emerald-50 py-0.5 rounded border border-emerald-200 mt-0.5">
                                        *** PAID IN FULL ***
                                    </div>
                                )}
                            </div>

                            {/* 5. Barcode & Mini Receipt Footer */}
                            <div className="text-center pt-1 space-y-1.5">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="font-mono text-sm font-black tracking-widest leading-none select-none text-gray-800">
                                        |||| | ||| || |||| | |||
                                    </div>
                                    <span className="text-[8px] text-gray-500 font-mono tracking-widest">{currentSale.invoice_no}</span>
                                </div>

                                <div className="text-[8px] text-gray-600 space-y-0.5 pt-1 border-t border-dashed border-gray-300">
                                    <p className="font-bold text-gray-800 uppercase">THANK YOU FOR YOUR PURCHASE!</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </AuthenticatedLayout>
    );
}
