import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { 
    User, Phone, MapPin, 
    Briefcase, ArrowLeft, Save,
    Wrench, DollarSign, Activity,
    FileText, Image as ImageIcon, Paperclip
} from 'lucide-react';

export default function Edit({ artisan }) {
    const { t } = useLanguage();

    const { data, setData, post, processing, errors } = useForm({
        name: artisan.name || '',
        phone: artisan.phone || '',
        address: artisan.address || '',
        specialization: artisan.specialization || '',
        wage_type: artisan.wage_type || 'per_gram',
        rate: artisan.rate || '',
        status: artisan.status || 'active',
        nid_number: artisan.nid_number || '',
        photo: null,
        attachment: null,
        _method: 'put',
    });

    const [photoPreview, setPhotoPreview] = useState(
        artisan.photo ? `/storage/${artisan.photo}` : null
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
        post(route('artisans.update', artisan.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {t('editArtisan') || 'Edit Artisan'} - {artisan.name}
                    </h2>
                    <Link 
                        href={route('artisans.index')}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('back', 'Back')}
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Artisan - ${artisan.name}`} />

            <div className="max-w-5xl mx-auto pb-12 mt-6">
                <form onSubmit={submit} className="space-y-8">
                    
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="p-6 md:p-8">
                            
                            {/* General Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Artisan Name <span className="text-red-500">*</span>
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
                                            placeholder="Enter artisan name"
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

                                {/* Specialization */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialization
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Wrench className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.specialization}
                                            onChange={e => setData('specialization', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                                            placeholder="e.g. Ring Maker, Polisher"
                                        />
                                    </div>
                                    {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
                                </div>

                                {/* Wage Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Wage Type
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Activity className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            value={data.wage_type}
                                            onChange={e => setData('wage_type', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                                        >
                                            <option value="per_gram">Per Gram</option>
                                            <option value="per_item">Per Piece</option>
                                            <option value="fixed">Fixed Monthly/Weekly</option>
                                        </select>
                                    </div>
                                    {errors.wage_type && <p className="mt-1 text-sm text-red-600">{errors.wage_type}</p>}
                                </div>

                                {/* Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Wage Rate
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-medium sm:text-sm">BDT </span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.rate}
                                            onChange={e => setData('rate', e.target.value)}
                                            style={{ paddingLeft: '2.75rem' }}
                                            className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.rate && <p className="mt-1 text-sm text-red-600">{errors.rate}</p>}
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
                                            Artisan Photo
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
                                        {artisan.attachment && !data.attachment && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                Current file: <a href={`/storage/${artisan.attachment}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View File</a>
                                            </div>
                                        )}
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
                                            Active Artisan
                                        </label>
                                        <p className="text-gray-500 mt-1">Enable this to allow operations for this artisan.</p>
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
                                {processing ? 'Saving...' : 'Update Artisan'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}

