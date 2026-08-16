import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function Edit({ auth, payroll, staffs, branches }) {
    const { data, setData, put, processing, errors } = useForm({
        staff_id: payroll.staff_id || '',
        branch_id: payroll.branch_id || '',
        month: payroll.month || '',
        year: payroll.year || '',
        basic_salary: payroll.basic_salary || '0',
        allowances: payroll.allowances || '0',
        deductions: payroll.deductions || '0',
        status: payroll.status || 'draft',
    });

    const [netSalary, setNetSalary] = useState(payroll.net_salary || 0);

    useEffect(() => {
        const basic = parseFloat(data.basic_salary) || 0;
        const allow = parseFloat(data.allowances) || 0;
        const deduct = parseFloat(data.deductions) || 0;
        setNetSalary(basic + allow - deduct);
    }, [data.basic_salary, data.allowances, data.deductions]);

    const handleStaffChange = (e) => {
        const staffId = e.target.value;
        const staff = staffs.find(s => s.id == staffId);
        setData(prev => ({
            ...prev,
            staff_id: staffId,
            branch_id: staff ? staff.branch_id : prev.branch_id,
            basic_salary: staff ? staff.basic_salary : '0'
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('hrm.payroll.update', payroll.id));
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Payroll</h2>}
        >
            <Head title="Edit Payroll" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6">
                        <Link href={route('hrm.payroll.index')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Payrolls
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6 max-w-3xl">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Staff */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="staff_id" value="Staff Member *" />
                                        <SelectInput
                                            id="staff_id"
                                            value={data.staff_id}
                                            onChange={handleStaffChange}
                                            className="mt-1 block w-full"
                                            required
                                            disabled // Usually shouldn't change staff for an existing payroll record
                                        >
                                            <option value="">Select Staff</option>
                                            {staffs.map(staff => (
                                                <option key={staff.id} value={staff.id}>{staff.name} ({staff.employee_code})</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.staff_id} className="mt-2" />
                                    </div>

                                    {/* Branch */}
                                    <div>
                                        <InputLabel htmlFor="branch_id" value="Branch *" />
                                        <SelectInput
                                            id="branch_id"
                                            value={data.branch_id}
                                            onChange={(e) => setData('branch_id', e.target.value)}
                                            className="mt-1 block w-full bg-gray-50"
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.branch_id} className="mt-2" />
                                    </div>

                                    {/* Month */}
                                    <div>
                                        <InputLabel htmlFor="month" value="Month *" />
                                        <SelectInput
                                            id="month"
                                            value={data.month}
                                            onChange={(e) => setData('month', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        >
                                            {months.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.month} className="mt-2" />
                                    </div>

                                    {/* Year */}
                                    <div>
                                        <InputLabel htmlFor="year" value="Year *" />
                                        <TextInput
                                            id="year"
                                            type="number"
                                            value={data.year}
                                            onChange={(e) => setData('year', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.year} className="mt-2" />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <InputLabel htmlFor="status" value="Status *" />
                                        <SelectInput
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="approved">Approved</option>
                                            <option value="paid">Paid</option>
                                        </SelectInput>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2 border-t border-gray-200 my-4 pt-4">
                                        <h4 className="text-md font-medium text-gray-700 flex items-center mb-4">
                                            <Calculator className="w-5 h-5 mr-2 text-indigo-500"/>
                                            Salary Details
                                        </h4>
                                    </div>

                                    {/* Basic Salary */}
                                    <div>
                                        <InputLabel htmlFor="basic_salary" value="Basic Salary *" />
                                        <TextInput
                                            id="basic_salary"
                                            type="number"
                                            step="0.01"
                                            value={data.basic_salary}
                                            onChange={(e) => setData('basic_salary', e.target.value)}
                                            className="mt-1 block w-full bg-gray-50 font-semibold"
                                            required
                                        />
                                        <InputError message={errors.basic_salary} className="mt-2" />
                                    </div>

                                    {/* Allowances */}
                                    <div>
                                        <InputLabel htmlFor="allowances" value="Allowances" />
                                        <TextInput
                                            id="allowances"
                                            type="number"
                                            step="0.01"
                                            value={data.allowances}
                                            onChange={(e) => setData('allowances', e.target.value)}
                                            className="mt-1 block w-full text-green-600"
                                        />
                                        <InputError message={errors.allowances} className="mt-2" />
                                    </div>

                                    {/* Deductions */}
                                    <div>
                                        <InputLabel htmlFor="deductions" value="Deductions" />
                                        <TextInput
                                            id="deductions"
                                            type="number"
                                            step="0.01"
                                            value={data.deductions}
                                            onChange={(e) => setData('deductions', e.target.value)}
                                            className="mt-1 block w-full text-red-600"
                                        />
                                        <InputError message={errors.deductions} className="mt-2" />
                                    </div>

                                    {/* Net Salary Preview */}
                                    <div>
                                        <InputLabel value="Net Salary (Calculated)" />
                                        <div className="mt-1 w-full py-2 px-3 border border-indigo-200 bg-indigo-50 rounded-md font-bold text-xl text-indigo-700">
                                            BDT {netSalary.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
                                    <PrimaryButton className="ml-4 bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Payroll
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
