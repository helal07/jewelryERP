import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import Dropdown from '@/Components/Dropdown';
import { Eye, Edit, Trash2, Plus, Search, Filter, Printer, Gem, X } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function Index({ products, categories, filters }) {
    const { t } = useLanguage();
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
                    <h2 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {t('productList')}
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedProducts.length > 0 && (
                            <Link
                                href={route('products.print-labels.preview') + '?' + selectedProducts.map(id => `product_ids[]=${id}`).join('&')}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Labels ({selectedProducts.length})
                            </Link>
                        )}
                        <Link
                            href={route('products.create')}
                            className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
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

            <div className="pb-12">
                {/* Filters Bar */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-4 mb-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder="Search by name, SKU, barcode..."
                                className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={filters?.category_id || ''}
                            onChange={e => handleFilter('category_id', e.target.value)}
                            className="border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 min-w-[150px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        {/* Metal Type Filter */}
                        <select
                            value={filters?.metal_type || ''}
                            onChange={e => handleFilter('metal_type', e.target.value)}
                            className="border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 min-w-[130px]"
                        >
                            <option value="">All Metals</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="platinum">Platinum</option>
                            <option value="diamond">Diamond</option>
                            <option value="mixed">Mixed</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filters?.status || ''}
                            onChange={e => handleFilter('status', e.target.value)}
                            className="border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 min-w-[120px]"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100">
                    <div className="overflow-x-auto min-h-[300px] pb-32">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-[#e68a1d] text-white">
                                    <th className="px-2 py-2.5 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.length === products.data.length && products.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Date</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Category</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Product Name</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Type</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Purity</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Pr. Code</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Weight/vori</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Weight/gm</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Price</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Photo</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">Status</th>
                                    <th className="px-2 py-2 text-left text-[13px] font-bold text-white whitespace-nowrap ">In-stock</th>
                                    <th className="px-2 py-2 text-right text-[13px] font-bold text-white whitespace-nowrap ">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.id)}
                                                onChange={() => toggleProductSelection(product.id)}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                        </td>
                                        
                                        {/* Date */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.date ? String(product.date).substring(0, 10) : '—'}</div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.category?.name || '—'}</div>
                                        </td>
                                        
                                        {/* Product Name */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${metalTypeColors[product.metal_type] || 'bg-gray-100 text-gray-600'}`}>
                                                {product.metal_type?.charAt(0).toUpperCase() + product.metal_type?.slice(1)}
                                            </span>
                                        </td>

                                        {/* Purity */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.purity?.name || '—'}</div>
                                        </td>
                                        
                                        {/* Pr. Code */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 font-mono">{product.sku}</div>
                                        </td>

                                        {/* Weight/vori */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {product.gross_weight ? (product.gross_weight / 11.664).toFixed(3) : '—'}
                                            </div>
                                        </td>

                                        {/* Weight/gm */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{product.gross_weight}</div>
                                        </td>
                                        
                                        {/* Price */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {product.rate_per_vori ? Number(product.rate_per_vori).toLocaleString() : '—'}
                                            </div>
                                        </td>

                                        {/* Photo */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex-shrink-0 h-11 w-11">
                                                {product.image ? (
                                                    <img className="h-11 w-11 rounded-lg object-cover border border-gray-200 shadow-sm" src={`/storage/${product.image}`} alt={product.name} />
                                                ) : (
                                                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200/50">
                                                        <Gem className="h-5 w-5 text-indigo-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.status}
                                            </span>
                                        </td>

                                        {/* In-stock */}
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.stock_type === 'order_stock' ? 'Order Stock' : 'Ready Stock'}</div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150"
                                                    >
                                                        Actions
                                                        <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('products.show', product.id)} className="flex items-center text-gray-700">
                                                        <Eye className="w-4 h-4 mr-2 text-indigo-500" /> View Details
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('products.edit', product.id)} className="flex items-center text-gray-700">
                                                        <Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit Product
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('products.print-label', product.id)} className="flex items-center text-gray-700">
                                                        <Printer className="w-4 h-4 mr-2 text-emerald-500" /> Print Label
                                                    </Dropdown.Link>
                                                    <div className="border-t border-gray-100"></div>
                                                    <Dropdown.Link
                                                        href={route('products.destroy', product.id)}
                                                        method="delete"
                                                        as="button"
                                                        className="flex items-center !text-red-600 hover:!bg-red-50 w-full"
                                                        onBefore={() => confirm('Are you sure you want to delete this product?')}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
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
                                            <p className="text-gray-500 font-medium">No products found.</p>
                                            <p className="text-gray-400 text-sm mt-1">Create your first product to get started.</p>
                                            <Link
                                                href={route('products.create')}
                                                className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                                                style={{ backgroundColor: 'rgb(177,118,51)' }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Product
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.links && products.last_page > 1 && (
                        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium">{products.from}</span> to <span className="font-medium">{products.to}</span> of <span className="font-medium">{products.total}</span> products
                            </p>
                            <div className="flex items-center gap-1">
                                {products.links.map((link, i) => (
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




