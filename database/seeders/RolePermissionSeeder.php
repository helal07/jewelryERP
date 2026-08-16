<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Branches & Users
            'branches.view', 'branches.create', 'branches.edit', 'branches.delete',
            'users.view', 'users.create', 'users.edit', 'users.delete',

            // Products & Categories
            'products.view', 'products.create', 'products.edit', 'products.delete', 'products.print',
            'product_categories.view', 'product_categories.create', 'product_categories.edit', 'product_categories.delete',

            // Sales & Purchases
            'sales.view', 'sales.create', 'sales.edit', 'sales.delete',
            'purchases.view', 'purchases.create', 'purchases.edit', 'purchases.delete',

            // Custom Orders & Mortgages
            'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
            'mortgages.view', 'mortgages.create', 'mortgages.edit', 'mortgages.delete',

            // Inventory & Stock
            'inventory.view', 'inventory.adjust', 'inventory.ledger',

            // Financial Accounts
            'accounts.view', 'accounts.create', 'accounts.edit', 'accounts.delete',

            // HRM & Payroll
            'hrm.view', 'hrm.staff.manage', 'hrm.payroll.manage',

            // System Settings & Logs
            'settings.view', 'settings.edit', 'settings.metal_prices', 'settings.purities', 'activity_logs.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Roles
        $superAdmin = Role::firstOrCreate(['name' => 'super_administrator']);
        $branchAdmin = Role::firstOrCreate(['name' => 'branch_administrator']);
        $salesExec = Role::firstOrCreate(['name' => 'sales_executive']);
        $accountant = Role::firstOrCreate(['name' => 'accountant']);
        $hrManager = Role::firstOrCreate(['name' => 'hr_manager']);
        $staff = Role::firstOrCreate(['name' => 'staff']);

        // Assign all permissions to super admin
        $superAdmin->syncPermissions(Permission::all());

        // Assign default permissions
        $branchAdmin->syncPermissions(Permission::where('name', 'not like', 'settings.%')->get());
        $salesExec->syncPermissions(['sales.view', 'sales.create', 'orders.view', 'orders.create', 'products.view']);
        $accountant->syncPermissions(['accounts.view', 'accounts.create', 'accounts.edit', 'sales.view', 'purchases.view']);
        $hrManager->syncPermissions(['hrm.view', 'hrm.staff.manage', 'hrm.payroll.manage']);
    }
}
