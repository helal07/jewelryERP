import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import { useState } from 'react';
import { Edit, Trash2, Plus, Layers, FolderTree, Package, ChevronRight, AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function Index({ categories, parentCategories }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const { flash } = usePage().props;
    const [dismissedFlash, setDismissedFlash] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const metalTypeColors = {
        gold: 'bg-amber-100 text-amber-800 border-amber-200',
        silver: 'bg-gray-100 text-gray-700 border-gray-200',
        platinum: 'bg-blue-100 text-blue-800 border-blue-200',
        diamond: 'bg-purple-100 text-purple-800 border-purple-200',
        mixed: 'bg-teal-100 text-teal-800 border-teal-200',
    };

    const handleDelete = (category) => {
        if (category.products_count > 0) {
            alert(
                isBn
                    ? `"${category.name}" ক্যাটাগরিতে ${toBn(category.products_count)} টি পণ্য রয়েছে তাই এটি ডিলিট করা যাবে না।`
                    : `Cannot delete category "${category.name}" because it contains ${category.products_count} product(s). Please reassign or delete the products first.`
            );
            return;
        }

        if (category.children && category.children.length > 0) {
            alert(
                isBn
                    ? `"${category.name}" ক্যাটাগরির অধীনে ${toBn(category.children.length)} টি সাব-ক্যাটাগরি রয়েছে।`
                    : `Cannot delete category "${category.name}" because it has ${category.children.length} sub-category(ies). Please remove or reassign sub-categories first.`
            );
            return;
        }

        if (window.confirm(isBn ? `আপনি কি "${category.name}" ক্যাটাগরি ডিলিট করতে নিশ্চিত?` : `Are you sure you want to delete category "${category.name}"?`)) {
            setDeletingId(category.id);
            router.delete(route('product-categories.destroy', category.id), {
                preserveScroll: true,
                onFinish: () => {
                    setDeletingId(null);
                },
                onError: (errors) => {
                    alert(errors.message || t('An error occurred while deleting the category.'));
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                        <Layers className="w-7 h-7 text-[#b17633]" />
                        {t('Product Categories')}
                    </h2>
                    <Link
                        href={route('product-categories.create')}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('Add Category')}
                    </Link>
                </div>
            }
        >
            <Head title={t('Product Categories')} />

            <div className="pb-12 space-y-4">
                {/* Flash Messages */}
                {!dismissedFlash && flash?.success && (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm font-medium">{flash.success}</span>
                        </div>
                        <button
                            onClick={() => setDismissedFlash(true)}
                            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {!dismissedFlash && flash?.error && (
                    <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                            <span className="text-sm font-medium">{flash.error}</span>
                        </div>
                        <button
                            onClick={() => setDismissedFlash(true)}
                            className="text-rose-600 hover:text-rose-800 p-1 rounded-md cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[300px] pb-36">
                        <table className="w-full text-xs text-left min-w-[750px]">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-4 py-3 text-left text-[12px] font-bold text-white whitespace-nowrap rounded-l-xl">{t('Category')}</th>
                                    <th className="px-4 py-3 text-left text-[12px] font-bold text-white whitespace-nowrap">{t('Parent')}</th>
                                    <th className="px-4 py-3 text-left text-[12px] font-bold text-white whitespace-nowrap">{t('Metal Type')}</th>
                                    <th className="px-4 py-3 text-left text-[12px] font-bold text-white whitespace-nowrap">{t('Products')}</th>
                                    <th className="px-4 py-3 text-left text-[12px] font-bold text-white whitespace-nowrap">{t('Sub-categories')}</th>
                                    <th className="px-4 py-3 text-center text-[12px] font-bold text-white whitespace-nowrap rounded-r-xl">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {categories.data.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50/80 transition-colors">
                                        {/* Category Name + Code */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                             <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-200/50">
                                                    {category.parent_id ? (
                                                        <FolderTree className="h-5 w-5 text-amber-700" />
                                                    ) : (
                                                        <Layers className="h-5 w-5 text-amber-600" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{t(category.name)}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{isBn ? toBn(category.code) : category.code}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Parent */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {category.parent ? (
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <ChevronRight className="w-3 h-3 mr-1 text-gray-400" />
                                                    {t(category.parent.name)}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">{t('Root category')}</span>
                                            )}
                                        </td>

                                        {/* Metal Type */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${metalTypeColors[category.metal_type] || 'bg-gray-100 text-gray-600'}`}>
                                                {category.metal_type ? t(category.metal_type) : '—'}
                                            </span>
                                        </td>

                                        {/* Products Count */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900">{isBn ? toBn(category.products_count) : category.products_count}</span>
                                            </div>
                                        </td>

                                        {/* Sub-categories Count */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-700">{isBn ? toBn(category.children?.length || 0) : (category.children?.length || 0)}</span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                    >
                                                        {t('Actions')}
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('product-categories.edit', category.id)} className="flex items-center text-gray-700">
                                                        <Edit className="w-4 h-4 mr-2 text-blue-500" /> {t('Edit Category')}
                                                    </Dropdown.Link>
                                                    <div className="border-t border-gray-100"></div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(category);
                                                        }}
                                                        disabled={deletingId === category.id}
                                                        className="flex items-center w-full px-4 py-2 text-start text-sm leading-5 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition duration-150 ease-in-out font-medium cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                                                        {deletingId === category.id ? (isBn ? 'ডিলিট হচ্ছে...' : 'Deleting...') : t('Delete')}
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {categories.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <Layers className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500 font-medium">{t('No categories found.')}</p>
                                            <p className="text-gray-400 text-sm mt-1">{t('Create your first product category.')}</p>
                                            <Link
                                                href={route('product-categories.create')}
                                                className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                {t('Add Category')}
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.links && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                            <Pagination links={categories.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
