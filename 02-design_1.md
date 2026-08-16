# Jewelry Business ERP — System Design

## 1. Stack
- **Backend**: Laravel 11.x (PHP 8.3+), MySQL 8.x
- **Frontend**: React 18 + Inertia.js (`@inertiajs/react`) — **no separate REST/JSON API layer**; Laravel controllers return Inertia responses directly.
- **Styling**: Tailwind CSS (utility-first, responsive by default via breakpoints `sm/md/lg/xl`)
- **Auth**: Laravel Breeze (Inertia + React starter) as the base, extended with Spatie `laravel-permission` for RBAC
- **State**: React local state + Inertia shared props (`usePage().props`) for auth/user/permissions/flash; no Redux needed — Inertia's page-props model replaces most global client state
- **Forms**: Inertia's `useForm` hook (built-in validation error handling, progress indicators)
- **Tables**: Server-side pagination via Laravel paginator passed as Inertia props; reusable `<DataTable>` React component (search, sort, filter, pagination controls)
- **PDF/Print**: `barryvdh/laravel-dompdf` or `spatie/laravel-pdf` for invoices, labels, reports; browser `window.print()` with print-specific CSS for quick receipts/labels
- **Export**: `maatwebsite/excel` for CSV/XLSX export on reports
- **Queue**: Laravel queue (database driver to start) for notifications, report generation, activity log writes
- **File storage**: Laravel filesystem, local disk in dev, S3-compatible in production, for product images / photos / attachments

## 2. High-level architecture
```
Browser (React components)
   |  Inertia visits (GET/POST/PUT/DELETE as normal HTTP, not JSON API)
   v
Laravel Route (web.php, grouped by module + middleware)
   -> Middleware: auth, verified, role/permission (Spatie), branch-scope, activity-log
   -> Controller (thin) -> Form Request (validation) -> Service class (business logic) -> Model/Repository
   -> Inertia::render('Module/Page', [...props]) 
   v
React Page component (resources/js/Pages/Module/Page.jsx)
   -> Layout (AuthenticatedLayout) -> Feature components -> shared UI kit
```

## 3. Directory structure
```
app/
  Http/
    Controllers/
      Sales/{SaleController, SaleReturnController, SalePaymentController}.php
      Purchase/{PurchaseController, PurchaseReturnController, PurchasePaymentController}.php
      Contact/{CustomerController, SupplierController, ArtisanController, MortgageCustomerController}.php
      Order/{OrderController, OrderAssignmentController, ArtisanPaymentController}.php
      Production/ProductionController.php
      Mortgage/{MortgageController, MortgagePaymentController}.php
      Product/{ProductController, ProductCategoryController}.php
      Inventory/{StockController, StockAdjustmentController, ArtisanStockController}.php
      Hrm/{StaffController, AttendanceController, PayrollController, SalaryPaymentController}.php
      Accounts/{ContraEntryController, OtherIncomeController, OtherExpenseController, ChequeController}.php
      Reports/ReportController.php
      Settings/{UserController, RoleController, BranchController, MetalPriceController, PuritySettingController, NotificationSettingController, AccountConfigController}.php
      DashboardController.php
    Middleware/{BranchScope.php, LogActivity.php}
    Requests/<Module>/{Store<Model>Request, Update<Model>Request}.php
  Models/  (one per table, relationships + scopes)
  Services/  (business logic, one per module: SaleService, PurchaseService, InventoryService, ProductionService, AccountingService ...)
  Repositories/ (optional — query builders for report views)
  Policies/  (per model, backed by Spatie permissions)
  Observers/ (auto-write stock_ledger and account_transactions on model events)
resources/
  js/
    Pages/<Module>/{Index,Create,Edit,Show}.jsx
    Components/  (shared: DataTable, Modal, Pagination, SearchInput, PrintButton, ExportButton, StatusBadge, FormField, ConfirmDialog)
    Layouts/{AuthenticatedLayout.jsx, GuestLayout.jsx}
    Hooks/ (usePermission, useBranch, useDebounce)
  css/app.css (Tailwind entry)
routes/web.php (grouped per module, name()'d routes, permission middleware per route)
database/{migrations,seeders,factories}
```

## 4. Module → Page → Route mapping (pattern, repeat per module)
Example for **Sales**:
- Routes: `sales.index`, `sales.create`, `sales.store`, `sales.edit`, `sales.update`, `sales.show`, `sales.destroy`, `sales.returns.*`, `sales.payments.*`
- Pages: `Pages/Sales/Index.jsx` (list + filters + pagination), `Create.jsx` / `Edit.jsx` (shared `Form.jsx` partial), `Show.jsx` (invoice detail + print + payment history)
- Controller returns `Inertia::render('Sales/Index', ['sales' => SaleResource-like array, 'filters' => $request->only(...)])`
- Every store/update flows through a `SaleService::create()` that: validates stock/business rules → creates sale + items in a DB transaction → writes `stock_ledger` entries → writes `account_transactions` → logs activity → redirects with flash message

Apply the same Index/Create/Edit/Show/Form pattern to every module listed in the requirements (Purchase, Contact sub-types, Order, Production, Mortgage, Product, Inventory, HRM, Accounts, Reports, Settings).

## 5. RBAC design
- Roles seeded: `super_administrator, branch_administrator, sales_executive, purchase_executive, inventory_manager, accountant, hr_manager, staff`
- Permissions named `<module>.<action>` (`view, create, edit, delete, return, approve, export, print`), assigned to roles via seeder; Super Admin bypasses all checks (`Gate::before`)
- Route-level: `Route::middleware('permission:sales.view')->group(...)`
- UI-level: `usePermission('sales.create')` hook (reads permissions array from shared Inertia props) to conditionally render buttons/menu items — **UI hiding is convenience, never a substitute for server-side enforcement**
- Branch scoping: global model scope + middleware injects `branch_id` filter for all non-super-admin users; Branch Administrator restricted to their own branch across all modules

## 6. Dashboard
Aggregation queries (cached briefly, e.g. 5 min) feeding: today's sales total, today's purchase total, due receivables/payables, low-stock alerts, recent activity feed (from `activity_logs`), notification panel (unread `notifications`), per-branch summary for Super Admin.

## 7. Cross-cutting concerns
- **Validation**: Form Request classes per action; React side mirrors rules for inline UX feedback but server is source of truth
- **Activity logging**: model `Observer` + `LogActivity` middleware auto-writes to `activity_logs` on create/update/delete/status-change across modules
- **Numbering**: invoice/order/production/mortgage numbers generated server-side per branch with a sequence table or `branch_code-YYYYMM-####` pattern, guarded by DB transaction to avoid race conditions
- **Money/weight precision**: all calculations done server-side in PHP using `bcmath` or integer-cents-style rounding at the final step; never trust client-computed totals — recompute and compare before saving
- **Printing**: dedicated print-friendly Blade or React print views for invoices, labels (with barcode via `milon/barcode` or `picqer/php-barcode-generator`), and reports
- **Notifications**: Laravel notification classes (database channel) + optional broadcast (Pusher/Reverb) for real-time dashboard badge updates
- **Error handling**: centralized exception handler returns Inertia-friendly error pages (403/404/500); form errors surface via Inertia's automatic error bag
- **Responsive design**: mobile-first Tailwind layout, collapsible sidebar → bottom nav or drawer on small screens, tables become stacked cards below `md` breakpoint

## 8. Security
- CSRF via Laravel/Inertia default
- Rate limiting on auth routes and financial-transaction endpoints
- Server-side authorization on every controller action (Policies)
- Sensitive exports/reports gated behind `reports.export` permission
- Audit trail immutable (`activity_logs`, `stock_ledger`, `account_transactions` are append-only, no update/delete routes)
