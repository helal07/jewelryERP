# Jewelry ERP System

A comprehensive Enterprise Resource Planning (ERP) platform built with Laravel, Inertia.js, React, and TailwindCSS for jewelry retailers, wholesalers, manufacturers, and multi-branch jewelry enterprises.

## Key Modules & Features

- **Dashboard**: Real-time sales metrics, order tracker, inventory alerts, and quick actions.
- **Product Management**: Jewelry items, categories, purity karat definitions, and barcode label printing.
- **Sales & Due Collection**: Retail sales, invoice generation, due collections, returns, and wholesale distribution.
- **Purchases**: Purchase orders, supplier ledger, gold/silver weight tracking, and payment history.
- **Custom Orders**: Bespoke customer orders, artisan assignments, and stage tracking.
- **Mortgage (বন্ধকী)**: Loan disbursement, pledge item tracking, interest calculator, and redemption.
- **Production Workflow**: Raw gold distribution, artisan tracking, stage progression, and finished goods transfer.
- **Inventory Ledger**: Opening balances, stock adjustments, weight ledger, and artisan stock balance.
- **Contacts**: Customers, Suppliers, Artisans, and Mortgage Clients.
- **Accounts & Finance**: Chart of Accounts, Double-entry ledgers, Contra vouchers, and Expense management.
- **HRM**: Employee staff, Daily attendance, and Payroll processing.
- **Business Reports**: 8 printable reports (Sales, Wholesale, Purchase, Custom Orders, Inventory, Mortgage, Artisan, Accounts).
- **Settings & Security**: Role & Permission matrix, Multi-branch management, Metal pricing, Purity rates, System account configuration, and User profile.

## Tech Stack

- **Backend**: Laravel 11, PHP 8.2+, Spatie Permission & Activity Log
- **Frontend**: React 18, Inertia.js, Lucide Icons, TailwindCSS
- **Database**: SQLite / MySQL / PostgreSQL

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/sowayebahmedrafee-blip/jewelry-ERP-.git

# Install dependencies (if not pre-packaged)
composer install
npm install

# Build frontend assets
npm run build

# Run migrations & seeders
php artisan migrate --seed

# Start the application
php artisan serve
```
