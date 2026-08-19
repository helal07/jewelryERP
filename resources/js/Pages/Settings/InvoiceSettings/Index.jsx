import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, settings }) {
    const { data, setData, post, processing, errors, progress } = useForm({
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
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Invoice Settings</h2>}
        >
            <Head title="Invoice Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <form onSubmit={submit} className="space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Header Configuration</h3>
                                            
                                            <div className="flex items-center mb-4">
                                                <input
                                                    id="invoice_use_letterhead"
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#00b4d8] bg-gray-100 border-gray-300 rounded focus:ring-[#00b4d8]"
                                                    checked={data.invoice_use_letterhead}
                                                    onChange={(e) => setData('invoice_use_letterhead', e.target.checked)}
                                                />
                                                <label htmlFor="invoice_use_letterhead" className="ml-2 text-sm font-medium text-gray-900">
                                                    Enable Uploaded Letterhead (Overrides default text header)
                                                </label>
                                            </div>

                                            <div className="mt-4">
                                                <InputLabel htmlFor="invoice_letterhead" value="Letterhead Image (PNG/JPG, ideal width ~800px)" />
                                                <input
                                                    id="invoice_letterhead"
                                                    type="file"
                                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00b4d8]/10 file:text-[#00b4d8] hover:file:bg-[#00b4d8]/20"
                                                    onChange={(e) => handleFileChange(e, 'invoice_letterhead')}
                                                    accept="image/*"
                                                />
                                                {errors.invoice_letterhead && <p className="text-red-500 text-xs mt-1">{errors.invoice_letterhead}</p>}
                                                {progress && (
                                                  <progress value={progress.percentage} max="100" className="w-full mt-2">
                                                    {progress.percentage}%
                                                  </progress>
                                                )}
                                                {previewHeader && (
                                                    <div className="mt-2">
                                                        <img src={previewHeader} alt="Header Preview" className="h-20 object-contain border rounded" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Footer Configuration</h3>
                                            
                                            <div className="flex items-center mb-4">
                                                <input
                                                    id="invoice_use_footer"
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#00b4d8] bg-gray-100 border-gray-300 rounded focus:ring-[#00b4d8]"
                                                    checked={data.invoice_use_footer}
                                                    onChange={(e) => setData('invoice_use_footer', e.target.checked)}
                                                />
                                                <label htmlFor="invoice_use_footer" className="ml-2 text-sm font-medium text-gray-900">
                                                    Enable Uploaded Footer
                                                </label>
                                            </div>

                                            <div className="mt-4">
                                                <InputLabel htmlFor="invoice_footer" value="Footer Image (PNG/JPG, ideal width ~800px)" />
                                                <input
                                                    id="invoice_footer"
                                                    type="file"
                                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00b4d8]/10 file:text-[#00b4d8] hover:file:bg-[#00b4d8]/20"
                                                    onChange={(e) => handleFileChange(e, 'invoice_footer')}
                                                    accept="image/*"
                                                />
                                                {errors.invoice_footer && <p className="text-red-500 text-xs mt-1">{errors.invoice_footer}</p>}
                                                {previewFooter && (
                                                    <div className="mt-2">
                                                        <img src={previewFooter} alt="Footer Preview" className="h-20 object-contain border rounded" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Content</h3>
                                            
                                            <div className="flex items-center mb-4">
                                                <input
                                                    id="invoice_show_qr"
                                                    type="checkbox"
                                                    className="w-4 h-4 text-[#00b4d8] bg-gray-100 border-gray-300 rounded focus:ring-[#00b4d8]"
                                                    checked={data.invoice_show_qr}
                                                    onChange={(e) => setData('invoice_show_qr', e.target.checked)}
                                                />
                                                <label htmlFor="invoice_show_qr" className="ml-2 text-sm font-medium text-gray-900">
                                                    Enable QR Code Printing for Verification
                                                </label>
                                            </div>

                                            <div className="mt-4">
                                                <InputLabel htmlFor="invoice_terms" value="Terms & Conditions (in Bengali or English)" />
                                                <textarea
                                                    id="invoice_terms"
                                                    className="mt-1 block w-full border-gray-300 focus:border-[#00b4d8] focus:ring-[#00b4d8] rounded-md shadow-sm"
                                                    rows="4"
                                                    value={data.invoice_terms}
                                                    onChange={(e) => setData('invoice_terms', e.target.value)}
                                                />
                                                {errors.invoice_terms && <p className="text-red-500 text-xs mt-1">{errors.invoice_terms}</p>}
                                            </div>
                                            
                                            <div className="mt-6">
                                                <InputLabel htmlFor="whatsapp_template" value="WhatsApp Message Template" />
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Use placeholders: [Customer Name], [Shop Name], [Invoice No], [Grand Total], [Paid Amount], [Due Amount], [Public Invoice URL]
                                                </p>
                                                <textarea
                                                    id="whatsapp_template"
                                                    className="mt-1 block w-full border-gray-300 focus:border-[#00b4d8] focus:ring-[#00b4d8] rounded-md shadow-sm"
                                                    rows="5"
                                                    value={data.whatsapp_template}
                                                    onChange={(e) => setData('whatsapp_template', e.target.value)}
                                                    placeholder="Dear [Customer Name], thank you for your purchase from [Shop Name]. &#10;Invoice No: [Invoice No]&#10;Total Amount: [Grand Total]&#10;Paid: [Paid Amount]&#10;Due: [Due Amount]&#10;View / Download full invoice: [Public Invoice URL]"
                                                />
                                                {errors.whatsapp_template && <p className="text-red-500 text-xs mt-1">{errors.whatsapp_template}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-4 pt-4 border-t">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:opacity-90 active:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150"
                                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                                    >
                                        Save Invoice Settings
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
