import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { ChevronDown, Eye, Edit, Trash2 } from 'lucide-react';

export default function Index({ customers, filters = {} }) {
    const { t } = useLanguage();
    const [search, setSearch] = React.useState(filters.search || '');

    useFilter(route('customers.index'), { search });

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Customers</h2>}
        >
            <Head title="Customers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex w-full md:w-1/3">
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search customers by name, phone or address..."
                                className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-xl shadow-sm text-sm"
                            />
                        </div>
                        <Link
                            href={route('customers.create')}
                            className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors shadow-sm"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            Add Customer
                        </Link>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-lg border border-gray-100 pb-24">
                        <div className="p-0 overflow-x-visible">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchases</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Balance</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Customer: Avatar + Name + Code */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {customer.photo ? (
                                                            <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={`/storage/${customer.photo}`} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                <span className="text-indigo-600 font-bold text-sm">
                                                                    {customer.name.substring(0, 2).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                                                        <div className="text-xs text-gray-500">{customer.code}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact: Phone & Email */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{customer.phone}</div>
                                                {customer.email && (
                                                    <div className="text-xs text-gray-500">{customer.email}</div>
                                                )}
                                            </td>

                                            {/* Address & NID */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700 max-w-[200px] truncate" title={customer.address}>
                                                    {customer.address}
                                                </div>
                                                {customer.nid_number && (
                                                    <div className="text-xs text-gray-400">NID: {customer.nid_number}</div>
                                                )}
                                            </td>

                                            {/* Purchases (Placeholder for now) */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">0</div>
                                                <div className="text-xs text-gray-500">Total Orders</div>
                                            </td>

                                            {/* Due Balance & Limits */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-red-600">
                                                    BDT {Number(customer.due_balance || 0).toLocaleString()}
                                                </div>
                                                {customer.credit_limit > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        Limit: BDT {Number(customer.credit_limit).toLocaleString()}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                    customer.status === 'active' 
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                }`}>
                                                    {customer.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                                                        <Dropdown.Link href={route('customers.show', customer.id)} className="flex items-center text-gray-700">
                                                            <Eye className="w-4 h-4 mr-2 text-indigo-500" /> View Details
                                                        </Dropdown.Link>
                                                        <Dropdown.Link href={route('customers.edit', customer.id)} className="flex items-center text-gray-700">
                                                            <Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit Customer
                                                        </Dropdown.Link>
                                                        <div className="border-t border-gray-100"></div>
                                                        <Dropdown.Link 
                                                            href={route('customers.destroy', customer.id)} 
                                                            method="delete" 
                                                            as="button"
                                                            className="flex items-center !text-red-600 hover:!bg-red-50 w-full"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No customers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-gray-200">
                            {/* Pagination here */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

