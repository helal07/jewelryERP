import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ mortgageCustomer }) {
    const [activeTab, setActiveTab] = useState('info');

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{mortgageCustomer.name}</h2>}
        >
            <Head title={`Mortgage Customer - ${mortgageCustomer.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex space-x-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'info' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Mortgage Customer Information
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'history' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Mortgage History
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {activeTab === 'info' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Code</p>
                                        <p className="font-medium text-gray-900">{mortgageCustomer.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{mortgageCustomer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{mortgageCustomer.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">NID Number</p>
                                        <p className="font-medium text-gray-900">{mortgageCustomer.nid_number || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">{mortgageCustomer.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Mortgage History</h3>
                                <p className="text-gray-500">No mortgage history available yet.</p>
                                {/* Table for mortgage history will go here */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
