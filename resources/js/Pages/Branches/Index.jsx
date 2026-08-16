import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { Building2, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ branches, is_main_branch }) {
    const { t } = useLanguage();
    const { flash, auth } = usePage().props;
    const canManageBranch = is_main_branch ?? auth?.is_main_branch ?? true;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Building2 className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('branches') || 'Branches'}
                    </h2>

                    {canManageBranch ? (
                        <Link
                            href={route('branches.create')}
                            className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Branch
                        </Link>
                    ) : (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-amber-700" />
                            Main Branch Only
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Branches" />

            {flash?.success && (
                <div className="mb-4 font-semibold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="mb-4 font-semibold text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
                    {flash.error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm pb-16">
                <div className="overflow-visible min-h-[350px]">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase border-b border-gray-100">
                                <th className="py-3.5 px-4">Name</th>
                                <th className="py-3.5 px-4">Code</th>
                                <th className="py-3.5 px-4">Type</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {branches.data && branches.data.length > 0 ? (
                                branches.data.map((branch) => (
                                    <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-gray-900">{branch.name}</td>
                                        <td className="py-3.5 px-4 font-medium text-gray-600">{branch.code}</td>
                                        <td className="py-3.5 px-4">
                                            {branch.is_head_office ? (
                                                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-100/70 text-amber-900">
                                                    Head Office
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-gray-100 text-gray-700">
                                                    Branch
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                                branch.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                            }`}>
                                                {branch.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {canManageBranch ? (
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border rounded-xl text-xs font-bold bg-white hover:bg-amber-50 transition cursor-pointer shadow-2xs"
                                                            style={{ color: 'rgb(177,118,51)', borderColor: 'rgba(177,118,51,0.4)' }}
                                                        >
                                                            Actions
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48" className="py-1 bg-white shadow-xl rounded-xl border border-gray-100">
                                                        <Link
                                                            href={route('branches.edit', branch.id)}
                                                            className="w-full text-left px-4 py-2 text-xs text-gray-800 hover:bg-amber-50 flex items-center gap-2 font-bold cursor-pointer transition"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" /> Edit
                                                        </Link>
                                                        <Link 
                                                            href={route('branches.destroy', branch.id)} 
                                                            method="delete" 
                                                            as="button"
                                                            className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold cursor-pointer transition"
                                                            onBefore={() => confirm('Are you sure you want to delete this branch?')}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-600" /> Delete
                                                        </Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            ) : (
                                                <span className="text-gray-400 font-medium text-[11px]">View Only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                        No branches found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
