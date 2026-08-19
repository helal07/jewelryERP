import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { Trash2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, payments, filters = {} }) {
    const [paymentNo, setPaymentNo] = useState(filters.payment_no || '');

    useFilter(route('hrm.salary-payment.index'), {
        payment_no: paymentNo,
    });

    const handleReset = () => {
        setPaymentNo('');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Salary Payments" />

            <div className="-m-6 p-6 bg-[#FEF9E7] min-h-screen">
                <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">Salary Payments History</h2>
                </div>

                <div className="bg-[#FEF9E7] border border-amber-200/60 rounded-xl p-4 shadow-sm pb-24">
                    <div className="text-sm font-semibold text-gray-700 mb-3">All {payments.total}</div>
                    
                    {/* Filter Area */}
                    <div className="bg-[#FDEEDC] rounded-xl p-5 mb-5 border border-amber-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] text-gray-500 mb-1">Payment No</label>
                                    <input 
                                        type="text" 
                                        value={paymentNo}
                                        onChange={(e) => setPaymentNo(e.target.value)}
                                        className="w-full border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-9 text-sm" 
                                    />
                                </div>
                                <div className="flex items-end mb-0.5">
                                    <button 
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-200 transition-all text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="overflow-x-auto custom-scrollbar rounded-t-lg shadow-sm border border-gray-200">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#E88A1A] text-white">
                                <tr>
                                    <th className="px-4 py-3.5 font-bold">SL</th>
                                    <th className="px-4 py-3.5 font-bold">Payment No</th>
                                    <th className="px-4 py-3.5 font-bold">Date</th>
                                    <th className="px-4 py-3.5 font-bold">Staff Name</th>
                                    <th className="px-4 py-3.5 font-bold">Method</th>
                                    <th className="px-4 py-3.5 font-bold">Amount</th>
                                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {payments.data.map((payment, index) => (
                                    <tr key={payment.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-4 py-3 text-gray-600 font-medium">
                                            {(payments.current_page - 1) * payments.per_page + index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">{payment.payment_no}</td>
                                        <td className="px-4 py-3 text-gray-800">
                                            {new Date(payment.payment_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">{payment.staff?.name}</td>
                                        <td className="px-4 py-3 text-gray-600 capitalize">{payment.payment_method}</td>
                                        <td className="px-4 py-3 text-emerald-700 font-bold">
                                            BDT {parseFloat(payment.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150"
                                                    >
                                                        Actions
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link 
                                                        href={route('hrm.salary.destroy', payment.id)} 
                                                        method="delete" 
                                                        as="button"
                                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Payment
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {payments.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500 font-medium">
                                            No payment records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Standard Reusable Pagination Component */}
                    <Pagination links={payments.links} from={payments.from} to={payments.to} total={payments.total} />

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
