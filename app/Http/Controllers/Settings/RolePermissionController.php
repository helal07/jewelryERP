<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    public function index()
    {
        $roles = Role::with(['permissions', 'users'])->orderBy('id', 'asc')->get();
        $permissions = Permission::orderBy('name', 'asc')->get();
        $users = User::with(['roles', 'permissions', 'branch'])->orderBy('id', 'asc')->get();

        // Exact Submenu Serial Definition
        $submenus = [
            [
                'sl' => '01',
                'key' => 'dashboard',
                'name' => 'Dashboard & Analytics',
                'prefixes' => ['dashboard'],
            ],
            [
                'sl' => '02',
                'key' => 'sales',
                'name' => 'Sales Management (Create Sale, Sale List, Returns)',
                'prefixes' => ['sales'],
            ],
            [
                'sl' => '03',
                'key' => 'products',
                'name' => 'Products & Catalog (Products, Categories, Labels)',
                'prefixes' => ['products', 'product_categories'],
            ],
            [
                'sl' => '04',
                'key' => 'purchases',
                'name' => 'Purchases & Suppliers (Purchases, Suppliers)',
                'prefixes' => ['purchases', 'suppliers'],
            ],
            [
                'sl' => '05',
                'key' => 'orders',
                'name' => 'Custom Orders & Deliveries',
                'prefixes' => ['orders'],
            ],
            [
                'sl' => '06',
                'key' => 'mortgages',
                'name' => 'Gold Mortgage & Loan Management',
                'prefixes' => ['mortgages'],
            ],
            [
                'sl' => '07',
                'key' => 'inventory',
                'name' => 'Inventory & Stock Ledger',
                'prefixes' => ['inventory', 'stock'],
            ],
            [
                'sl' => '08',
                'key' => 'accounts',
                'name' => 'Financial Accounts & Vouchers',
                'prefixes' => ['accounts', 'vouchers', 'cheques'],
            ],
            [
                'sl' => '09',
                'key' => 'hrm',
                'name' => 'HRM & Staff Payroll (Staff, Attendance, Payroll)',
                'prefixes' => ['hrm', 'staff', 'attendance', 'payroll'],
            ],
            [
                'sl' => '10',
                'key' => 'reports',
                'name' => 'Reports & Audit Logs',
                'prefixes' => ['reports', 'activity_logs'],
            ],
            [
                'sl' => '11',
                'key' => 'settings',
                'name' => 'Settings (User Permissions, Branch, Metal Price, Purity, Notification, Opening Accounts, Account)',
                'prefixes' => ['settings', 'branches', 'users'],
            ],
        ];

        // Group permissions by submenu serial
        $groupedPermissions = [];
        foreach ($submenus as $menu) {
            $groupedPermissions[$menu['key']] = [
                'sl' => $menu['sl'],
                'name' => $menu['name'],
                'items' => [],
            ];
        }

        foreach ($permissions as $perm) {
            $prefix = explode('.', $perm->name)[0];
            $assignedKey = 'settings'; // default

            foreach ($submenus as $menu) {
                if (in_array($prefix, $menu['prefixes'])) {
                    $assignedKey = $menu['key'];
                    break;
                }
            }

            $parts = explode('.', $perm->name);
            $actionLabel = count($parts) > 1 
                ? ucfirst(str_replace('_', ' ', implode(' ', array_slice($parts, 1)))) 
                : $perm->name;

            $groupedPermissions[$assignedKey]['items'][] = [
                'id' => $perm->id,
                'name' => $perm->name,
                'label' => $actionLabel,
                'prefix' => $prefix,
            ];
        }

        // Filter out empty submenus
        $groupedPermissions = array_filter($groupedPermissions, fn($item) => count($item['items']) > 0);

        return Inertia::render('Settings/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'users' => $users,
            'groupedPermissions' => array_values($groupedPermissions),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $roleName = strtolower(str_replace(' ', '_', trim($validated['name'])));
        $role = Role::create(['name' => $roleName]);

        if (!empty($validated['permissions'])) {
            $perms = Permission::whereIn('id', $validated['permissions'])->get();
            $role->syncPermissions($perms);
        }

        return redirect()->route('settings.roles.index')
            ->with('success', 'New role created successfully.');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if (!in_array($role->name, ['super_administrator', 'super-admin'])) {
            $roleName = strtolower(str_replace(' ', '_', trim($validated['name'])));
            $role->update(['name' => $roleName]);
        }

        $perms = Permission::whereIn('id', $validated['permissions'] ?? [])->get();
        $role->syncPermissions($perms);

        // Reset permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->route('settings.roles.index')
            ->with('success', 'Role permissions updated successfully.');
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'direct_permissions' => 'nullable|array',
            'direct_permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $user->syncRoles([$role]);

        if (isset($validated['direct_permissions'])) {
            $perms = Permission::whereIn('id', $validated['direct_permissions'])->get();
            $user->syncPermissions($perms);
        }

        // Reset permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return redirect()->route('settings.roles.index')
            ->with('success', 'User permissions updated successfully.');
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, ['super_administrator', 'super-admin', 'branch_administrator'])) {
            return redirect()->back()->with('error', 'Core system roles cannot be deleted.');
        }

        $role->delete();

        return redirect()->route('settings.roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
