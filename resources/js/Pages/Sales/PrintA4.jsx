import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

export default function PrintA4({ sale, settings }) {
    const { 
        invoice_terms, 
        invoice_show_qr, 
        invoice_use_letterhead, 
        invoice_use_footer, 
        invoice_letterhead, 
        invoice_footer 
    } = settings || {};

    const publicVerifyUrl = sale.secure_token 
        ? route('public.invoice.verify', { token: sale.secure_token })
        : null;

    useEffect(() => {
        // Automatically trigger print dialog when page loads
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Vori calculation
    const formatWeight = (grams) => {
        const totalRoti = (grams / 11.6638038) * 96;
        const vori = Math.floor(totalRoti / 96);
        const remainingRotiAfterVori = totalRoti % 96;
        const ana = Math.floor(remainingRotiAfterVori / 6);
        const roti = (remainingRotiAfterVori % 6).toFixed(2);
        
        let formatted = [];
        if (vori > 0) formatted.push(`${vori} Vori`);
        if (ana > 0) formatted.push(`${ana} Ana`);
        if (roti > 0 || formatted.length === 0) formatted.push(`${roti} Roti`);
        
        return `${formatted.join(' ')} (${Number(grams).toFixed(4)} gm)`;
    };

    return (
        <>
            <Head title={`Invoice - ${sale.invoice_no}`} />
            
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                body {
                    background: #f3f4f6;
                    font-family: 'Inter', sans-serif;
                }
                .a4-container {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 20px auto;
                    background: white;
                    padding: 0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                @media print {
                    .a4-container {
                        margin: 0;
                        box-shadow: none;
                        width: 100%;
                        min-height: 100vh;
                    }
                }
            `}</style>

            {/* Print Controls (Hidden on Print) */}
            <div className="no-print text-center py-4">
                <button 
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-[#b17633] text-white rounded shadow hover:bg-[#9b6428] transition font-semibold"
                >
                    Print Invoice
                </button>
            </div>

            <div className="a4-container text-black">
                {/* Header Section */}
                <div className="flex-shrink-0">
                    {invoice_use_letterhead === '1' && invoice_letterhead ? (
                        <img 
                            src={`/storage/${invoice_letterhead}`} 
                            alt="Letterhead" 
                            className="w-full object-cover" 
                            style={{ maxHeight: '150px' }} 
                        />
                    ) : (
                        <div className="text-center py-8 border-b-2 border-[#b17633]">
                            <h1 className="text-3xl font-bold text-[#b17633] uppercase">{sale.branch?.name || 'Jewelry Shop'}</h1>
                            <p className="text-sm mt-1">{sale.branch?.address}</p>
                            <p className="text-sm">Phone: {sale.branch?.phone}</p>
                            <h2 className="text-xl font-semibold mt-4 tracking-widest uppercase">Invoice</h2>
                        </div>
                    )}
                </div>

                {/* Metadata Section */}
                <div className="px-10 py-6 flex justify-between items-center">
                    <div className="space-y-1 w-1/3">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Bill To</h3>
                        <p className="font-bold text-lg">{sale.customer?.name}</p>
                        <p className="text-sm">Mobile: {sale.customer?.phone}</p>
                        <p className="text-sm text-gray-600 w-64">{sale.customer?.address}</p>
                    </div>

                    <div className="w-1/3 flex justify-center">
                        {invoice_show_qr === '1' && publicVerifyUrl && (
                            <div className="p-1 border rounded shadow-sm bg-white flex flex-col items-center">
                                <QRCodeSVG value={publicVerifyUrl} size={70} level="M" />
                                <p className="text-[8px] text-center mt-1 text-gray-500">Scan to Verify</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-start gap-6 text-right w-1/3 justify-end">
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold">Invoice No:</span> <span className="text-gray-800">{sale.invoice_no}</span></p>
                            <p><span className="font-semibold">Date:</span> {formatDate(sale.sale_date)}</p>
                            <p><span className="font-semibold">Type:</span> <span className="capitalize">{sale.sale_type}</span></p>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="px-10 flex-1">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-y-2 border-[#b17633] bg-[#b17633]/5">
                                <th className="py-2 px-2 text-center w-12">
                                    <div className="font-semibold">SL</div>
                                    <div className="text-[10px] text-gray-500 font-normal">ক্রমিক</div>
                                </th>
                                <th className="py-2 px-2">
                                    <div className="font-semibold">Description</div>
                                    <div className="text-[10px] text-gray-500 font-normal">বিবরণ</div>
                                </th>
                                <th className="py-2 px-2 text-right">
                                    <div className="font-semibold">Qty</div>
                                    <div className="text-[10px] text-gray-500 font-normal">সংখ্যা</div>
                                </th>
                                <th className="py-2 px-2 text-right">
                                    <div className="font-semibold">Weight</div>
                                    <div className="text-[10px] text-gray-500 font-normal">ওজন</div>
                                </th>
                                <th className="py-2 px-2 text-right">
                                    <div className="font-semibold">Rate/Vori</div>
                                    <div className="text-[10px] text-gray-500 font-normal">দর প্রতি ভরি</div>
                                </th>
                                <th className="py-2 px-2 text-right">
                                    <div className="font-semibold">Amount</div>
                                    <div className="text-[10px] text-gray-500 font-normal">টাকা</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items?.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="py-3 px-2 text-center">{index + 1}</td>
                                    <td className="py-3 px-2">
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.product?.purity?.name} | {item.product?.category?.name}
                                        </p>
                                    </td>
                                    <td className="py-3 px-2 text-right">{item.quantity}</td>
                                    <td className="py-3 px-2 text-right text-xs">
                                        {formatWeight(item.net_weight)}
                                        {item.stone_weight > 0 && <p className="text-[10px] text-gray-500">Stone: {Number(item.stone_weight).toFixed(3)}g</p>}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        {formatCurrency(item.rate_per_gram * 11.6638038)}
                                    </td>
                                    <td className="py-3 px-2 text-right font-semibold">
                                        {formatCurrency(item.total_amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Financial Summary */}
                    <div className="mt-6 flex justify-end">
                        <div className="w-72 space-y-2 text-sm">
                            <div className="flex justify-between px-2 text-gray-700">
                                <span>Total Metal Price:</span>
                                <span className="font-medium">{formatCurrency(Math.max(0, sale.subtotal - sale.total_making_charge - sale.total_stone_charge - sale.total_hallmark_charge))}</span>
                            </div>
                            
                            {sale.tax > 0 && (
                                <div className="flex justify-between px-2 text-gray-700">
                                    <span>VAT On Metal:</span>
                                    <span className="font-medium">+{formatCurrency(sale.tax)}</span>
                                </div>
                            )}

                            <div className="flex justify-between px-2 text-gray-700">
                                <span>Stone Charge:</span>
                                <span className="font-medium">{formatCurrency(sale.total_stone_charge || 0)}</span>
                            </div>

                            <div className="flex justify-between px-2 text-gray-700">
                                <span>Making Charge:</span>
                                <span className="font-medium">{formatCurrency(sale.total_making_charge || 0)}</span>
                            </div>

                            <div className="flex justify-between px-2 text-gray-700">
                                <span>Hallmark Charge:</span>
                                <span className="font-medium">{formatCurrency(sale.total_hallmark_charge || 0)}</span>
                            </div>

                            {sale.discount > 0 && (
                                <div className="flex justify-between px-2 text-red-600 border-t border-gray-100 pt-1">
                                    <span>Discount (ডিসকাউন্ট):</span>
                                    <span>-{formatCurrency(sale.discount)}</span>
                                </div>
                            )}

                            {sale.old_gold_exchange_value > 0 && (
                                <div className="flex justify-between px-2 text-green-600">
                                    <span>Old Gold Exch.:</span>
                                    <span>-{formatCurrency(sale.old_gold_exchange_value)}</span>
                                </div>
                            )}

                            <div className="flex justify-between px-2 py-2 border-t-2 border-gray-800 font-bold text-lg mt-1">
                                <span>Receivable Amount:</span>
                                <span>{formatCurrency(sale.grand_total)}</span>
                            </div>

                            <div className="flex justify-between px-2 pt-1 text-gray-600">
                                <span>Paid (জমা):</span>
                                <span>{formatCurrency(sale.paid_amount)}</span>
                            </div>
                            
                            <div className="flex justify-between px-2 py-1 bg-gray-100 font-bold">
                                <span>Due (বকেয়া):</span>
                                <span className={sale.due_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {formatCurrency(sale.due_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Content */}
                <div className="flex-shrink-0 mt-8">
                    <div className="px-10 pb-6 grid grid-cols-2 gap-8 items-end">
                        <div className="text-xs text-gray-600 whitespace-pre-line">
                            {invoice_terms && (
                                <>
                                    <p className="font-bold mb-1 underline">Terms & Conditions:</p>
                                    <p>{invoice_terms}</p>
                                </>
                            )}
                        </div>
                        <div className="flex justify-between space-x-12">
                            <div className="text-center w-full">
                                <div className="border-t border-gray-400 pt-2">Customer Signature</div>
                            </div>
                            <div className="text-center w-full">
                                <div className="border-t border-gray-400 pt-2">Authorized Signature</div>
                            </div>
                        </div>
                    </div>
                    
                    {invoice_use_footer === '1' && invoice_footer ? (
                        <img 
                            src={`/storage/${invoice_footer}`} 
                            alt="Footer" 
                            className="w-full object-cover"
                            style={{ maxHeight: '100px' }}
                        />
                    ) : (
                        <div className="bg-[#b17633] text-white text-center py-2 text-xs">
                            Thank you for your business! | Powered by Jewelry ERP
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
