import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function Create({ auth, branches }) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        employee_code: '',
        name: '',
        designation: '',
        department: '',
        phone: '',
        address: '',
        nid_number: '',
        joining_date: '',
        salary_type: 'fixed',
        basic_salary: '0',
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrm.staff.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add New Staff</h2>}
        >
            <Head title="Add Staff" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6">
                        <Link href={route('hrm.staff.index')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Staff List
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6 max-w-4xl">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Branch */}
                                    <div>
                                        <InputLabel htmlFor="branch_id" value="Branch *" />
                                        <SelectInput
                                            id="branch_id"
                                            value={data.branch_id}
                                            onChange={(e) => setData('branch_id', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.branch_id} className="mt-2" />
                                    </div>

                                    {/* Employee Code */}
                                    <div>
                                        <InputLabel htmlFor="employee_code" value="Employee Code *" />
                                        <TextInput
                                            id="employee_code"
                                            value={data.employee_code}
                                            onChange={(e) => setData('employee_code', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.employee_code} className="mt-2" />
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <InputLabel htmlFor="name" value="Name *" />
                                        <TextInput
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    {/* Designation */}
                                    <div>
                                        <InputLabel htmlFor="designation" value="Designation" />
                                        <TextInput
                                            id="designation"
                                            value={data.designation}
                                            onChange={(e) => setData('designation', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.designation} className="mt-2" />
                                    </div>

                                    {/* Department */}
                                    <div>
                                        <InputLabel htmlFor="department" value="Department" />
                                        <TextInput
                                            id="department"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.department} className="mt-2" />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <InputLabel htmlFor="phone" value="Phone" />
                                        <TextInput
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    {/* NID */}
                                    <div>
                                        <InputLabel htmlFor="nid_number" value="NID Number" />
                                        <TextInput
                                            id="nid_number"
                                            value={data.nid_number}
                                            onChange={(e) => setData('nid_number', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.nid_number} className="mt-2" />
                                    </div>

                                    {/* Joining Date */}
                                    <div>
                                        <InputLabel htmlFor="joining_date" value="Joining Date" />
                                        <TextInput
                                            id="joining_date"
                                            type="date"
                                            value={data.joining_date}
                                            onChange={(e) => setData('joining_date', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.joining_date} className="mt-2" />
                                    </div>

                                    {/* Salary Type */}
                                    <div>
                                        <InputLabel htmlFor="salary_type" value="Salary Type *" />
                                        <SelectInput
                                            id="salary_type"
                                            value={data.salary_type}
                                            onChange={(e) => setData('salary_type', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        >
                                            <option value="fixed">Fixed</option>
                                            <option value="commission">Commission</option>
                                        </SelectInput>
                                        <InputError message={errors.salary_type} className="mt-2" />
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
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.basic_salary} className="mt-2" />
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
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="resigned">Resigned</option>
                                        </SelectInput>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    
                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="address" value="Address" />
                                        <textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            rows="3"
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ml-4 bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Staff
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
