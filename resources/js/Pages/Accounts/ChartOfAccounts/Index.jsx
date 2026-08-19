import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Dropdown from '@/Components/Dropdown';
import useFilter from '@/Hooks/useFilter';
import { Plus, Wallet, Trash2, Edit2, FolderTree, Search, Filter, RotateCcw, CornerDownRight, CheckCircle2, XCircle } from 'lucide-react';

export default function Index({ accounts, allAccounts = [], filters = {} }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editAccount, setEditAccount] = useState(null);

    const [search, setSearch] = useState(filters.search || '');
    const [accountType, setAccountType] = useState(filters.account_type || '');

    useFilter(route('accounts.chart-of-accounts.index'), {
        search,
        account_type: accountType,
    });

    const handleReset = () => {
        setSearch('');
        setAccountType('');
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        account_type: 'asset',
        parent_id: '',
        opening_balance: 0,
        description: '',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        setEditAccount(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (account) => {
        setEditAccount(account);
        setData({
            code: account.code,
            name: account.name,
            account_type: account.account_type,
            parent_id: account.parent_id || '',
            opening_balance: account.opening_balance,
            description: account.description || '',
            is_active: account.is_active ?? true,
        });
        setIsCreateOpen(true);
    };

    const closeModal = () => {
        setIsCreateOpen(false);
        setEditAccount(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editAccount) {
            put(route('accounts.chart-of-accounts.update', editAccount.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('accounts.chart-of-accounts.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this account?')) {
            router.delete(route('accounts.chart-of-accounts.destroy', id));
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'asset': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'liability': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'equity': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'income': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'expense': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FolderTree className="w-7 h-7 text-[#E88A1A]" />
                            Chart of Accounts
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage general ledger accounts, parent relationships & opening balances</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-[#E88A1A] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Account
                    </button>
                </div>
            }
        >
            <Head title="Chart of Accounts" />

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by code or account name..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        />
                    </div>

                    <div className="w-48">
                        <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                            className="w-full text-sm rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A]"
                        >
                            <option value="">All Account Types</option>
                            <option value="asset">Asset</option>
                            <option value="liability">Liability</option>
                            <option value="equity">Equity</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" /> Clear
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pb-24">
                <div className="overflow-visible">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#E88A1A] text-white">
                            <tr>
                                <th className="px-4 py-3.5 font-bold rounded-tl-lg">Code</th>
                                <th className="px-4 py-3.5 font-bold">Account Name</th>
                                <th className="px-4 py-3.5 font-bold">Type</th>
                                <th className="px-4 py-3.5 font-bold">Parent Account</th>
                                <th className="px-4 py-3.5 font-bold">Description</th>
                                <th className="px-4 py-3.5 font-bold text-right">Opening Balance</th>
                                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                                <th className="px-4 py-3.5 font-bold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {accounts.data.map((acc) => (
                                <tr key={acc.id} className="hover:bg-amber-50/40 transition-colors">
                                    <td className="px-4 py-3.5 font-mono font-bold text-gray-700">{acc.code}</td>
                                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                                        <div className="flex items-center gap-1.5">
                                            {acc.parent_id && <CornerDownRight className="w-3.5 h-3.5 text-amber-500 ml-2" />}
                                            <span className={acc.parent_id ? 'text-gray-700 font-normal' : 'font-bold text-gray-900'}>{acc.name}</span>
                                            {acc.is_system && (
                                                <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border">System</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${getTypeBadgeClass(acc.account_type)}`}>
                                            {acc.account_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-600">{acc.parent ? acc.parent.name : '-'}</td>
                                    <td className="px-4 py-3.5 text-gray-500 max-w-[200px] truncate" title={acc.description}>
                                        {acc.description || '-'}
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-bold text-gray-800">
                                        BDT {Number(acc.opening_balance).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        {acc.is_active ? (
                                            <span className="px-2 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-full border border-gray-200 inline-flex items-center gap-1">
                                                <XCircle className="w-3 h-3" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-medium">
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
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(acc)}
                                                    className="block w-full text-start px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none flex items-center cursor-pointer"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> Edit Account
                                                </button>
                                                {!acc.is_system && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(acc.id)}
                                                        className="block w-full text-start px-4 py-2 text-sm leading-5 text-rose-600 hover:bg-rose-50 focus:outline-none flex items-center cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Account
                                                    </button>
                                                )}
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                            {accounts.data.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500 font-medium">
                                        No accounts match your filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={accounts.links} from={accounts.from} to={accounts.to} total={accounts.total} />
            </div>

            {/* Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gray-900/60 backdrop-blur-sm">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-up my-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editAccount ? 'Edit Account' : 'Add New Account'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Account Code *</label>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                                            placeholder="e.g. 1040"
                                            required
                                        />
                                        {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Account Type *</label>
                                        <select
                                            value={data.account_type}
                                            onChange={(e) => setData('account_type', e.target.value)}
                                            className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm capitalize"
                                            required
                                        >
                                            <option value="asset">Asset</option>
                                            <option value="liability">Liability</option>
                                            <option value="equity">Equity</option>
                                            <option value="income">Income</option>
                                            <option value="expense">Expense</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Account Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                                        placeholder="e.g. Cash in Hand, SBI Bank Account"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Sub-category</label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm"
                                        placeholder="Optional description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Opening Balance (BDT)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.opening_balance}
                                        onChange={(e) => setData('opening_balance', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 focus:border-[#E88A1A] focus:ring-[#E88A1A] text-sm font-bold text-gray-900"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-[#E88A1A] focus:ring-[#E88A1A]"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Account is Active</label>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#E88A1A] hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-colors"
                                    >
                                        {editAccount ? 'Update Account' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
