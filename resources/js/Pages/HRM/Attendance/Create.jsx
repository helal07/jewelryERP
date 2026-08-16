import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function Create({ auth, staffs, branches }) {
    const { data, setData, post, processing, errors } = useForm({
        staff_id: '',
        branch_id: '',
        attendance_date: new Date().toISOString().split('T')[0],
        check_in: '',
        check_out: '',
        status: 'present',
        remarks: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrm.attendance.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mark Attendance</h2>}
        >
            <Head title="Mark Attendance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6">
                        <Link href={route('hrm.attendance.index')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Attendance
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6 max-w-2xl">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Staff */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="staff_id" value="Staff Member *" />
                                        <SelectInput
                                            id="staff_id"
                                            value={data.staff_id}
                                            onChange={(e) => {
                                                const staffId = e.target.value;
                                                const staff = staffs.find(s => s.id == staffId);
                                                setData(prev => ({ ...prev, staff_id: staffId, branch_id: staff ? staff.branch_id : prev.branch_id }));
                                            }}
                                            className="mt-1 block w-full"
                                            required
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

                                    {/* Date */}
                                    <div>
                                        <InputLabel htmlFor="attendance_date" value="Date *" />
                                        <TextInput
                                            id="attendance_date"
                                            type="date"
                                            value={data.attendance_date}
                                            onChange={(e) => setData('attendance_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.attendance_date} className="mt-2" />
                                    </div>

                                    {/* Status */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="status" value="Status *" />
                                        <SelectInput
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        >
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                            <option value="half_day">Half Day</option>
                                            <option value="leave">Leave</option>
                                            <option value="holiday">Holiday</option>
                                        </SelectInput>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>

                                    {/* Check In */}
                                    <div>
                                        <InputLabel htmlFor="check_in" value="Check In Time" />
                                        <TextInput
                                            id="check_in"
                                            type="time"
                                            value={data.check_in}
                                            onChange={(e) => setData('check_in', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.check_in} className="mt-2" />
                                    </div>

                                    {/* Check Out */}
                                    <div>
                                        <InputLabel htmlFor="check_out" value="Check Out Time" />
                                        <TextInput
                                            id="check_out"
                                            type="time"
                                            value={data.check_out}
                                            onChange={(e) => setData('check_out', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.check_out} className="mt-2" />
                                    </div>
                                    
                                    {/* Remarks */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="remarks" value="Remarks" />
                                        <TextInput
                                            id="remarks"
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.remarks} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ml-4 bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Attendance
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
