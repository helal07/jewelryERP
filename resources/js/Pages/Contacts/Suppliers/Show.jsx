import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ supplier }) {
    const [activeTab, setActiveTab] = useState('info');

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{supplier.company_name}</h2>}
        >
            <Head title={`Supplier - ${supplier.company_name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex space-x-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'info' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Supplier Information
                        </button>
                        <button
                            onClick={() => setActiveTab('purchase')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'purchase' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Purchase History
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {activeTab === 'info' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Code</p>
                                        <p className="font-medium text-gray-900">{supplier.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Company Name</p>
                                        <p className="font-medium text-gray-900">{supplier.company_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Contact Person</p>
                                        <p className="font-medium text-gray-900">{supplier.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{supplier.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{supplier.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">{supplier.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Opening Balance</p>
                                        <p className="font-medium text-gray-900">BDT {Number(supplier.opening_balance || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Due Balance</p>
                                        <p className="font-medium text-red-600">BDT {Number(supplier.due_balance || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'purchase' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase History</h3>
                                <p className="text-gray-500">No purchase history available yet.</p>
                                {/* Table for purchase history will go here */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
