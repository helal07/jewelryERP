import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import Dropdown from '@/Components/Dropdown';
import { useState } from 'react';
import { Edit, Trash2, Plus, Layers, FolderTree, Package, ChevronRight, AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function Index({ categories, parentCategories }) {
    const { t } = useLanguage();
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
            alert(`Cannot delete category "${category.name}" because it contains ${category.products_count} product(s). Please reassign or delete the products first.`);
            return;
        }

        if (category.children && category.children.length > 0) {
            alert(`Cannot delete category "${category.name}" because it has ${category.children.length} sub-category(ies). Please remove or reassign sub-categories first.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
            setDeletingId(category.id);
            router.delete(route('product-categories.destroy', category.id), {
                preserveScroll: true,
                onFinish: () => {
                    setDeletingId(null);
                },
                onError: (errors) => {
                    alert(errors.message || 'An error occurred while deleting the category.');
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {t('productCategories')}
                    </h2>
                    <Link
                        href={route('product-categories.create')}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                        style={{ backgroundColor: 'rgb(177,118,51)' }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addProduct') ? 'Add Category' : 'Add Category'}
                    </Link>
                </div>
            }
        >
            <Head title={t('productCategories')} />

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
                            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md"
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
                            className="text-rose-600 hover:text-rose-800 p-1 rounded-md"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100">
                    <div className="overflow-x-auto min-h-[300px] pb-32">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metal Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub-categories</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {categories.data.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50/80 transition-colors">
                                        {/* Category Name + Code */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200/50">
                                                    {category.parent_id ? (
                                                        <FolderTree className="h-5 w-5 text-indigo-500" />
                                                    ) : (
                                                        <Layers className="h-5 w-5 text-indigo-600" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{category.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{category.code}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Parent */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.parent ? (
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <ChevronRight className="w-3 h-3 mr-1 text-gray-400" />
                                                    {category.parent.name}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Root category</span>
                                            )}
                                        </td>

                                        {/* Metal Type */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${metalTypeColors[category.metal_type] || 'bg-gray-100 text-gray-600'}`}>
                                                {category.metal_type ? (category.metal_type.charAt(0).toUpperCase() + category.metal_type.slice(1)) : 'N/A'}
                                            </span>
                                        </td>

                                        {/* Products Count */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900">{category.products_count}</span>
                                            </div>
                                        </td>

                                        {/* Sub-categories Count */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-700">{category.children?.length || 0}</span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                    >
                                                        Actions
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('product-categories.edit', category.id)} className="flex items-center text-gray-700">
                                                        <Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit Category
                                                    </Dropdown.Link>
                                                    <div className="border-t border-gray-100"></div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(category)}
                                                        disabled={deletingId === category.id}
                                                        className="flex items-center w-full px-4 py-2 text-start text-sm leading-5 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition duration-150 ease-in-out font-medium cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                                                        {deletingId === category.id ? 'Deleting...' : 'Delete'}
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
                                            <p className="text-gray-500 font-medium">No categories found.</p>
                                            <p className="text-gray-400 text-sm mt-1">Create your first product category.</p>
                                            <Link
                                                href={route('product-categories.create')}
                                                className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Category
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.links && categories.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium">{categories.from}</span> to <span className="font-medium">{categories.to}</span> of <span className="font-medium">{categories.total}</span> categories
                            </p>
                            <div className="flex items-center gap-1">
                                {categories.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                            link.active
                                                ? 'bg-indigo-600 text-white font-semibold'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        preserveState
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
