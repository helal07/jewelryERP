# Jewelry Business ERP — Database Design (MySQL)

> Target: MySQL 8.x, InnoDB engine, `utf8mb4_unicode_ci` collation.
> Conventions: singular model names / plural snake_case table names, `id` BIGINT UNSIGNED AUTO_INCREMENT PK, `created_at`/`updated_at` on every table, soft deletes (`deleted_at`) on master/transactional tables, foreign keys with `ON DELETE RESTRICT` unless noted, all money columns `DECIMAL(15,2)`, all weight columns `DECIMAL(10,3)` (grams), all purity/percentage columns `DECIMAL(5,2)`.

## 1. Auth, RBAC & System

### branches
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(150) | |
| code | VARCHAR(20) UNIQUE | |
| address, phone, email | VARCHAR | |
| is_head_office | BOOLEAN | default false |
| status | ENUM('active','inactive') | default active |
| timestamps, soft deletes | | |

### users
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| branch_id | FK → branches | nullable for Super Admin |
| name, email UNIQUE, phone | | |
| password | VARCHAR(255) | hashed |
| avatar | VARCHAR(255) | nullable |
| status | ENUM('active','inactive') | |
| last_login_at | TIMESTAMP | nullable |
| timestamps, soft deletes | | |

### roles (Spatie permission compatible)
`id, name, guard_name, timestamps` — seed: super_administrator, branch_administrator, sales_executive, purchase_executive, inventory_manager, accountant, hr_manager, staff

### permissions
`id, name, guard_name, timestamps` — grouped by module e.g. `sales.create`, `sales.view`, `sales.edit`, `sales.delete`, `sales.return`, `reports.export`, etc.

### model_has_roles / model_has_permissions / role_has_permissions
Standard Spatie pivot tables (`role_id`/`permission_id`, `model_id`, `model_type`).

### activity_logs
`id, user_id FK, branch_id FK, module VARCHAR(50), action VARCHAR(50), subject_type VARCHAR(100), subject_id BIGINT UNSIGNED, description TEXT, properties JSON, ip_address VARCHAR(45), created_at`

### notifications
`id (UUID), user_id FK, type VARCHAR(100), title, body, data JSON, read_at TIMESTAMP NULL, created_at`

### system_settings
`id, key VARCHAR(100) UNIQUE, value TEXT, group VARCHAR(50), timestamps`
(used for opening accounts config, notification toggles, general config)

### metal_prices
`id, metal_type VARCHAR(30), purity_id FK→purities NULL, price_per_gram DECIMAL(15,2), effective_date DATE, branch_id FK NULL, created_by FK→users, timestamps`

### purities
`id, metal_type ENUM('gold','silver','platinum'), name VARCHAR(20) (e.g. "22K","18K","925"), percentage DECIMAL(5,2), is_active BOOLEAN, timestamps`

---

## 2. Contacts (Customer / Supplier / Artisan / Mortgage Users)

### customers
`id, branch_id FK, code VARCHAR(30) UNIQUE, name, phone UNIQUE, email, address, nid_number, photo, opening_balance DECIMAL(15,2) default 0, due_balance DECIMAL(15,2) default 0, status ENUM('active','inactive'), created_by FK→users, timestamps, soft deletes`

### suppliers
`id, branch_id FK, code UNIQUE, name, company_name, phone, email, address, opening_balance, due_balance, status, timestamps, soft deletes`

### artisans
`id, branch_id FK, code UNIQUE, name, phone, address, specialization VARCHAR(100), wage_type ENUM('per_item','per_gram','fixed','commission'), rate DECIMAL(15,2), opening_balance, due_balance, status, timestamps, soft deletes`

### mortgage_customers
`id, branch_id FK, code UNIQUE, name, phone, nid_number, address, photo, status, timestamps, soft deletes`

---

## 3. Product Catalog

### product_categories
`id, parent_id FK→product_categories NULL (self-ref), name, code, metal_type ENUM('gold','silver','platinum','diamond','mixed'), timestamps, soft deletes`

### products
| Column | Type |
|---|---|
| id | PK |
| branch_id | FK |
| category_id | FK → product_categories |
| sku | VARCHAR(50) UNIQUE |
| barcode | VARCHAR(100) UNIQUE NULL |
| name | VARCHAR(150) |
| metal_type | ENUM('gold','silver','platinum','diamond','mixed') |
| purity_id | FK → purities |
| gross_weight | DECIMAL(10,3) |
| stone_weight | DECIMAL(10,3) default 0 |
| net_weight | DECIMAL(10,3) (generated: gross_weight - stone_weight, or maintained by app) |
| making_charge_type | ENUM('fixed','per_gram','percentage') |
| making_charge_value | DECIMAL(15,2) |
| stone_charge | DECIMAL(15,2) default 0 |
| wastage_percentage | DECIMAL(5,2) default 0 |
| unit | ENUM('piece','gram','pair','set') |
| image | VARCHAR(255) |
| description | TEXT |
| status | ENUM('active','inactive') |
| timestamps, soft deletes | |

### product_images (optional gallery)
`id, product_id FK, path, is_primary BOOLEAN, timestamps`

---

## 4. Purchase

### purchases
`id, branch_id FK, supplier_id FK→suppliers, invoice_no VARCHAR(30) UNIQUE, purchase_date DATE, subtotal, discount, tax, other_charges, grand_total, paid_amount, due_amount, status ENUM('pending','completed','cancelled'), notes TEXT, created_by FK→users, timestamps, soft deletes`

### purchase_items
`id, purchase_id FK CASCADE, product_id FK→products, description, metal_type, purity_id FK, gross_weight, stone_weight, net_weight, rate_per_gram, making_charge, stone_charge, quantity, total_amount, timestamps`

### purchase_returns
`id, purchase_id FK, branch_id FK, return_no UNIQUE, return_date DATE, reason TEXT, total_amount, created_by FK, timestamps`

### purchase_return_items
`id, purchase_return_id FK CASCADE, purchase_item_id FK, quantity, weight, amount, timestamps`

### purchase_payments
`id, purchase_id FK, branch_id FK, payment_no UNIQUE, payment_date DATE, amount, payment_method ENUM('cash','bank','cheque','mobile_banking'), reference_no, notes, created_by FK, timestamps`

---

## 5. Sales

### sales
`id, branch_id FK, customer_id FK→customers, invoice_no UNIQUE, sale_date DATE, sale_type ENUM('retail','wholesale'), subtotal, discount, tax, old_gold_exchange_value DECIMAL(15,2) default 0, grand_total, paid_amount, due_amount, status ENUM('pending','completed','cancelled'), created_by FK, timestamps, soft deletes`

### sale_items
`id, sale_id FK CASCADE, product_id FK→products, gross_weight, stone_weight, net_weight, rate_per_gram, making_charge, stone_charge, quantity, total_amount, timestamps`

### sale_returns
`id, sale_id FK, branch_id FK, return_no UNIQUE, return_date DATE, reason TEXT, total_amount, created_by FK, timestamps`

### sale_return_items
`id, sale_return_id FK CASCADE, sale_item_id FK, quantity, weight, amount, timestamps`

### sale_payments
`id, sale_id FK, branch_id FK, payment_no UNIQUE, payment_date DATE, amount, payment_method ENUM('cash','bank','cheque','mobile_banking'), reference_no, notes, created_by FK, timestamps`

---

## 6. Custom Orders (Order module)

### orders
`id, branch_id FK, customer_id FK→customers, order_no UNIQUE, order_date DATE, delivery_date DATE, product_description TEXT, reference_image VARCHAR(255), metal_type, purity_id FK, estimated_weight DECIMAL(10,3), estimated_amount, advance_amount, due_amount, status ENUM('new','assigned','in_production','ready','delivered','cancelled'), created_by FK, timestamps, soft deletes`

### order_assignments
`id, order_id FK, artisan_id FK→artisans, assigned_date DATE, expected_completion_date DATE, instructions TEXT, status ENUM('assigned','in_progress','completed','rejected'), timestamps`

### artisan_payments
`id, artisan_id FK, branch_id FK, order_id FK NULL, production_id FK NULL, payment_no UNIQUE, payment_date DATE, amount, payment_method, notes, created_by FK, timestamps`

---

## 7. Production

### productions
`id, branch_id FK, production_no UNIQUE, artisan_id FK→artisans, order_id FK NULL, product_category_id FK NULL, start_date DATE, expected_end_date DATE, actual_end_date DATE NULL, raw_metal_issued_weight DECIMAL(10,3), status ENUM('pending','in_progress','completed','cancelled'), notes TEXT, created_by FK, timestamps, soft deletes`

### production_items
`id, production_id FK CASCADE, product_id FK NULL, item_name, metal_type, purity_id FK, issued_weight, returned_weight, finished_weight, wastage_weight, quantity, status, timestamps`

---

## 8. Mortgage

### mortgages
`id, branch_id FK, mortgage_customer_id FK→mortgage_customers, mortgage_no UNIQUE, mortgage_date DATE, due_date DATE, principal_amount DECIMAL(15,2), interest_rate DECIMAL(5,2), interest_type ENUM('flat','monthly'), status ENUM('active','redeemed','overdue','forfeited'), created_by FK, timestamps, soft deletes`

### mortgage_items
`id, mortgage_id FK CASCADE, item_name, metal_type, purity_id FK, gross_weight, net_weight, estimated_value, quantity, image, timestamps`

### mortgage_payments
`id, mortgage_id FK, payment_no UNIQUE, payment_date DATE, amount, payment_type ENUM('interest','principal','redemption'), notes, created_by FK, timestamps`

---

## 9. Inventory

### stock_ledger
Central movement table for auditability.
`id, branch_id FK, product_id FK→products, transaction_type ENUM('opening','purchase','sale','sale_return','purchase_return','production_in','production_out','artisan_issue','artisan_return','adjustment'), reference_type VARCHAR(50), reference_id BIGINT UNSIGNED NULL, quantity_in, quantity_out, weight_in DECIMAL(10,3), weight_out DECIMAL(10,3), balance_quantity, balance_weight, created_by FK, created_at`

### stock_adjustments
`id, branch_id FK, adjustment_no UNIQUE, adjustment_date DATE, product_id FK, quantity_change, weight_change, reason TEXT, approved_by FK NULL, created_by FK, timestamps`

### artisan_stock
`id, branch_id FK, artisan_id FK→artisans, product_id FK NULL, metal_type, purity_id FK, weight_issued, weight_returned, balance_weight, reference_type, reference_id, timestamps`

---

## 10. HRM

### staff
`id, branch_id FK, user_id FK→users NULL, employee_code UNIQUE, name, designation, department, phone, address, nid_number, joining_date DATE, salary_type ENUM('fixed','commission'), basic_salary DECIMAL(15,2), status ENUM('active','inactive','resigned'), timestamps, soft deletes`

### attendances
`id, staff_id FK, branch_id FK, attendance_date DATE, check_in TIME, check_out TIME, status ENUM('present','absent','half_day','leave','holiday'), remarks, UNIQUE(staff_id, attendance_date), timestamps`

### payrolls
`id, staff_id FK, branch_id FK, month TINYINT, year SMALLINT, basic_salary, allowances DECIMAL(15,2) default 0, deductions DECIMAL(15,2) default 0, net_salary, status ENUM('draft','approved','paid'), UNIQUE(staff_id, month, year), timestamps`

### salary_payments
`id, payroll_id FK, staff_id FK, branch_id FK, payment_no UNIQUE, payment_date DATE, amount, payment_method, notes, created_by FK, timestamps`

---

## 11. Accounts

### chart_of_accounts
`id, parent_id FK→chart_of_accounts NULL, code VARCHAR(20) UNIQUE, name, account_type ENUM('asset','liability','equity','income','expense'), opening_balance DECIMAL(15,2) default 0, is_system BOOLEAN default false, timestamps`

### account_transactions
Ledger for all financial movement (fed by sales/purchase payments, contra, income, expense, salary, mortgage, artisan payments).
`id, branch_id FK, account_id FK→chart_of_accounts, transaction_date DATE, type ENUM('debit','credit'), amount, reference_type VARCHAR(50), reference_id BIGINT UNSIGNED NULL, description, created_by FK, created_at`

### contra_entries
`id, branch_id FK, entry_no UNIQUE, entry_date DATE, from_account_id FK→chart_of_accounts, to_account_id FK→chart_of_accounts, amount, notes, created_by FK, timestamps`

### other_incomes
`id, branch_id FK, account_id FK→chart_of_accounts, income_no UNIQUE, income_date DATE, category VARCHAR(100), amount, notes, created_by FK, timestamps`

### other_expenses
`id, branch_id FK, account_id FK→chart_of_accounts, expense_no UNIQUE, expense_date DATE, category VARCHAR(100), amount, notes, created_by FK, timestamps`

### cheques
`id, branch_id FK, cheque_no VARCHAR(50), bank_name, account_id FK→chart_of_accounts, direction ENUM('issued','received'), party_type VARCHAR(50) NULL, party_id BIGINT UNSIGNED NULL, amount, issue_date DATE, due_date DATE, status ENUM('pending','cleared','bounced','cancelled'), notes, created_by FK, timestamps`

---

## 12. Reporting support
Reports are generated via query views / repositories rather than dedicated tables. Recommended DB views:
- `v_sales_summary`, `v_purchase_summary`, `v_customer_due`, `v_supplier_due`, `v_artisan_due`, `v_inventory_valuation`, `v_mortgage_status`

## 13. Indexing guidance
- Add composite indexes on `(branch_id, status)` for every transactional table (sales, purchases, orders, productions, mortgages).
- Index all FK columns explicitly (MySQL indexes FKs by default, but confirm on composite/reporting queries).
- Index `invoice_no`, `code`, `sku`, `barcode` as UNIQUE.
- Add `(created_at)` index on `activity_logs` and `stock_ledger` for date-range reports.

## 14. Multi-branch & soft-delete rule
Every transactional/master table carries `branch_id`; global scopes in Laravel models should auto-filter by the authenticated user's branch unless the user is Super Administrator. All master and transactional tables use `SoftDeletes` except pure log/ledger tables (`activity_logs`, `stock_ledger`, `account_transactions`) which are append-only and never soft-deleted.
