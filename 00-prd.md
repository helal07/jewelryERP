# Jewelry Business ERP — Product Requirements Document (PRD)

## 1. Document info
| | |
|---|---|
| Product | Jewelry Business ERP Software |
| Doc type | PRD (for AI coding agent + dev reference) |
| Related docs | `01-database-design.md`, `02-design.md`, `03-best-practices.md`, `04-skills.md`, `05-plan.md`, `06-setup-process.md` |

## 2. Purpose & vision
A centralized, web-based ERP that digitizes the daily operations of a jewelry business — sales, purchasing, inventory, customer management, custom-order production, mortgage/pawn management, accounting, HR, and reporting — replacing manual/spreadsheet-based processes with one secure, role-based system usable across desktop and mobile.

## 3. Problem statement
Jewelry businesses run on tightly interlinked, high-precision data (metal weight, purity, live metal price, making charges) spread across sales, purchase, production, and mortgage/pawn activities. Managing these manually or in disconnected tools causes stock discrepancies, untracked dues, delayed artisan payments, and poor visibility into business performance across branches.

## 4. Goals
- Digitize and centralize all core jewelry business operations in one system.
- Give management real-time visibility into sales, purchases, inventory, and dues via a dashboard.
- Enforce accountability through role-based access control and activity logging.
- Support multi-branch operation with proper data isolation.
- Keep the system fast, responsive (mobile + desktop), and scalable as data grows.

## 5. Non-goals (out of scope for v1)
- Public-facing e-commerce / online storefront.
- Third-party accounting software integration (e.g., QuickBooks/Tally sync).
- SMS/email marketing automation.
- Multi-currency / international tax compliance.
- Native mobile apps (web responsive only for v1).

## 6. Target users / roles
| Role | Primary use |
|---|---|
| Super Administrator | Full system control, all branches |
| Branch Administrator | Full control within their branch |
| Sales Executive | Sales, sale returns, customer due collection |
| Purchase Executive | Purchases, purchase returns, supplier due payment |
| Inventory Manager | Stock, adjustments, artisan stock |
| Accountant | Accounts module, payments, cheque register, reports |
| HR Manager | Staff, attendance, payroll |
| Staff | Limited operational access per assignment |

## 7. Assumptions & constraints
- Single currency, single tax regime (configurable rate, not multi-jurisdiction).
- Metal price is entered/updated manually (or scheduled) per branch; no live market-price API integration in v1.
- Internet-connected environment (not offline-first).
- Tech stack is fixed: Laravel + Inertia + React (no separate REST API), MySQL. See `02-design.md`.

## 8. Functional requirements by module

### 8.1 Dashboard
- Business summary, daily sales overview, purchase overview, customer statistics, supplier statistics, inventory status, recent activities, notification panel.
- All figures branch-scoped for non-Super-Admin users; Super Admin sees cross-branch summary with per-branch breakdown.

### 8.2 Sales
- Add Sale, Sale List (search/filter/paginate), Sale Return, Sale Due Payment.
- Support retail and wholesale sale types; partial payment creates a due balance against the customer.
- Invoice must be printable.

### 8.3 Purchase
- Add Purchase, Purchase List, Purchase Return, Purchase Due Payment.
- Partial payment creates a due balance against the supplier.

### 8.4 Contact
- **Customer**: profile, purchase history, due information.
- **Supplier**: profile, purchase history.
- **Artisan**: profile, assigned work, payment history.
- **Mortgage Users**: profile, mortgage history.

### 8.5 Order
- New Order (custom jewelry order capture), Order List, Work Order Assignment (assign to artisan), Artisan Payment Management.
- Order must track status through its lifecycle (new → assigned → in production → ready → delivered / cancelled).

### 8.6 Production
- Add Production, Production List, Production Status tracking, linked to Orders and Artisans, with raw metal issued/returned and wastage tracked.

### 8.7 Mortgage
- Add Mortgage, Mortgage List, Mortgage Details.
- Track pledged item(s), principal, interest, due date, and status (active/redeemed/overdue/forfeited); interest/principal/redemption payments recorded.

### 8.8 Product
- Add Product, Product List, Product Categories, Print Label (barcode/QR).
- Product carries metal type, purity, gross/stone/net weight, making charge config, wastage %.

### 8.9 Inventory
- Opening Stock, Artisan Stock, Stock Adjustment.
- Every stock-affecting action across every module writes to a single auditable stock ledger.

### 8.10 HRM
- Staff Management, Attendance, Payroll, Salary Payment.

### 8.11 Accounts
- Contra Entry, Other Income, Other Expense, Cheque Register.
- Every money-moving action in any module posts to the accounting ledger (double-entry).

### 8.12 Reports
- Accounts Report, Sales Report, Wholesale Report, Purchase Report, Customer Order Report, Inventory Report, Artisan Report, Mortgage Report.
- Each report: filterable (date range, branch, party), printable, exportable (where applicable).

### 8.13 System Settings
- User Permissions, Branch Management, Metal Price Configuration, Purity Management, Notification Settings, Opening Accounts, Account Configuration.

## 9. Cross-module system requirements
- Secure login, role-based permission enforcement (server-side, not just UI).
- Responsive UI (mobile + desktop).
- Search & filtering, pagination on every list view.
- Full CRUD with form validation on every module.
- Activity logging on all create/update/delete/status-change actions.
- Print support (invoices, labels, reports, mortgage details).
- Export support where applicable (reports).
- Dashboard analytics.
- Notification support (in-app).

## 10. Quality attributes / non-functional requirements
| Attribute | Requirement |
|---|---|
| Responsive design | Works correctly on mobile and desktop via responsive layout (media queries / Tailwind breakpoints) |
| Security | Secure authentication, RBAC enforced server-side, activity audit trail, rate-limited auth endpoints |
| Architecture | Modular, maintainable codebase; clean separation of controller/service/model layers |
| Performance | Optimized queries (indexed, eager-loaded), fast list/report rendering even as data grows |
| Scalability | Schema and code structure support adding branches, users, and modules without redesign |
| Data integrity | Strong validation, DB transactions on multi-table writes, real foreign keys |
| Usability | Clean, consistent UI; predictable Index/Create/Edit/Show pattern across modules |
| Reliability | Proper error handling, no silent failures on financial/stock-affecting actions |

## 11. Key business rules
- Server-side recomputation of all weight/price/making-charge totals is authoritative; client-submitted totals are never trusted directly.
- Every stock-affecting transaction (purchase, sale, return, production, artisan issue/return, adjustment) must produce a stock ledger entry.
- Every money-affecting transaction (sale/purchase/salary/artisan/mortgage payment, contra, other income/expense) must produce a double-entry accounting ledger entry.
- Users only see and act within their assigned branch, except Super Administrator.
- Deleted/cancelled/returned records remain in the audit trail (soft delete / status change, not hard delete) for financial and log tables.

## 12. Success metrics (v1 launch)
- All 13 modules functionally complete and passing the sign-off checklist in `05-plan.md`.
- Zero discrepancy between stock ledger balance and product stock display in UAT test data.
- Zero discrepancy between accounting ledger and module-level due balances in UAT test data.
- All roles pass a permission spot-check (can do only what they should).
- All report pages load within an acceptable time on seeded test-scale data and support print + export.

## 13. Risks & open questions
- **Metal price volatility**: is metal price locked at time of sale/purchase, or does it need historical tracking per transaction? *(current design: `metal_prices` table keeps history; each transaction should store the rate used at time of transaction — confirm this is captured on `purchase_items`/`sale_items`.)*
- **Multi-branch stock transfer**: is inter-branch stock transfer needed in v1? *(not currently in requirements — flag if needed, would need a new `stock_transfers` table/module.)*
- **Mortgage forfeiture handling**: does a forfeited mortgage convert into sellable inventory automatically? *(needs a business rule decision before Phase 7 implementation.)*
- **Tax model**: single flat tax rate assumed — confirm if VAT/GST-style itemized tax is required.
- **Wholesale vs retail pricing rules**: confirm if wholesale uses different making-charge/discount rules than retail, or just a different customer flag.

## 14. Acceptance criteria (v1 release)
- [ ] All functional requirements in §8 implemented and demoable end-to-end
- [ ] All cross-module requirements in §9 verified
- [ ] All quality attributes in §10 verified (responsive check, security review, performance check on seeded data)
- [ ] Open questions in §13 resolved and reflected in the schema/design docs before final sign-off
- [ ] Full sign-off checklist in `05-plan.md` §"Sign-off checklist" green
