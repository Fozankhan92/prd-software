# Comprehensive Module Data Dictionary

This is the baseline for a configurable, industry-neutral desktop platform. Every entity includes organization, branch, status, created/updated metadata, attachments, notes, audit history, and custom fields where appropriate.

## CRM

Entities: leads, prospects, customers, organizations, contacts, opportunities, pipelines, stages, activities, calls, meetings, tasks, quotes, sales orders, contracts, renewals, campaigns, cases, complaints, territories, sales teams, commissions, addresses, tax profiles, credit profiles. Fields include code, legal name, contact details, optional email, source, owner, tags, status, value, probability, currency, terms, dates, next action, and narration.

## HR

Entities: employees, departments, positions, employment history, contracts, attendance, shifts, leave types, leave requests, holidays, payroll profiles, salary components, loans, advances, reimbursements, expenses, applicants, interviews, offers, onboarding, training, performance reviews, assigned assets, disciplinary records, and offboarding. Employee email is optional; internal employee code, name, phone, department, position, supervisor, start date, and employment status work without email.

## ERP and inventory

Entities: products, services, categories, brands, variants, units, barcodes, warehouses, locations, stock ledger, batches, serial numbers, stock counts, adjustments, transfers, reorder rules, suppliers, purchase requests, purchase orders, goods receipts, supplier returns, price lists, cost layers, bills of materials, manufacturing orders, work centers, quality inspections, maintenance requests, and assets. Inventory transactions preserve quantity, unit, warehouse, location, batch/serial, cost, source, destination, reason, operator, and timestamp.

## POS

Entities: stores, terminals, registers, cashier sessions, sales, sale lines, payments, returns, exchanges, discounts, coupons, gift cards, loyalty accounts, cash movements, end-of-day closing, cash variance, and receipts. Support cash, card, bank transfer, split payments, refunds, suspended sales, offline queueing, barcode entry, tax, discount approval, receipt printing, and shift reconciliation.

## OMS and SCM

Entities: orders, order lines, allocations, backorders, pick lists, packing jobs, dispatches, deliveries, returns, cancellations, shipments, carriers, tracking events, routes, supplier performance, demand plans, procurement plans, freight charges, and landed costs. Support partial fulfillment, multiple warehouses, promised dates, delivery addresses, taxes, discounts, payments, and status history.

## Accounting

Entities: chart of accounts, accounts, fiscal years, accounting periods, journals, journal entries, journal lines, narrations, references, general ledger lines, customer invoices, supplier bills, receipts, payments, allocations, credit notes, debit notes, bank accounts, bank transactions, reconciliations, petty cash, imprest accounts, cash advances, expenses, recurring entries, accruals, prepayments, fixed assets, depreciation schedules, taxes, withholding taxes, exchange rates, cost centers, projects, budgets, budget lines, revisions, and approvals.

Journal lines require account, debit, credit, currency, exchange rate, cost center/project when applicable, narration, source document, and posting period. A journal must balance before posting. Posted journals are immutable; corrections use reversal or adjustment entries. Imprest accounts require custodian, opening float, advances, replenishments, receipts, counted balance, variance, and settlement status.

## Finance and reporting

Reports include trial balance, general ledger, receivables aging, payables aging, cash position, bank reconciliation, budget versus actual, profit and loss, balance sheet, cash flow, inventory valuation, sales, purchasing, payroll, attendance, leave, workforce, and operational KPIs. Every report supports filters, periods, organization/branch scope, drill-down, print, Excel, CSV, PDF, and audit logging.

## Cross-module relationships

Customers connect CRM, POS, OMS, invoices, receipts, and support cases. Employees connect HR, approvals, expenses, assets, and audit events. Items connect ERP, inventory, POS, sales, purchasing, orders, shipments, and accounting costs. Every financial source document retains its originating module and reference.

## Configurability

Administrators configure custom fields, statuses, numbering sequences, approval thresholds, taxes, currencies, warehouses, payment methods, report layouts, module visibility, import mappings, export templates, and retention rules. Configuration changes require permission and audit history.

## Common workflow states

Draft, submitted, pending approval, approved, rejected, posted, partially fulfilled, completed, cancelled, reversed, archived, and suspended are configurable per module. Status changes preserve actor, reason, timestamp, comments, and related approvals.

## Import and export

All major lists support Excel, CSV, PDF, JSON, and printing. Imports provide field mapping, validation preview, duplicate detection, error download, rollback, permission checks, and audit records. Exports only include permitted records and fields, support masking sensitive data, and are logged.
