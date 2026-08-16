import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import { Search, Plus, User, Phone, FileText, Paperclip, MapPin, ChevronDown, Eye, Edit, Trash2 } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';

export default function Index({ mortgageCustomers }) {
    const { t } = useLanguage();

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mortgage Customers</h2>}
        >
            <Head title="Mortgage Customers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search mortgage customers..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                            />
                        </div>
                        <Link
                            href={route('mortgage-customers.create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:opacity-90 active:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-md transform hover:scale-105"
                            style={{ backgroundColor: 'rgb(177,118,51)' }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Customer
                        </Link>
                    </div>

                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-0 overflow-visible">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & NID</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Docs</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mortgageCustomers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Customer Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {customer.photo ? (
                                                            <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={`/storage/${customer.photo}`} alt={customer.name} />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                                                                <User className="h-5 w-5 text-indigo-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                        <div className="text-xs text-gray-500">{customer.code}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact & NID */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900 mb-1">
                                                    <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                    {customer.phone}
                                                </div>
                                                {customer.nid_number && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                        NID: {customer.nid_number}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Address */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-start text-sm text-gray-600 max-w-xs truncate" title={customer.address}>
                                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 mt-0.5 shrink-0" />
                                                    <span className="truncate">{customer.address || 'N/A'}</span>
                                                </div>
                                            </td>

                                            {/* Docs */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {customer.attachment ? (
                                                    <a href={`/storage/${customer.attachment}`} target="_blank" rel="noreferrer" className="inline-flex p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="View Attachment">
                                                        <Paperclip className="w-4 h-4" />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                    {customer.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <span className="inline-flex rounded-full">
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-1.5 border border-[#00a3ff] text-sm leading-4 font-semibold rounded-full text-[#00a3ff] bg-white hover:bg-blue-50 focus:outline-none transition ease-in-out duration-150"
                                                            >
                                                                Actions
                                                                <ChevronDown className="ml-1 -mr-0.5 h-4 w-4" aria-hidden="true" />
                                                            </button>
                                                        </span>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48">
                                                        <Dropdown.Link href={route('mortgage-customers.show', customer.id)} className="flex items-center text-gray-700">
                                                            <Eye className="w-4 h-4 mr-2 text-indigo-500" /> View
                                                        </Dropdown.Link>
                                                        <Dropdown.Link href={route('mortgage-customers.edit', customer.id)} className="flex items-center text-gray-700">
                                                            <Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit
                                                        </Dropdown.Link>
                                                        <Dropdown.Link 
                                                            href={route('mortgage-customers.destroy', customer.id)} 
                                                            method="delete" 
                                                            as="button"
                                                            className="flex items-center text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                                                        </Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                    {mortgageCustomers.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No mortgage customers found.
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
