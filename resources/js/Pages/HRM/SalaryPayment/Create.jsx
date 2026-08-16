import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Banknote } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function Create({ auth, payrolls, staffs, branches, selectedPayroll }) {
    const { data, setData, post, processing, errors } = useForm({
        payroll_id: selectedPayroll ? selectedPayroll.id : '',
        staff_id: selectedPayroll ? selectedPayroll.staff_id : '',
        branch_id: selectedPayroll ? selectedPayroll.branch_id : '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: selectedPayroll ? selectedPayroll.net_salary : '',
        payment_method: 'cash',
        notes: '',
    });

    const [currentPayroll, setCurrentPayroll] = useState(selectedPayroll);

    const handlePayrollChange = (e) => {
        const pId = e.target.value;
        const payroll = payrolls.find(p => p.id == pId);
        setCurrentPayroll(payroll);
        setData(prev => ({
            ...prev,
            payroll_id: pId,
            staff_id: payroll ? payroll.staff_id : '',
            branch_id: payroll ? payroll.branch_id : '',
            amount: payroll ? payroll.net_salary : ''
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('hrm.salary.store'));
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
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Record Salary Payment</h2>}
        >
            <Head title="Record Salary Payment" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6">
                        <Link href={route('hrm.salary.index')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Payments
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6 max-w-3xl">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Payroll */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="payroll_id" value="Select Payroll (Approved/Draft) *" />
                                        <SelectInput
                                            id="payroll_id"
                                            value={data.payroll_id}
                                            onChange={handlePayrollChange}
                                            className="mt-1 block w-full border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            required
                                        >
                                            <option value="">Select an unpaid payroll</option>
                                            {payrolls.map(payroll => (
                                                <option key={payroll.id} value={payroll.id}>
                                                    {payroll.staff?.name} - {months.find(m => m.value == payroll.month)?.label} {payroll.year} (Net: BDT {payroll.net_salary})
                                                </option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.payroll_id} className="mt-2" />
                                    </div>

                                    {/* Readonly Staff / Branch info just to show the user */}
                                    {currentPayroll && (
                                        <>
                                            <div>
                                                <InputLabel value="Staff Member" />
                                                <div className="mt-1 p-2 bg-gray-50 rounded-md text-gray-700">
                                                    {currentPayroll.staff?.name} ({currentPayroll.staff?.employee_code})
                                                </div>
                                                {/* Hidden inputs to send the data */}
                                                <input type="hidden" name="staff_id" value={data.staff_id} />
                                            </div>
                                            <div>
                                                <InputLabel value="Net Salary Due" />
                                                <div className="mt-1 p-2 bg-indigo-50 rounded-md text-indigo-700 font-bold">
                                                    BDT {parseFloat(currentPayroll.net_salary).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                                </div>
                                                <input type="hidden" name="branch_id" value={data.branch_id} />
                                            </div>
                                        </>
                                    )}

                                    {/* Date */}
                                    <div>
                                        <InputLabel htmlFor="payment_date" value="Payment Date *" />
                                        <TextInput
                                            id="payment_date"
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.payment_date} className="mt-2" />
                                    </div>

                                    {/* Method */}
                                    <div>
                                        <InputLabel htmlFor="payment_method" value="Payment Method" />
                                        <SelectInput
                                            id="payment_method"
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="mobile_money">Mobile Money</option>
                                        </SelectInput>
                                        <InputError message={errors.payment_method} className="mt-2" />
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <InputLabel htmlFor="amount" value="Amount Paid *" />
                                        <TextInput
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="mt-1 block w-full font-bold text-lg text-emerald-600"
                                            required
                                        />
                                        <InputError message={errors.amount} className="mt-2" />
                                    </div>
                                    
                                    {/* Notes */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="notes" value="Payment Notes" />
                                        <textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            rows="3"
                                            placeholder="Optional remarks about this payment..."
                                        />
                                        <InputError message={errors.notes} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
                                    <PrimaryButton className="ml-4 bg-indigo-600 hover:bg-indigo-700" disabled={processing || !data.payroll_id}>
                                        <Banknote className="w-4 h-4 mr-2" />
                                        Record Payment
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
