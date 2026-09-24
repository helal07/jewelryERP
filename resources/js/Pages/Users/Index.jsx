import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import useFilter from '@/Hooks/useFilter';
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ users = { data: [] }, filters = {} }) {
    const { flash } = usePage().props;
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const [search, setSearch] = useState(filters?.search || '');

    useFilter(route('users.index'), { search });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('users')}
                    </h2>
                </div>
            }
        >
            <Head title={t('users')} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                        {flash.success}
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="w-full sm:w-72">
                        <input 
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="w-full border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl text-sm shadow-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Link
                        href={route('users.create')}
                        className="inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-90 active:opacity-100 transition cursor-pointer"
                        style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                    >
                        <Plus className="w-4 h-4" />
                        {t('addNew')}
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 pb-24 min-h-[350px]">
                    <div className="overflow-x-visible min-h-[300px]">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('name') || 'Name'}</th>
                                    <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('role') || 'Role'}</th>
                                    <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('branch')}</th>
                                    <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap">{t('status')}</th>
                                    <th className="py-2.5 px-3.5 text-[11px] font-bold uppercase whitespace-nowrap text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.data && users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="py-2.5 px-3.5 whitespace-nowrap text-gray-600">
                                                {user.roles && user.roles.length > 0 ? (
                                                    <span className="px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                                        {t(user.roles[0].name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())) || user.roles[0].name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="py-2.5 px-3.5 whitespace-nowrap text-xs text-gray-600">
                                                {user.branch ? user.branch.name : (t('headOffice') || 'Super Admin / All')}
                                            </td>
                                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                    {user.status === 'active' ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-medium">
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

                                                    <Dropdown.Content align="right" width="48">
                                                        <Dropdown.Link 
                                                            href={route('users.edit', user.id)}
                                                            onClick={(e) => e.stopPropagation()} 
                                                            className="flex items-center text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <Edit className="w-3.5 h-3.5 mr-2 text-blue-600" /> {t('edit')}
                                                        </Dropdown.Link>
                                                        <div className="border-t border-gray-100"></div>
                                                        <Dropdown.Link 
                                                            href={route('users.destroy', user.id)} 
                                                            method="delete" 
                                                            as="button"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="flex items-center !text-rose-600 hover:!bg-rose-50 w-full text-left cursor-pointer"
                                                            onBefore={() => confirm(isBn ? 'আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this user?')}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2" /> {t('delete')}
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                            {isBn ? 'কোনো ব্যবহারকারী পাওয়া যায়নি' : 'No users found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {users?.links && users.links.length > 3 && (
                        <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
                            <Pagination links={users.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
