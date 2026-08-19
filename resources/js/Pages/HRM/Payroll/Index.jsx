import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { Edit2, Trash2, CreditCard, RotateCcw } from 'lucide-react';

export default function Index({ auth, payrolls }) {
    const params = new URLSearchParams(window.location.search);
    const [month, setMonth] = useState(params.get('month') || '');
    const [year, setYear] = useState(params.get('year') || '');

    useFilter(route('hrm.payroll.index'), {
        month,
        year,
    });

    const handleReset = () => {
        setMonth('');
        setYear('');
    };

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Payroll" />

            <div className="-m-6 p-6 bg-[#FEF9E7] min-h-screen">
                <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">Payroll Lists</h2>
                    <Link
                        href={route('hrm.payroll.create')}
                        className="px-4 py-1.5 bg-[#E88A1A] hover:bg-orange-600 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
                    >
                        Add New
                    </Link>
                </div>

                <div className="bg-[#FEF9E7] border border-amber-200/60 rounded-xl p-4 shadow-sm pb-24">
                    <div className="text-sm font-semibold text-gray-700 mb-3">All {payrolls.total}</div>
                    
                    {/* Filter Area */}
                    <div className="bg-[#FDEEDC] rounded-xl p-5 mb-5 border border-amber-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-[11px] text-gray-500 mb-1">Month</label>
                                <select 
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-9 text-sm" 
                                >
                                    <option value="">Select Month</option>
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] text-gray-500 mb-1">Year</label>
                                    <select 
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-9 text-sm" 
                                    >
                                        <option value="">Select Year</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                    </select>
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
                                    <th className="px-4 py-3.5 font-bold">Period</th>
                                    <th className="px-4 py-3.5 font-bold">Staff Name</th>
                                    <th className="px-4 py-3.5 font-bold">Branch Name</th>
                                    <th className="px-4 py-3.5 font-bold">Net Salary</th>
                                    <th className="px-4 py-3.5 font-bold">Status</th>
                                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {payrolls.data.map((payroll, index) => (
                                    <tr key={payroll.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-4 py-3 text-gray-600 font-medium">
                                            {(payrolls.current_page - 1) * payrolls.per_page + index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">
                                            {months.find(m => m.value == payroll.month)?.label} {payroll.year}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">{payroll.staff?.name}</td>
                                        <td className="px-4 py-3 text-gray-800">{payroll.branch?.name || 'Main'}</td>
                                        <td className="px-4 py-3 text-gray-800 font-bold">
                                            BDT {parseFloat(payroll.net_salary).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white
                                                ${payroll.status === 'paid' ? 'bg-teal-700' : 
                                                payroll.status === 'approved' ? 'bg-blue-600' : 'bg-gray-500'}`}>
                                                {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                                            </span>
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
                                                    <Dropdown.Link href={route('hrm.salary.create', { payroll_id: payroll.id })} className="flex items-center px-4 py-2 text-sm text-teal-700 hover:bg-teal-50">
                                                        <CreditCard className="w-4 h-4 mr-2 text-teal-600" /> Pay Salary
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('hrm.payroll.edit', payroll.id)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> Edit Payroll
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('hrm.payroll.destroy', payroll.id)} method="delete" as="button" className="flex items-center w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                                                        <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Payroll
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {payrolls.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500 font-medium">
                                            No payroll records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Standard Reusable Pagination Component */}
                    <Pagination links={payrolls.links} from={payrolls.from} to={payrolls.to} total={payrolls.total} />

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
