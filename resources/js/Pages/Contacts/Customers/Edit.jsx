import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { 
    User, Phone, MapPin, CreditCard, 
    Wallet, FileText, Image as ImageIcon, 
    Paperclip, CheckCircle, ArrowLeft, Save
} from 'lucide-react';

export default function Edit({ customer }) {
    const { t } = useLanguage();

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        nid_number: customer.nid_number || '',
        opening_balance: customer.opening_balance || '',
        credit_limit: customer.credit_limit || '',
        status: customer.status || 'active',
        photo: null,
        attachment: null,
    });

    const [photoPreview, setPhotoPreview] = useState(
        customer.photo ? `/storage/${customer.photo}` : null
    );

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
        post(route('customers.update', customer.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {t('editCustomer', 'Edit Customer')}
                    </h2>
                    <Link 
                        href={route('customers.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('back', 'Back')}
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Customer - ${customer.name}`} />

            <div className="max-w-5xl mx-auto pb-12">
                <form onSubmit={submit} className="space-y-8">
                    
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="p-6 md:p-8">
                            
                            {/* General & Financial Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors ${errors.name ? 'border-red-500' : ''}`}
                                            placeholder="Enter contact name"
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors ${errors.phone ? 'border-red-500' : ''}`}
                                            placeholder="Enter contact number"
                                            required
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                </div>

                                {/* Opening Balance */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Opening Balance
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm font-medium">BDT </span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.opening_balance}
                                            onChange={e => setData('opening_balance', e.target.value)}
                                            style={{ paddingLeft: '2.5rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-white transition-colors"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.opening_balance && <p className="mt-1 text-sm text-red-600">{errors.opening_balance}</p>}
                                </div>

                                {/* Credit Limit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Credit Limit
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.credit_limit}
                                            onChange={e => setData('credit_limit', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-white transition-colors"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.credit_limit && <p className="mt-1 text-sm text-red-600">{errors.credit_limit}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                                            placeholder="Optional email"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* NID/Passport */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        NID / Passport No
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.nid_number}
                                            onChange={e => setData('nid_number', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                                            placeholder="National ID or Passport"
                                        />
                                    </div>
                                    {errors.nid_number && <p className="mt-1 text-sm text-red-600">{errors.nid_number}</p>}
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="2"
                                        className={`block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors ${errors.address ? 'border-red-500' : ''}`}
                                        placeholder="Full address"
                                        required
                                    />
                                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                                </div>
                            </div>

                            <hr className="my-8 border-gray-200" />

                            {/* Documents & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* File Uploads */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <ImageIcon className="w-4 h-4 mr-2 text-indigo-500"/>
                                            Customer Photo
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {photoPreview && (
                                                <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300 shrink-0">
                                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handlePhotoChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                                            />
                                        </div>
                                        {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Paperclip className="w-4 h-4 mr-2 text-indigo-500"/>
                                            Attachment Document
                                        </label>
                                        <input 
                                            type="file" 
                                            onChange={handleAttachmentChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors cursor-pointer"
                                        />
                                        {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex items-center h-5 mt-1">
                                        <input
                                            id="status"
                                            type="checkbox"
                                            checked={data.status === 'active'}
                                            onChange={e => setData('status', e.target.checked ? 'active' : 'inactive')}
                                            className="w-5 h-5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="status" className="font-semibold text-gray-900 cursor-pointer select-none">
                                            Active Customer
                                        </label>
                                        <p className="text-gray-500 mt-1">Enable this to allow transactions and operations for this customer. If unchecked, they will be hidden from selections.</p>
                                    </div>
                                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}

