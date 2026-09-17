import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FileText, Save, CheckCircle2, Image, QrCode, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ auth, settings = {} }) {
    const { t, lang } = useLanguage();
    const isBn = lang === 'bn';
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, progress, recentlySuccessful } = useForm({
        invoice_terms: settings.invoice_terms || '',
        invoice_show_qr: settings.invoice_show_qr === '1',
        invoice_use_letterhead: settings.invoice_use_letterhead === '1',
        invoice_use_footer: settings.invoice_use_footer === '1',
        whatsapp_template: settings.whatsapp_template || '',
        invoice_letterhead: null,
        invoice_footer: null,
    });

    const [previewHeader, setPreviewHeader] = useState(settings.invoice_letterhead ? `/storage/${settings.invoice_letterhead}` : null);
    const [previewFooter, setPreviewFooter] = useState(settings.invoice_footer ? `/storage/${settings.invoice_footer}` : null);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setData(field, file);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === 'invoice_letterhead') setPreviewHeader(reader.result);
                if (field === 'invoice_footer') setPreviewFooter(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.invoice-settings.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <FileText className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('invoiceSettings')}
                    </h2>
                </div>
            }
        >
            <Head title={t('invoiceSettings')} />

            <div className="max-w-5xl space-y-6">
                {flash?.success && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Visual Assets */}
                        <div className="space-y-6">
                            {/* Header / Letterhead Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                    <Image className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {isBn ? 'ইনভয়েস প্যাড / লেটারহেড' : 'Header / Letterhead'}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        id="invoice_use_letterhead"
                                        type="checkbox"
                                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                                        checked={data.invoice_use_letterhead}
                                        onChange={(e) => setData('invoice_use_letterhead', e.target.checked)}
                                    />
                                    <label htmlFor="invoice_use_letterhead" className="text-xs font-bold text-gray-800 cursor-pointer">
                                        {isBn ? 'লেটারহেড ইমেজ সক্রিয় করুন' : 'Enable Uploaded Letterhead Image'}
                                    </label>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    {isBn ? 'সক্রিয় থাকলে ইনভয়েসের উপরিভাগে টেক্সট হেডার পরিবর্তন হয়ে এই প্যাড বসবে' : 'When enabled, uploaded letterhead replaces default store text header.'}
                                </p>

                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        {isBn ? 'লেটারহেড ছবি আপলোড করুন' : 'Letterhead Image (PNG/JPG, ~800px)'}
                                    </label>
                                    <input
                                        type="file"
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100"
                                        onChange={(e) => handleFileChange(e, 'invoice_letterhead')}
                                        accept="image/*"
                                    />
                                    {errors.invoice_letterhead && <p className="text-rose-500 text-xs mt-1">{errors.invoice_letterhead}</p>}
                                    {progress && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                        </div>
                                    )}
                                    {previewHeader && (
                                        <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                                            <img src={previewHeader} alt="Header Preview" className="max-h-24 object-contain rounded" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                    <Image className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {isBn ? 'ইনভয়েস ফুটার ব্যানার' : 'Footer Configuration'}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        id="invoice_use_footer"
                                        type="checkbox"
                                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                                        checked={data.invoice_use_footer}
                                        onChange={(e) => setData('invoice_use_footer', e.target.checked)}
                                    />
                                    <label htmlFor="invoice_use_footer" className="text-xs font-bold text-gray-800 cursor-pointer">
                                        {isBn ? 'ফুটার ইমেজ সক্রিয় করুন' : 'Enable Uploaded Footer Image'}
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        {isBn ? 'ফুটার ছবি আপলোড করুন' : 'Footer Image (PNG/JPG, ~800px)'}
                                    </label>
                                    <input
                                        type="file"
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100"
                                        onChange={(e) => handleFileChange(e, 'invoice_footer')}
                                        accept="image/*"
                                    />
                                    {errors.invoice_footer && <p className="text-rose-500 text-xs mt-1">{errors.invoice_footer}</p>}
                                    {previewFooter && (
                                        <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                                            <img src={previewFooter} alt="Footer Preview" className="max-h-24 object-contain rounded" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Verification & Messaging */}
                        <div className="space-y-6">
                            {/* Verification & Terms Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                    <QrCode className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {isBn ? 'কিউআর কোড ও শর্তাবলী' : 'QR Verification & Terms'}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        id="invoice_show_qr"
                                        type="checkbox"
                                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                                        checked={data.invoice_show_qr}
                                        onChange={(e) => setData('invoice_show_qr', e.target.checked)}
                                    />
                                    <label htmlFor="invoice_show_qr" className="text-xs font-bold text-gray-800 cursor-pointer">
                                        {isBn ? 'ভেরিফিকেশনের জন্য কিউআর কোড প্রিন্ট করুন' : 'Enable QR Code Printing for Verification'}
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        {isBn ? 'ইনভয়েসের শর্তাবলী (বাংলা বা ইংরেজিতে)' : 'Terms & Conditions (in Bengali or English)'}
                                    </label>
                                    <textarea
                                        className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                        rows="4"
                                        value={data.invoice_terms}
                                        onChange={(e) => setData('invoice_terms', e.target.value)}
                                        placeholder={isBn ? '১. বিক্রিত পণ্য ৭ দিনের মধ্যে পরিবর্তনযোগ্য।\n২. স্বর্ণের ক্যারেট হলমার্কিং দ্বারা নিশ্চিত করা হয়েছে।' : '1. Sold goods are exchangeable within 7 days.\n2. Gold purity is hallmarked.'}
                                    />
                                    {errors.invoice_terms && <p className="text-rose-500 text-xs mt-1">{errors.invoice_terms}</p>}
                                </div>
                            </div>

                            {/* WhatsApp Template Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                    <MessageSquare className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {isBn ? 'হোয়াটসঅ্যাপ মেসেজ টেমপ্লেট' : 'WhatsApp Message Template'}
                                    </h3>
                                </div>

                                <div>
                                    <p className="text-[11px] text-gray-500 mb-2">
                                        {isBn ? 'ব্যবহারযোগ্য ট্যাগ: [Customer Name], [Shop Name], [Invoice No], [Grand Total], [Paid Amount], [Due Amount], [Public Invoice URL]' : 'Placeholders: [Customer Name], [Shop Name], [Invoice No], [Grand Total], [Paid Amount], [Due Amount], [Public Invoice URL]'}
                                    </p>
                                    <textarea
                                        className="w-full text-sm rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 font-mono"
                                        rows="5"
                                        value={data.whatsapp_template}
                                        onChange={(e) => setData('whatsapp_template', e.target.value)}
                                        placeholder="Dear [Customer Name], thank you for your purchase from [Shop Name]. &#10;Invoice No: [Invoice No]&#10;Total Amount: [Grand Total]&#10;Paid: [Paid Amount]&#10;Due: [Due Amount]&#10;View / Download full invoice: [Public Invoice URL]"
                                    />
                                    {errors.whatsapp_template && <p className="text-rose-500 text-xs mt-1">{errors.whatsapp_template}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        {recentlySuccessful && (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4" /> {isBn ? 'ইনভয়েস সেটিংস সংরক্ষিত হয়েছে!' : 'Invoice Settings Saved!'}
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer hover:opacity-90 active:opacity-100"
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        >
                            <Save className="w-4 h-4" />
                            {isBn ? 'ইনভয়েস সেটিংস সংরক্ষণ করুন' : 'Save Invoice Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
