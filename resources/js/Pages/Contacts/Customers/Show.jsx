import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ customer }) {
    const [activeTab, setActiveTab] = useState('info');

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{customer.name}</h2>}
        >
            <Head title={`Customer - ${customer.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex space-x-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'info' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Customer Information
                        </button>
                        <button
                            onClick={() => setActiveTab('purchase')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'purchase' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Purchase History
                        </button>
                        <button
                            onClick={() => setActiveTab('due')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'due' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Due Information
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {activeTab === 'info' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Code</p>
                                        <p className="font-medium text-gray-900">{customer.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{customer.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{customer.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">{customer.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">NID Number</p>
                                        <p className="font-medium text-gray-900">{customer.nid_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Opening Balance</p>
                                        <p className="font-medium text-gray-900">BDT {Number(customer.opening_balance || 0).toLocaleString()}</p>
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

                        {activeTab === 'due' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Due Information</h3>
                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                    <p className="text-sm text-red-600">Total Due Balance</p>
                                    <p className="text-2xl font-bold text-red-700">BDT {Number(customer.due_balance || 0).toLocaleString()}</p>
                                </div>
                                <p className="mt-4 text-gray-500">Due history details will be shown here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
