import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import { Eye, Edit, Trash2, Plus, Search, Filter, Printer, Gem, X } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function Index({ products, categories, filters }) {
    const { t, lang, toBn } = useLanguage();
    const isBn = lang === 'bn';
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Debounced search
    const handleSearch = useCallback((value) => {
        setSearch(value);
        const timeout = setTimeout(() => {
            router.get(route('products.index'), { ...filters, search: value }, {
                preserveState: true,
                preserveScroll: true,
                only: ['products'],
            });
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters]);

    const handleFilter = (key, value) => {
        router.get(route('products.index'), { ...filters, [key]: value || undefined }, {
            preserveState: true,
            preserveScroll: true,
            only: ['products'],
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get(route('products.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleProductSelection = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.data.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.data.map(p => p.id));
        }
    };

    const metalTypeColors = {
        gold: 'bg-amber-100 text-amber-800 border-amber-200',
        silver: 'bg-gray-100 text-gray-700 border-gray-200',
        platinum: 'bg-blue-100 text-blue-800 border-blue-200',
        diamond: 'bg-purple-100 text-purple-800 border-purple-200',
        mixed: 'bg-teal-100 text-teal-800 border-teal-200',
    };

    const hasActiveFilters = filters?.search || filters?.category_id || filters?.metal_type || filters?.status;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                        <Gem className="w-7 h-7 text-[#b17633]" />
                        {t('productList')}
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedProducts.length > 0 && (
                            <Link
                                href={route('products.print-labels.preview') + '?' + selectedProducts.map(id => `product_ids[]=${id}`).join('&')}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                {t('Print Labels')} ({isBn ? toBn(selectedProducts.length) : selectedProducts.length})
                            </Link>
                        )}
                        <Link
                            href={route('products.create')}
                            className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addProduct')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={t('productList')} />

            <div className="pb-12 space-y-4">
                {/* Filters Bar */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder={t('Search by name, SKU, barcode...')}
                                className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:border-[#b17633] focus:ring-[#b17633]/20 text-sm"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={filters?.category_id || ''}
                            onChange={e => handleFilter('category_id', e.target.value)}
                            className="border-gray-300 rounded-lg focus:border-[#b17633] focus:ring-[#b17633]/20 text-sm py-2 min-w-[150px]"
                        >
                            <option value="">{t('All Categories')}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{t(cat.name)}</option>
                            ))}
                        </select>

                        {/* Metal Type Filter */}
                        <select
                            value={filters?.metal_type || ''}
                            onChange={e => handleFilter('metal_type', e.target.value)}
                            className="border-gray-300 rounded-lg focus:border-[#b17633] focus:ring-[#b17633]/20 text-sm py-2 min-w-[130px]"
                        >
                            <option value="">{t('All Metals')}</option>
                            <option value="gold">{t('Gold')}</option>
                            <option value="silver">{t('Silver')}</option>
                            <option value="platinum">{t('Platinum')}</option>
                            <option value="diamond">{t('Diamond')}</option>
                            <option value="mixed">{t('Mixed')}</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filters?.status || ''}
                            onChange={e => handleFilter('status', e.target.value)}
                            className="border-gray-300 rounded-lg focus:border-[#b17633] focus:ring-[#b17633]/20 text-sm py-2 min-w-[120px]"
                        >
                            <option value="">{t('All Status')}</option>
                            <option value="active">{t('Active')}</option>
                            <option value="inactive">{t('Inactive')}</option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4 mr-1" />
                                {t('Clear')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Table Card */}
                <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4 pb-12 min-h-[350px]">
                    <div className="overflow-x-auto min-h-[320px] pb-40">
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-2.5 py-2.5 text-center rounded-l-lg w-8">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === products.data.length && products.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-3.5 h-3.5 text-[#b17633] border-gray-300 rounded focus:ring-[#b17633]"
                                        />
                                    </th>
                                    <th className="px-2 py-2 text-left text-[11px] font-bold text-white whitespace-nowrap">{t('Date')}</th>
                                    <th className="px-2 py-2 text-left text-[11px] font-bold text-white whitespace-nowrap">{t('Category')}</th>
                                    <th className="px-2 py-2 text-left text-[11px] font-bold text-white whitespace-nowrap">{t('Product Name')}</th>
                                    <th className="px-2 py-2 text-center text-[11px] font-bold text-white whitespace-nowrap">{t('Type')}</th>
                                    <th className="px-2 py-2 text-center text-[11px] font-bold text-white whitespace-nowrap">{t('Purity')}</th>
                                    <th className="px-2 py-2 text-left text-[11px] font-bold text-white whitespace-nowrap">{t('Pr. Code')}</th>
                                    <th className="px-2 py-2 text-right text-[11px] font-bold text-white whitespace-nowrap">{t('Weight/vori')}</th>
                                    <th className="px-2 py-2 text-right text-[11px] font-bold text-white whitespace-nowrap">{t('Weight/gm')}</th>
                                    <th className="px-2 py-2 text-right text-[11px] font-bold text-white whitespace-nowrap">{t('Price')}</th>
                                    <th className="px-2 py-2 text-center text-[11px] font-bold text-white whitespace-nowrap">{t('Photo')}</th>
                                    <th className="px-2 py-2 text-center text-[11px] font-bold text-white whitespace-nowrap">{t('Status')}</th>
                                    <th className="px-2 py-2 text-center text-[11px] font-bold text-white whitespace-nowrap">{t('In-stock')}</th>
                                    <th className="px-2 py-2 text-center text-[11px] font-bold text-white whitespace-nowrap rounded-r-lg">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100 font-medium">
                                {products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-amber-50/40 transition-colors">
                                        <td className="px-2.5 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.id)}
                                                onChange={() => toggleProductSelection(product.id)}
                                                className="w-3.5 h-3.5 text-[#b17633] border-gray-300 rounded focus:ring-[#b17633]"
                                            />
                                        </td>
                                        
                                        {/* Date */}
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <div className="text-[11px] text-gray-700">{product.date ? (isBn ? toBn(String(product.date).substring(0, 10)) : String(product.date).substring(0, 10)) : '—'}</div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <div className="text-[11px] text-gray-800 font-semibold">{product.category?.name ? t(product.category.name) : '—'}</div>
                                        </td>
                                        
                                        {/* Product Name */}
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <div className="text-[11px] font-bold text-gray-900">{product.name}</div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-2 py-2 whitespace-nowrap text-center">
                                            <span className={`px-1.5 py-0.2 inline-flex text-[10px] leading-4 font-semibold rounded-full border ${metalTypeColors[product.metal_type] || 'bg-gray-100 text-gray-600'}`}>
                                                {t(product.metal_type || 'N/A')}
                                            </span>
                                        </td>

                                        {/* Purity */}
                                        <td className="px-2 py-2 whitespace-nowrap text-center">
                                            <div className="text-[11px] text-gray-800 font-semibold">{product.purity?.name ? (isBn ? toBn(product.purity.name) : product.purity.name) : '—'}</div>
                                        </td>
                                        
                                        {/* Pr. Code */}
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <div className="text-[11px] text-gray-500 font-mono">{isBn ? toBn(product.sku) : product.sku}</div>
                                        </td>

                                        {/* Weight/vori */}
                                        <td className="px-2 py-2 whitespace-nowrap text-right">
                                            <div className="text-[11px] text-gray-800 font-semibold">
                                                {product.gross_weight ? (isBn ? toBn(parseFloat((product.gross_weight / 11.664).toFixed(3))) : parseFloat((product.gross_weight / 11.664).toFixed(3))) : '—'}
                                            </div>
                                        </td>

                                        {/* Weight/gm */}
                                        <td className="px-2 py-2 whitespace-nowrap text-right">
                                            <div className="text-[11px] font-bold text-gray-900">{product.gross_weight ? (isBn ? toBn(parseFloat(product.gross_weight)) : parseFloat(product.gross_weight)) : '—'}</div>
                                        </td>
                                        
                                        {/* Price */}
                                        <td className="px-2 py-2 whitespace-nowrap text-right">
                                            <div className="text-[11px] text-gray-900 font-bold">
                                                {product.rate_per_vori ? (isBn ? toBn(Number(product.rate_per_vori).toLocaleString()) : Number(product.rate_per_vori).toLocaleString()) : '—'}
                                            </div>
                                        </td>

                                        {/* Photo */}
                                        <td className="px-2 py-2 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center">
                                                {product.image ? (
                                                    <img className="h-7 w-7 rounded-md object-cover border border-gray-200 shadow-2xs" src={`/storage/${product.image}`} alt={product.name} />
                                                ) : (
                                                    <div className="h-7 w-7 rounded-md bg-amber-50 flex items-center justify-center border border-amber-200/50">
                                                        <Gem className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-2 py-2 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full ${product.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {product.status === 'active' ? t('Active') : t('Inactive')}
                                            </span>
                                        </td>

                                        {/* In-stock */}
                                        <td className="px-2 py-2 whitespace-nowrap text-center">
                                            <div className="text-[11px] text-gray-700">{product.stock_type === 'order_stock' ? t('Order Stock') : t('Ready Stock')}</div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-2 py-2 whitespace-nowrap text-center text-xs font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-2.5 py-0.5 border border-[#00b4d8] rounded-full text-[11px] font-semibold text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150 cursor-pointer"
                                                    >
                                                        {t('Actions')}
                                                        <svg className="ml-1 -mr-0.5 h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('products.show', product.id)} className="flex items-center text-gray-700 text-xs">
                                                        <Eye className="w-3.5 h-3.5 mr-2 text-indigo-500" /> {t('View Details')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('products.edit', product.id)} className="flex items-center text-gray-700 text-xs">
                                                        <Edit className="w-3.5 h-3.5 mr-2 text-blue-500" /> {t('Edit Product')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('products.print-label', product.id)} className="flex items-center text-gray-700 text-xs">
                                                        <Printer className="w-3.5 h-3.5 mr-2 text-emerald-500" /> {t('Print Label')}
                                                    </Dropdown.Link>
                                                    <div className="border-t border-gray-100"></div>
                                                    <Dropdown.Link
                                                        href={route('products.destroy', product.id)}
                                                        method="delete"
                                                        as="button"
                                                        className="flex items-center !text-red-600 hover:!bg-red-50 w-full cursor-pointer text-xs"
                                                        onBefore={() => confirm(t('Are you sure?'))}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-2" /> {t('Delete')}
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                                {products.data.length === 0 && (
                                    <tr>
                                        <td colSpan="14" className="px-6 py-16 text-center">
                                            <Gem className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500 font-medium">{t('No products found.')}</p>
                                            <p className="text-gray-400 text-sm mt-1">{t('Create your first product to get started.')}</p>
                                            <Link
                                                href={route('products.create')}
                                                className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                {t('Add Product')}
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.links && (
                        <div className="mt-4 border-t border-gray-100 pt-3">
                            <Pagination links={products.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
