import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    ShieldCheck, Save, CheckCircle2, Users, Check, Plus, Shield, ChevronRight, User
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Index({ roles = [], permissions = [], users = [], groupedPermissions = [] }) {
    const { t } = useLanguage();
    const [selectedUserId, setSelectedUserId] = useState(users.length > 0 ? users[0].id : null);

    const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

    // Form for User Permissions
    const { data: userData, setData: setUserData, put: putUser, processing: userProcessing, recentlySuccessful: userRecentlySuccessful } = useForm({
        role_id: '',
        direct_permissions: [],
    });

    // Sync selected user state
    useEffect(() => {
        if (selectedUser) {
            const userRole = selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles[0].id : (roles.length > 0 ? roles[0].id : '');
            const directPerms = selectedUser.permissions ? selectedUser.permissions.map(p => p.id) : [];
            setUserData({
                role_id: userRole,
                direct_permissions: directPerms,
            });
        }
    }, [selectedUserId]);

    const toggleUserDirectPermission = (permId) => {
        if (userData.direct_permissions.includes(permId)) {
            setUserData('direct_permissions', userData.direct_permissions.filter(id => id !== permId));
        } else {
            setUserData('direct_permissions', [...userData.direct_permissions, permId]);
        }
    };

    const handleSaveUserPermissions = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        putUser(route('settings.roles.update-user', selectedUser.id));
    };

    const formatRoleName = (name) => {
        if (!name) return '';
        return name.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Calculate effective role permissions for selected user
    const currentSelectedUserRoleObj = roles.find(r => r.id === parseInt(userData.role_id)) || (selectedUser && selectedUser.roles ? selectedUser.roles[0] : null);
    const rolePermissionIds = currentSelectedUserRoleObj && currentSelectedUserRoleObj.permissions 
        ? currentSelectedUserRoleObj.permissions.map(p => p.id) 
        : [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7" style={{ color: 'rgb(177, 118, 51)' }} />
                        {t('userPermissions') || 'User Permissions'}
                    </h2>
                </div>
            }
        >
            <Head title="User Permissions" />

            <div className="space-y-6 pb-36">
                {/* 1. USER LIST TABLE */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-4 h-4" style={{ color: 'rgb(177, 118, 51)' }} />
                            System Users ({users.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 font-bold uppercase border-b border-gray-100">
                                    <th className="py-3 px-4">SL</th>
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Branch</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user, idx) => {
                                    const serialNo = String(idx + 1).padStart(2, '0');
                                    const isSelected = selectedUser && selectedUser.id === user.id;
                                    const userRoleName = user.roles && user.roles.length > 0 ? user.roles[0].name : 'No Role';

                                    return (
                                        <tr 
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`cursor-pointer transition-colors ${
                                                isSelected 
                                                    ? 'bg-amber-50/60 font-semibold text-amber-950' 
                                                    : 'hover:bg-gray-50/50 text-gray-700'
                                            }`}
                                        >
                                            <td className="py-3 px-4 font-bold text-gray-500">#{serialNo}</td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-gray-900">{user.name}</div>
                                                <div className="text-[11px] text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {user.branch ? user.branch.name : 'Head Office'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/70 text-amber-900 border border-amber-200/60">
                                                    {formatRoleName(userRoleName)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUserId(user.id)}
                                                    className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                                        isSelected
                                                            ? 'text-white shadow-2xs'
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                                    style={isSelected ? { backgroundColor: 'rgb(177, 118, 51)' } : {}}
                                                >
                                                    Select <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. SELECTED USER PERMISSIONS PANEL */}
                {selectedUser && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">{selectedUser.name}</h3>
                                <p className="text-xs text-gray-500">{selectedUser.email} • {selectedUser.branch ? selectedUser.branch.name : 'Head Office'}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-gray-700 uppercase">Role:</label>
                                <select
                                    value={userData.role_id}
                                    onChange={(e) => setUserData('role_id', e.target.value)}
                                    className="rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-xs font-bold text-gray-800 bg-amber-50/50"
                                >
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {formatRoleName(role.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Submenu Permissions Matrix */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                    <Shield className="w-4 h-4" style={{ color: 'rgb(177, 118, 51)' }} />
                                    Permissions
                                </h4>
                                <div className="flex items-center gap-3 text-xs font-medium">
                                    <span className="flex items-center gap-1 text-emerald-700">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Role Inherited
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-800">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(177, 118, 51)' }}></span> Direct Override
                                    </span>
                                </div>
                            </div>

                            {/* Submenu Grid */}
                            <div className="space-y-3">
                                {groupedPermissions.map((group) => (
                                    <div key={group.sl} className="bg-gray-50/70 rounded-xl p-3.5 border border-gray-100 space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 text-white font-mono font-bold text-[10px] rounded-md" style={{ backgroundColor: 'rgb(177, 118, 51)' }}>
                                                #{group.sl}
                                            </span>
                                            <h5 className="font-bold text-xs text-gray-800">{group.name}</h5>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {group.items.map((perm) => {
                                                const isRoleInherited = rolePermissionIds.includes(perm.id);
                                                const isDirectUserPerm = userData.direct_permissions.includes(perm.id);
                                                const isActive = isRoleInherited || isDirectUserPerm;

                                                return (
                                                    <button
                                                        key={perm.id}
                                                        type="button"
                                                        onClick={() => toggleUserDirectPermission(perm.id)}
                                                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                                            isRoleInherited
                                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                                                : isDirectUserPerm
                                                                    ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs'
                                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                                                        }`}
                                                    >
                                                        <span className="truncate mr-2 font-medium">{perm.label}</span>
                                                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                                                            isRoleInherited 
                                                                ? 'bg-emerald-600 text-white'
                                                                : isDirectUserPerm 
                                                                    ? 'text-white' 
                                                                    : 'bg-gray-200 text-gray-400'
                                                        }`}
                                                        style={isDirectUserPerm && !isRoleInherited ? { backgroundColor: 'rgb(177, 118, 51)' } : {}}
                                                        >
                                                            {isActive ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. BOTTOM ACTION BAR */}
                {selectedUser && (
                    <div className="fixed bottom-6 left-6 right-6 lg:left-72 z-40 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-amber-400" />
                            <div>
                                <span className="text-xs text-gray-400">Selected User:</span>
                                <h4 className="text-sm font-bold text-white leading-none mt-0.5">{selectedUser.name}</h4>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {userRecentlySuccessful && (
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Updated!
                                </span>
                            )}
                            <button
                                onClick={handleSaveUserPermissions}
                                disabled={userProcessing}
                                className="text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:opacity-100"
                                style={{ backgroundColor: 'rgb(177, 118, 51)' }}
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
