# Jewelry Business ERP — Setup Process

## 1. Prerequisites
- PHP 8.3+, Composer 2.x
- Node.js 20+, npm
- MySQL 8.x
- Git

## 2. Create the Laravel + Inertia/React project
```bash
composer create-project laravel/laravel jewelry-erp
cd jewelry-erp

# Breeze scaffolding with Inertia + React stack
composer require laravel/breeze --dev
php artisan breeze:install react
npm install
```

## 3. Install core packages
```bash
# RBAC
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# PDF generation (invoices, labels, reports)
composer require barryvdh/laravel-dompdf

# Excel export
composer require maatwebsite/excel

# Barcode generation for product labels
composer require picqer/php-barcode-generator

# Activity logging (optional convenience layer on top of the custom activity_logs table)
composer require spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
```

## 4. Frontend tooling
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @inertiajs/react react react-dom
```
Configure `tailwind.config.js` `content` paths to include `resources/js/**/*.jsx`.

## 5. Environment configuration
Edit `.env`:
```
APP_NAME="Jewelry ERP"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jewelry_erp
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database
SESSION_DRIVER=database
FILESYSTEM_DISK=public
```
Create the database:
```bash
mysql -u root -p -e "CREATE DATABASE jewelry_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 6. Publish & run base migrations
```bash
php artisan queue:table
php artisan session:table
php artisan storage:link
php artisan migrate
```

## 7. Project-specific scaffolding order
Follow `05-plan.md` phase order. For each module, generate in this sequence (matches the "Scaffold a new module" skill in `04-skills.md`):
```bash
php artisan make:migration create_<table>_table
php artisan make:model <Model> -mfsp   # model + migration(skip if exists) + factory + seeder + policy
php artisan make:request Store<Model>Request
php artisan make:request Update<Model>Request
php artisan make:controller <Module>/<Model>Controller --resource
```
Then hand-write the Service class in `app/Services/`, wire routes in `routes/web.php`, and create the matching React pages under `resources/js/Pages/<Module>/`.

## 8. Seed base data
Create/order seeders in `database/seeders/DatabaseSeeder.php`:
1. `BranchSeeder` (at least a head office branch)
2. `RolePermissionSeeder` (roles + permissions per `01-database-design.md`, assign default role-permission maps)
3. `PuritySeeder` (standard gold/silver/platinum purities)
4. `ChartOfAccountsSeeder` (standard account tree: Cash, Bank, Accounts Receivable, Accounts Payable, Sales Income, Purchase Expense, Salary Expense, etc.)
5. `SuperAdminSeeder` (initial Super Administrator user)

Run:
```bash
php artisan db:seed
```

## 9. Local development
```bash
php artisan serve
npm run dev
```
Or combined (if `concurrently`/`composer run dev` script is configured by Breeze):
```bash
composer run dev
```

## 10. Testing setup
```bash
php artisan test
```
Configure `phpunit.xml` to use a separate `jewelry_erp_testing` SQLite or MySQL database so tests don't touch dev data.

## 11. Build for production
```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

## 12. Handover checklist for the AI agent
Before starting feature work, confirm:
- [ ] `php artisan migrate:fresh --seed` runs clean
- [ ] Login works with the seeded Super Admin
- [ ] Sidebar renders module list with permission gating active
- [ ] Tailwind classes compile (`npm run dev` shows no errors)
- [ ] `04-skills.md` module build order is the working checklist for subsequent sessions
