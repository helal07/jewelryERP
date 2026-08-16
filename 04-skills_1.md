# Jewelry Business ERP — AI Agent Skills File

> Purpose: this file tells the AI coding agent (running in the Antigravity IDE) *how* to work on this repository — what "done" looks like for a unit of work, which files to touch, and which recipes to follow. Read this alongside `02-design.md` (architecture), `01-database-design.md` (schema), and `03-best-practices.md` (standards).

## Agent operating principles
- Always work module-by-module (see the 13-module list). Never scaffold the whole app in one pass — finish one module end-to-end (migration → model → policy → request → service → controller → routes → React pages) before starting the next.
- Before writing code for a module, re-read its section in `01-database-design.md` and `02-design.md`.
- Prefer editing/extending existing shared components (`DataTable`, `Modal`, `FormField`, layouts) over creating parallel one-off versions.
- After generating each module, self-check against the "Definition of done" checklist below before moving on.
- If a requirement is ambiguous, follow the nearest analogous module's existing pattern rather than inventing a new one, and note the assumption in the PR/commit description.

## Skill: Scaffold a new module
Given a module name (e.g., "Mortgage") and its features:
1. Create migration(s) per the schema in `01-database-design.md`.
2. Create Eloquent model(s) with relationships, `BelongsToBranch` trait, casts for decimals/dates, and an Observer if the model needs ledger/activity side effects.
3. Create a Policy mapped to the module's permissions (`view`, `create`, `edit`, `delete`, plus any module-specific action like `return`, `approve`).
4. Create Form Requests: `Store<Model>Request`, `Update<Model>Request` with validation rules matching column constraints.
5. Create a Service class holding the business logic (calculations, transactional writes, numbering).
6. Create a Controller with `index/create/store/edit/update/show/destroy` (only the ones the module needs), each method ≤ ~15 lines, delegating to the Service.
7. Register routes in `routes/web.php` inside the module's route group, each wrapped with the matching `permission:` middleware.
8. Create React pages: `Index.jsx` (DataTable + filters), `Create.jsx`/`Edit.jsx` (shared `Form.jsx`), `Show.jsx` if the module needs a detail/print view.
9. Add the module to the sidebar navigation config, gated by permission.
10. Seed permissions for the module and assign to the relevant default roles.
11. Write a Feature test: index loads, store creates a record, permission-denied returns 403.

## Skill: Add a transactional (money/weight) calculation
Whenever a feature involves computing amounts from weight × rate × making charge (Sales, Purchase, Order, Production, Mortgage):
1. Put the calculation in a dedicated method on the Service (or a small `PricingCalculator` helper shared across modules) — never duplicate the formula in the controller or in React only.
2. Inputs: gross_weight, stone_weight → net_weight; purity → effective metal value via `metal_prices`; making_charge_type/value; stone_charge; wastage_percentage.
3. Server recomputes and is authoritative; the React side may mirror the formula only for live preview.
4. Round only once, at the final total, using a documented rounding rule (e.g., round to 2 decimals, standard rounding).

## Skill: Wire inventory movement
Any action that changes stock (purchase, purchase return, sale, sale return, production in/out, artisan issue/return, manual adjustment) must write a `stock_ledger` row inside the same DB transaction as the source document. Never let stock quantity be a value maintained only on the `products` table without a corresponding ledger entry — the ledger is the audit trail; any "current stock" figure is a derived read (sum of ledger, optionally cached).

## Skill: Wire accounting entries
Any action that moves money (sale payment, purchase payment, salary payment, artisan payment, mortgage payment, contra entry, other income/expense, cheque clearing) must write `account_transactions` row(s) (double-entry: one debit, one credit) inside the same transaction as the source document, referencing the source via `reference_type`/`reference_id`.

## Skill: Build a report page
1. Add a method to `ReportController` (or a per-report controller if it grows large) that accepts filter inputs (date range, branch, customer/supplier/artisan) via a Form Request.
2. Query via a Service/Repository method — keep the heavy SQL out of the controller.
3. Return an Inertia page rendering a `DataTable` plus summary cards; provide an "Export" button (`reports.export` permission) that hits a dedicated export route using `maatwebsite/excel`, and a "Print" button opening a print-friendly view.
4. Reuse the DB views listed in `01-database-design.md` §12 where the query is common across reports (e.g., customer due).

## Skill: Add a new role/permission
1. Add the permission name to the seeder (`<module>.<action>` convention).
2. Assign it to the appropriate default role(s) in the seeder.
3. Wrap the relevant route with `permission:<name>` middleware.
4. Gate the relevant button/menu item in React with `usePermission('<name>')`.
5. Never gate solely on the frontend — always confirm the route middleware exists.

## Definition of done (per module)
- [ ] Migration(s) match `01-database-design.md`
- [ ] Model(s), Policy, Form Requests, Service, Controller created
- [ ] Routes registered with permission middleware
- [ ] React Index/Create/Edit/Show pages implemented and responsive (mobile + desktop)
- [ ] Sidebar nav entry added, permission-gated
- [ ] Stock/ledger and/or accounting entries wired if the module is transactional
- [ ] Activity logging fires on create/update/delete
- [ ] Print and/or export implemented where the requirements call for it
- [ ] Permissions seeded and assigned to default roles
- [ ] Feature test covering CRUD + one permission-denied case passes
- [ ] `php artisan test` and frontend build both pass clean

## Module build order (recommended)
1. Foundation: auth, roles/permissions, branches, system settings, purities, metal prices
2. Contacts: Customer, Supplier, Artisan, Mortgage Customer
3. Product catalog: categories, products, labels
4. Inventory: opening stock, stock ledger, adjustments
5. Purchase (incl. returns, payments)
6. Sales (incl. returns, payments)
7. Order → Production → Artisan payments (these three are tightly coupled)
8. Mortgage
9. HRM: staff, attendance, payroll, salary payments
10. Accounts: chart of accounts, contra, other income/expense, cheque register
11. Dashboard (depends on data existing in the above modules)
12. Reports (depends on all modules)
