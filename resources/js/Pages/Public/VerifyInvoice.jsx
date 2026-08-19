import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PrintA4 from '@/Pages/Sales/PrintA4';
import { ShieldCheck } from 'lucide-react';

export default function VerifyInvoice({ sale, settings }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <Head title={`Verified Invoice - ${sale.invoice_no}`} />
            
            {/* Top Verification Banner */}
            <div className="w-full bg-green-600 text-white shadow-md mb-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-6 w-6" />
                        <span className="font-semibold text-lg tracking-wide">Authentic Invoice Verified</span>
                    </div>
                    <div className="text-sm opacity-90">
                        {sale.branch?.name}
                    </div>
                </div>
            </div>

            {/* Display the Invoice */}
            <div className="flex-1 w-full flex justify-center pb-12 overflow-auto" style={{ zoom: 0.9 }}>
                <div className="pointer-events-none">
                    <PrintA4 sale={sale} settings={settings} />
                </div>
            </div>
            
            <style>{`
                /* Hide the print button when in verification mode */
                .no-print { display: none !important; }
            `}</style>
        </div>
    );
}
