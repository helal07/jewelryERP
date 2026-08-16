# Jewelry Business ERP — Best Practices

## Laravel / Backend
1. **Thin controllers, fat services.** Controllers only: validate (via Form Request), call a Service method, return `Inertia::render()` or redirect. No business logic in controllers.
2. **One Form Request per action** (`StoreSaleRequest`, `UpdateSaleRequest`), with `authorize()` checking the relevant permission — don't rely only on route middleware.
3. **DB transactions for every multi-table write.** Any operation touching more than one table (sale + items + stock_ledger + account_transactions) must be wrapped in `DB::transaction()`.
4. **Never trust client totals.** Recompute weight/amount/making-charge totals server-side from stored rates/purities; compare against submitted total and reject on mismatch beyond a small rounding tolerance.
5. **Use model events/observers for side effects** (stock ledger writes, activity logging) instead of duplicating that logic in every service method.
6. **Eloquent scopes for branch isolation**: a `BelongsToBranch` trait/global scope applied to every branch-owned model; never manually filter `branch_id` ad hoc in controllers.
7. **Migrations are the source of truth** — never edit a migration that has shipped; create a new migration for schema changes. Keep migrations reversible (`down()` implemented).
8. **Seeders/factories** for roles, permissions, purities, chart of accounts, and demo data — required for local dev and QA, never for production data entry.
9. **API resources / array transformers** for shaping data sent to Inertia props — don't pass raw Eloquent models with hidden fields exposed.
10. **N+1 avoidance**: eager-load relationships (`with()`) on every index/report query; use Laravel Debugbar or `DB::listen` in dev to catch N+1s before merging.
11. **Money & weight math**: use `bcmath` or work in smallest unit (paisa/cents, milligrams) internally when precision matters; format only at the presentation layer.
12. **Idempotent numbering**: generate invoice/order/etc. numbers inside the same transaction as the insert, using a locked counter row or `lockForUpdate()`, to avoid duplicate numbers under concurrent requests.
13. **Testing**: Feature tests per module covering create/edit/delete/permission-denied paths; unit tests for Service classes doing calculations (weight/amount/wastage).

## React / Inertia / Frontend
1. **Shared layout, page components stay declarative.** `AuthenticatedLayout` wraps every page; pages themselves should mostly compose reusable components, not contain raw markup soup.
2. **`useForm` for all forms** — gives you `data`, `errors`, `processing`, `reset()` for free; don't hand-roll form state with `useState` unless the form is trivial.
3. **Reusable `<DataTable>`** for every list page (search box, column sort, server-side pagination via Inertia `router.get` with preserved state) instead of rebuilding tables per module.
4. **Debounce search/filter inputs** (300ms) before triggering an Inertia visit, and use `only: [...]` partial reloads to avoid refetching the whole page.
5. **Permission-aware UI**: a single `usePermission()` hook reading from shared props; hide/disable actions the user can't perform, but always assume the server re-checks.
6. **No client-side money math for persistence** — client-side calculated totals are for live preview only; the value that gets saved is whatever the server recomputes and returns.
7. **Componentize by domain, not by page**: e.g. `Components/Sales/SaleItemRow.jsx`, `Components/Inventory/StockBadge.jsx` — reusable across Index/Create/Edit/Show.
8. **Accessibility & responsiveness**: semantic HTML, label every input, keyboard-navigable modals, mobile-first Tailwind classes, test at 375px/768px/1280px widths.
9. **Print views** as separate, minimal-CSS React components (or dedicated print route) — don't try to reuse the full app layout for printed invoices/labels.
10. **Optimistic UI only for low-risk actions** (e.g., marking a notification read); financial/state-changing actions wait for the server round-trip and show `processing` spinners.
11. **Table Actions Dropdown Menu Standard**:
    - Action trigger buttons must use the signature cyan pill style (`border border-[#00b4d8] text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 rounded-full px-3 py-1 text-[13px] font-medium transition`).
    - Floating dropdown menus must contain color-coded icons (View Details: `indigo-500`, Edit: `blue-500`, Print/Invoice: `emerald-500`, Payment: `amber-500`, Delete/Cancel: `red-600`).
    - Table wrappers must have `min-h-[450px]` to ensure space for dropdown expansion.

## Database
1. Always add an index for any column used in a `WHERE`, `ORDER BY`, or `JOIN` on a table expected to grow past a few thousand rows (sales, purchases, stock_ledger, activity_logs).
2. Enforce referential integrity with real foreign keys, not just application-level checks.
3. Store computed/derived values (like `net_weight`, `due_amount`) as real columns updated transactionally — don't compute them ad hoc in every report query — but keep them in sync via the Service layer/observers, not via DB triggers (keeps logic in one place/testable).
4. Use `DECIMAL`, never `FLOAT`/`DOUBLE`, for any money or weight column.
5. Partition or archive strategy for `activity_logs`/`stock_ledger` once they grow large (e.g., yearly table or archiving job) — plan for it, implement when needed.

## Security & Compliance
1. Every destructive action (delete, cancel, return) requires explicit permission and, for financial records, a reason/note field.
2. Mask/limit access to customer NID numbers and financial totals to roles that need them (e.g., Staff role shouldn't see cost price or supplier due).
3. Rate-limit login and password-reset routes; enforce strong password rules; support forced password change on first login for staff-created accounts.
4. Log every login/logout and permission-denied attempt to `activity_logs`.

## Git / Workflow
1. Conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`) scoped by module, e.g. `feat(sales): add purchase return workflow`.
2. One module/feature per branch and PR; migrations in the same PR as the code that needs them.
3. `.env.example` kept up to date whenever a new config key is introduced.
4. Run `php artisan test` and `npm run build` (or lint) before every PR is considered done.

## AI Agent–specific practices (for the coding agent building this app)
1. Before creating a new table/model/route, check `01-database-design.md` and `02-design.md` — don't invent a divergent schema or folder structure.
2. When a module is ambiguous, follow the closest existing module's pattern (e.g., build Mortgage the same shape as Sales: list/create/edit/show/payments).
3. Generate migrations, models, Form Requests, Service, Controller, Policy, and Pages together for a module — don't leave a module half-wired (e.g., backend without a Page, or a Page with no route).
4. After generating a module, write/update a minimal Feature test for its CRUD + one permission-denied case.
5. Re-run `php artisan migrate:fresh --seed` locally after schema changes to confirm seeders still pass.
