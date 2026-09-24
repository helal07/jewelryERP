import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { 
    User, Phone, MapPin, 
    ArrowLeft, Save, Shield,
    FileText, Image as ImageIcon, Paperclip
} from 'lucide-react';

export default function Create() {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        address: '',
        status: 'active',
        nid_number: '',
        photo: null,
        attachment: null,
    });

    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAttachmentChange = (e) => {
        setData('attachment', e.target.files[0]);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('mortgage-customers.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl" style={{ color: 'rgb(177,118,51)' }}>
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 leading-tight">
                                {isBn ? 'নতুন বন্ধক গ্রাহক যুক্ত করুন' : 'Add Mortgage Customer'}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {isBn ? 'স্বর্ণ বন্ধকী গ্রাহকের বিস্তারিত তথ্য দিন' : 'Enter gold mortgage customer personal details'}
                            </p>
                        </div>
                    </div>
                    <Link 
                        href={route('mortgage-customers.index')}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isBn ? 'তালিকায় ফিরুন' : 'Back to List'}</span>
                    </Link>
                </div>
            }
        >
            <Head title={isBn ? 'নতুন বন্ধক গ্রাহক' : 'Add Mortgage Customer'} />

            <div className="max-w-5xl mx-auto pb-12 mt-4">
                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'গ্রাহকের নাম' : 'Customer Name'} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            style={{ paddingLeft: '2.5rem' }}
                                            className={`block w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50/50 py-2.5 transition-colors ${errors.name ? 'border-rose-500' : ''}`}
                                            placeholder={isBn ? 'গ্রাহকের নাম লিখুন' : 'Enter customer name'}
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'মোবাইল নম্বর' : 'Contact Number'} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            style={{ paddingLeft: '2.5rem' }}
                                            className={`block w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50/50 py-2.5 transition-colors ${errors.phone ? 'border-rose-500' : ''}`}
                                            placeholder={isBn ? 'মোবাইল নম্বর লিখুন' : 'Enter phone number'}
                                            required
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                                </div>

                                {/* NID */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'এনআইডি / পাসপোর্ট নং' : 'NID / Passport No'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.nid_number}
                                            onChange={e => setData('nid_number', e.target.value)}
                                            style={{ paddingLeft: '2.5rem' }}
                                            className="block w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50/50 py-2.5 transition-colors"
                                            placeholder={isBn ? 'জাতীয় পরিচয়পত্র নম্বর' : 'National ID number'}
                                        />
                                    </div>
                                    {errors.nid_number && <p className="mt-1 text-xs text-rose-600">{errors.nid_number}</p>}
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        {isBn ? 'পূর্ণ ঠিকানা' : 'Address'} <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="2"
                                        className={`block w-full rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-xs bg-gray-50/50 p-3 transition-colors ${errors.address ? 'border-rose-500' : ''}`}
                                        placeholder={isBn ? 'গ্রাহকের পূর্ণ ঠিকানা লিখুন' : 'Full address'}
                                        required
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
                                </div>
                            </div>

                            <hr className="my-6 border-gray-100" />

                            {/* Documents & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
                                            <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-amber-600"/>
                                            {isBn ? 'গ্রাহকের ছবি' : 'Customer Photo'}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            {photoPreview && (
                                                <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handlePhotoChange}
                                                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-colors cursor-pointer"
                                            />
                                        </div>
                                        {errors.photo && <p className="mt-1 text-xs text-rose-600">{errors.photo}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
                                            <Paperclip className="w-3.5 h-3.5 mr-1.5 text-amber-600"/>
                                            {isBn ? 'সংযুক্তি ডকুমেন্ট' : 'Attachment Document'}
                                        </label>
                                        <input 
                                            type="file" 
                                            onChange={handleAttachmentChange}
                                            className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors cursor-pointer"
                                        />
                                        {errors.attachment && <p className="mt-1 text-xs text-rose-600">{errors.attachment}</p>}
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-start bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            id="status"
                                            type="checkbox"
                                            checked={data.status === 'active'}
                                            onChange={e => setData('status', e.target.checked ? 'active' : 'inactive')}
                                            className="w-4 h-4 text-amber-600 bg-white border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-3 text-xs">
                                        <label htmlFor="status" className="font-bold text-gray-900 cursor-pointer select-none">
                                            {isBn ? 'সক্রিয় গ্রাহক' : 'Active Customer'}
                                        </label>
                                        <p className="text-gray-500 mt-0.5">
                                            {isBn ? 'এই বন্ধক গ্রাহককে সক্রিয় রাখতে এটি চালু রাখুন।' : 'Enable this to allow mortgage operations for this customer.'}
                                        </p>
                                    </div>
                                    {errors.status && <p className="mt-1 text-xs text-rose-600">{errors.status}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                                className="flex items-center justify-center px-6 py-2.5 text-xs font-bold text-white rounded-xl hover:opacity-90 shadow-sm transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? (isBn ? 'সংরক্ষণ হচ্ছে…' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save Customer')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
