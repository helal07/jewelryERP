<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use Illuminate\Database\Seeder;

class ChartOfAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            // Assets
            ['code' => '1010', 'name' => 'Cash in Hand', 'account_type' => 'asset', 'opening_balance' => 500000, 'is_system' => true],
            ['code' => '1020', 'name' => 'Main Bank Account (Standard Chartered)', 'account_type' => 'asset', 'opening_balance' => 1200000, 'is_system' => true],
            ['code' => '1030', 'name' => 'bKash Merchant Account', 'account_type' => 'asset', 'opening_balance' => 150000, 'is_system' => false],
            
            // Liabilities
            ['code' => '2010', 'name' => 'Accounts Payable', 'account_type' => 'liability', 'opening_balance' => 0, 'is_system' => true],
            ['code' => '2020', 'name' => 'Mortgage Liabilities', 'account_type' => 'liability', 'opening_balance' => 0, 'is_system' => true],

            // Equity
            ['code' => '3010', 'name' => 'Owner Capital', 'account_type' => 'equity', 'opening_balance' => 2000000, 'is_system' => true],

            // Income
            ['code' => '4010', 'name' => 'Sales Revenue', 'account_type' => 'income', 'opening_balance' => 0, 'is_system' => true],
            ['code' => '4020', 'name' => 'Scrap / Wastage Sales Income', 'account_type' => 'income', 'opening_balance' => 0, 'is_system' => false],
            ['code' => '4030', 'name' => 'Commission & Interest Income', 'account_type' => 'income', 'opening_balance' => 0, 'is_system' => false],

            // Expense
            ['code' => '5010', 'name' => 'Shop Rent Expense', 'account_type' => 'expense', 'opening_balance' => 0, 'is_system' => false],
            ['code' => '5020', 'name' => 'Utility Bills (Electricity & Water)', 'account_type' => 'expense', 'opening_balance' => 0, 'is_system' => false],
            ['code' => '5030', 'name' => 'Staff Salaries Expense', 'account_type' => 'expense', 'opening_balance' => 0, 'is_system' => true],
            ['code' => '5040', 'name' => 'Tea & Entertainment Expense', 'account_type' => 'expense', 'opening_balance' => 0, 'is_system' => false],
        ];

        foreach ($accounts as $acc) {
            ChartOfAccount::firstOrCreate(
                ['code' => $acc['code']],
                $acc
            );
        }
    }
}
