# Desktop Screen Inventory and Navigation Map

This is the baseline screen map for the native Tauri desktop application. Field definitions come from MODULE_DATA_DICTIONARY.md; visual rules come from DESIGN_SYSTEM.md and PRODUCT_DESIGN_UX.md.

## Global desktop shell
- Workspace home and executive dashboard
- Organization, branch, department, and location switcher
- Global search, command palette, breadcrumbs, and recent records
- Notifications, tasks, approvals, reminders, and calendar
- Shared files and cloud storage workspace
- Activity timeline, audit center, sync status, offline status, and conflict resolution
- User profile, optional email, session/security settings, backup, restore, import, and export

## Administration
- Organization setup, branches, departments, teams, locations, fiscal calendars
- Users, invitations, roles, permission matrix, and permission request queue
- Record-level, field-level, action-level, export, print, and approval permissions
- Approval policies, workflow rules, numbering sequences, currencies, taxes, units
- Custom fields, statuses, tags, templates, integrations, cloud configuration
- Audit log, retention, data export, archive, restore, and system health

## Shared record workspace
Every entity follows the same navigation pattern:
- List/workbench with filters, saved views, sorting, grouping, bulk actions, and pagination
- Create/edit form with validation, draft, submit, approve, reject, cancel, and close actions
- Detail view with related records, attachments, notes, comments, activity, approvals, and audit history
- Import wizard, export/print actions, permission indicator, and empty/loading/error/offline states

## CRM
- CRM dashboard, leads, prospects, customers, organizations, contacts
- Pipelines, opportunities, stages, forecasts, territories, sources, campaigns
- Activities, calls, meetings, tasks, reminders, quotes, sales orders, contracts, renewals
- Cases, complaints, service requests, knowledge links, customer communications
- CRM reports: funnel, conversion, activity, revenue, retention, territory, and pipeline

## HR
- HR dashboard, employee directory, employee profile, departments, positions
- Employment history, contracts, documents, onboarding, offboarding, assets, disciplinary records
- Attendance, shifts, rosters, holidays, leave requests, balances, and approvals
- Payroll configuration, salary structures, components, deductions, loans, advances
- Expenses, reimbursements, recruitment, applicants, interviews, offers, training, performance
- HR reports: headcount, attendance, leave, payroll, turnover, recruitment, and compliance

## ERP and inventory management
- ERP dashboard, item/service master, categories, brands, variants, units, price lists
- Suppliers, warehouses, bins, locations, stock ledger, reservations, reorder levels
- Batches, serial numbers, expiry, transfers, counts, adjustments, write-offs, valuation
- Purchase requests, RFQs, purchase orders, goods receipts, supplier returns, landed costs
- BOM, work orders, production, quality checks, maintenance, assets, and service schedules
- Inventory reports: stock balance, movement, aging, valuation, reorder, expiry, and supplier performance

## POS
- Store and terminal setup, register open, cashier session, sales workspace
- Product search, barcode scanning, customer selection, discounts, coupons, tax, payments
- Suspended/resumed sales, split tender, returns, exchanges, refunds, gift cards, loyalty
- Cash in/out, petty cash, shift handover, end-of-day close, variance, reconciliation
- Receipt, label, and cash-drawer printing plus POS sales, cashier, product, and tax reports

## OMS and SCM
- Order capture, order detail, allocations, backorders, cancellations, and approvals
- Pick, pack, dispatch, shipment, carrier, route, tracking, delivery confirmation
- Returns, exchanges, reverse logistics, demand planning, procurement planning
- Supplier scorecards, replenishment, freight, landed cost, lead times, and exceptions
- OMS/SCM reports: order status, fulfillment, delivery, returns, demand, supplier, and logistics

## Accounting and finance
- Finance dashboard, chart of accounts, fiscal years, periods, journals, journal entry editor
- Debit/credit validation, narration, reference, source document, attachments, recurring entries
- General ledger, trial balance, profit and loss, balance sheet, cash flow, drill-down detail
- Customer invoices, receipts, allocations, credit/debit notes, aging, supplier bills, payments
- Bank accounts, imported transactions, reconciliation, cash book, petty cash, imprest, advances
- Expenses, reimbursements, accruals, prepayments, fixed assets, depreciation, taxes, withholding
- Cost centers, projects, budgets, revisions, variance analysis, approvals, period close, year end
- Finance reports: ledgers, statements, aging, tax, bank, cash, budget, profitability, and audit

## Reporting and exports
- Report builder, filters, grouping, formulas, saved reports, dashboards, KPI cards, charts
- Summary-to-detail drill-down, cross-module reports, scheduled reports, export history
- Excel, CSV, PDF, JSON, print, and permission-aware export previews

## Navigation and implementation rules
- Menus and actions are permission-aware; read-only access is clearly indicated.
- Admins can view summary and detail; sensitive fields and exports require separate permission.
- Use keyboard shortcuts, breadcrumbs, tabs, deep links, autosave drafts, and explicit confirmations.
- Build sequence: shell/admin -> shared records -> CRM/HR -> ERP/inventory/POS -> OMS/SCM -> accounting/finance -> reporting/exports -> Tauri native integrations and packaging.
