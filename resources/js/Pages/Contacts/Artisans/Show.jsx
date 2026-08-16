import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ artisan }) {
    const [activeTab, setActiveTab] = useState('info');

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{artisan.name}</h2>}
        >
            <Head title={`Artisan - ${artisan.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex space-x-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'info' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Artisan Information
                        </button>
                        <button
                            onClick={() => setActiveTab('assigned')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'assigned' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Assigned Work
                        </button>
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={`py-2 px-4 font-medium text-sm ${activeTab === 'payment' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Payment History
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {activeTab === 'info' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Artisan Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Code</p>
                                        <p className="font-medium text-gray-900">{artisan.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{artisan.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Specialization</p>
                                        <p className="font-medium text-gray-900">{artisan.specialization || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{artisan.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">{artisan.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Wage Type & Rate</p>
                                        <p className="font-medium text-gray-900">{artisan.wage_type ? `${artisan.wage_type.replace('_', ' ')} @ ${artisan.rate}` : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Opening Balance</p>
                                        <p className="font-medium text-gray-900">BDT {Number(artisan.opening_balance || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Due Balance</p>
                                        <p className="font-medium text-red-600">BDT {Number(artisan.due_balance || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'assigned' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Work</h3>
                                <p className="text-gray-500">No assigned work history available yet.</p>
                                {/* Table for assigned orders/production will go here */}
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
                                <p className="text-gray-500">No payment history available yet.</p>
                                {/* Table for payments will go here */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
