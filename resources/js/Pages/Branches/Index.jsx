import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import { Building2, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ branches = { data: [] }, is_main_branch }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const { flash, auth } = usePage().props;
    const canManageBranch = is_main_branch ?? auth?.is_main_branch ?? true;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Building2 className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('branches')}
                    </h2>

                    {canManageBranch ? (
                        <Link
                            href={route('branches.create')}
                            className="px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer hover:opacity-90 active:opacity-100"
                            style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                        >
                            <Plus className="w-4 h-4" />
                            {isBn ? 'নতুন শাখা যোগ করুন' : 'Add Branch'}
                        </Link>
                    ) : (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-amber-700" />
                            {isBn ? 'শুধুমাত্র প্রধান শাখা' : 'Main Branch Only'}
                        </span>
                    )}
                </div>
            }
        >
            <Head title={t('branches')} />

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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 pb-24 min-h-[350px]">
                <div className="overflow-x-visible min-h-[300px]">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#e68a1d] text-white">
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('branchName') || 'Branch Name'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('code') || 'Code'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('type') || 'Type'}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('status')}</th>
                                <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {branches?.data && branches.data.length > 0 ? (
                                branches.data.map((branch) => (
                                    <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-2.5 px-3.5 font-bold text-gray-900">{branch.name}</td>
                                        <td className="py-2.5 px-3.5 font-medium text-gray-600">{isBn ? toBn(branch.code) : branch.code}</td>
                                        <td className="py-2.5 px-3.5">
                                            {branch.is_head_office ? (
                                                <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-100/70 text-amber-900 border border-amber-200/60">
                                                    {t('headOffice') || 'Head Office'}
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-gray-100 text-gray-700">
                                                    {t('branch')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3.5">
                                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                                branch.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                            }`}>
                                                {t(branch.status) || branch.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3.5 text-right">
                                            {canManageBranch ? (
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                        >
                                                            {t('actions')}
                                                            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48" className="py-1 bg-white shadow-xl rounded-xl border border-gray-100">
                                                        <Link
                                                            href={route('branches.edit', branch.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="block w-full px-4 py-2 text-start text-xs font-bold text-gray-700 hover:bg-gray-100 focus:outline-none flex items-center gap-2 cursor-pointer transition"
                                                        >
                                                            <Edit className="w-3.5 h-3.5 text-blue-600" /> {t('edit')}
                                                        </Link>
                                                        <Link 
                                                            href={route('branches.destroy', branch.id)} 
                                                            method="delete" 
                                                            as="button"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="block w-full px-4 py-2 text-start text-xs font-bold text-rose-600 hover:bg-rose-50 focus:outline-none flex items-center gap-2 cursor-pointer transition"
                                                            onBefore={() => confirm(isBn ? 'আপনি কি নিশ্চিত যে এই শাখাটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this branch?')}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> {t('delete')}
                                                        </Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            ) : (
                                                <span className="text-gray-400 font-medium text-[11px]">{isBn ? 'শুধু দেখুন' : 'View Only'}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                        {isBn ? 'কোনো শাখা পাওয়া যায়নি' : 'No branches found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {branches?.links && branches.links.length > 3 && (
                    <div className="mt-4 border-t border-gray-100 pt-3">
                        <Pagination links={branches.links} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
