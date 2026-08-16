# Jewelry Business ERP — Development Plan

## Phase 0 — Project Setup (see `06-setup-process.md`)
- Repo init, Laravel + Breeze (Inertia/React) install, Tailwind config
- MySQL database + `.env` configured
- Base packages installed: `spatie/laravel-permission`, `barryvdh/laravel-dompdf` or `spatie/laravel-pdf`, `maatwebsite/excel`, barcode package
- Base layout, navigation shell, auth pages (login, forgot password, profile)
- CI-lite: `php artisan test` + build script runnable locally

**Exit criteria:** a logged-in user sees an empty dashboard shell with role-based sidebar.

## Phase 1 — Foundation & Access Control
- Branches CRUD
- Roles & Permissions (seed default roles/permissions per `01-database-design.md`)
- User management (create staff/user accounts, assign role + branch)
- System Settings: purities, metal prices, notification settings, opening accounts, account configuration
- Activity logging middleware/observer wired globally

**Exit criteria:** Super Admin can create a branch, create a Branch Administrator user, and log in as that user to see a branch-scoped view.

## Phase 2 — Contacts
- Customer CRUD (+ purchase history, due info placeholders)
- Supplier CRUD (+ purchase history)
- Artisan CRUD (+ assigned work, payment history placeholders)
- Mortgage Customer CRUD

**Exit criteria:** all four contact types fully CRUD-able, searchable, paginated, permission-gated.

## Phase 3 — Product Catalog & Inventory Foundations
- Product Categories CRUD
- Products CRUD (with metal type, purity, weights, making charge config)
- Print Label (barcode/QR label generation)
- Opening Stock entry
- Stock Ledger (read-only view) + Stock Adjustment workflow
- Artisan Stock tracking

**Exit criteria:** products can be created and given an opening stock quantity/weight visible in inventory reports.

## Phase 4 — Purchase
- Add Purchase / Purchase List (writes stock_ledger + account_transactions)
- Purchase Return
- Purchase Due Payment

**Exit criteria:** a purchase increases stock and supplier due correctly; a payment reduces due; a return reverses stock/due correctly.

## Phase 5 — Sales
- Add Sale / Sale List (retail + wholesale)
- Sale Return
- Sale Due Payment
- Invoice print

**Exit criteria:** a sale decreases stock and increases customer due (if partial payment); returns and payments reconcile correctly; invoice prints cleanly.

## Phase 6 — Custom Orders → Production → Artisan Payments
- New Order / Order List
- Work Order Assignment (assign order to artisan)
- Production: Add Production / Production List / Production Status (linked to order + artisan stock issue/return)
- Artisan Payment Management

**Exit criteria:** an order can be assigned, tracked through production status changes, consume/issue artisan stock, and generate an artisan payment.

## Phase 7 — Mortgage
- Add Mortgage / Mortgage List / Mortgage Details
- Mortgage payments (interest/principal/redemption)

**Exit criteria:** a mortgage can be created against pledged items, interest/redemption payments recorded, status transitions (active → redeemed/overdue/forfeited) work.

## Phase 8 — HRM
- Staff Management
- Attendance
- Payroll
- Salary Payment

**Exit criteria:** staff attendance can be marked, a monthly payroll generated from attendance + basic salary, and a salary payment recorded against it.

## Phase 9 — Accounts
- Chart of Accounts setup (seed standard accounts)
- Contra Entry
- Other Income / Other Expense
- Cheque Register (issued/received, clearing workflow)

**Exit criteria:** all money-moving actions across every module post correctly to `account_transactions`; a basic trial balance query balances to zero.

## Phase 10 — Dashboard & Reports
- Dashboard widgets (business summary, sales/purchase overview, customer/supplier stats, inventory status, recent activity, notifications)
- Reports: Accounts, Sales, Wholesale, Purchase, Customer Order, Inventory, Artisan, Mortgage — each with filter + print + export

**Exit criteria:** every report listed in the requirements renders with real data, filterable by date/branch, printable and exportable.

## Phase 11 — Hardening & Polish
- Full responsive pass (mobile/tablet/desktop) across every module
- Performance pass: eager loading, indexes, query profiling on list/report pages with larger seeded datasets
- Security pass: permission matrix review, rate limiting, input validation edge cases
- UAT with real business scenarios (multi-branch, partial payments, returns, mortgages overdue)
- Bug-fix buffer

**Exit criteria:** sign-off checklist (below) fully green.

## Sign-off checklist
- [ ] All 13 modules functionally complete per requirements
- [ ] RBAC verified for every role (spot-check each role can/can't do the right things)
- [ ] Multi-branch data isolation verified
- [ ] All financial flows reconcile (sales/purchase/salary/mortgage/artisan payments all hit `account_transactions` correctly)
- [ ] Inventory ledger reconciles with physical/opening stock in test data
- [ ] Responsive on mobile + desktop for every module
- [ ] Print and export work for every report/document that requires it
- [ ] Automated test suite passing
- [ ] `.env.example`, README/setup doc up to date for handover
