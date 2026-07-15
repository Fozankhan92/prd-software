# CRM scope

PRD Software's CRM is a complete customer-operations module, not only a contact list. Every record is tenant-scoped, permission-aware, auditable, and linkable to ERP, POS, OMS, accounting, finance, files, and communication history.

## Core records

- Organizations/accounts with parent-child accounts, billing and shipping addresses, tax identifiers, industries, segments, territories, credit limits, relationship owners, and custom fields.
- Contacts with multiple roles, consent/preferences, optional email, phone, messaging details, relationship links, and timeline history. Email is encouraged but never mandatory for desktop onboarding.
- Leads with source, campaign attribution, qualification questions, score, owner, status, duplicate review, and conversion into an account, contact, and opportunity.
- Opportunities with pipeline, stage history, amount, currency, probability, products, competitors, next step, expected close date, forecast category, and loss reason.
- Activities including calls, emails, meetings, notes, tasks, reminders, recurring follow-ups, mentions, attachments, and completion history.
- Quotes and sales orders with line items, price lists, discounts, tax, approvals, validity, versioning, acceptance, and handoff to OMS/ERP.
- Customer-service cases with priority, SLA, queue, assignment, status, escalation, resolution, knowledge links, and customer-visible notes.
- Campaigns with audience, channels, budget, responses, conversion attribution, and ROI reporting.

## Required workflows

1. Capture a lead or account, detect duplicates, and assign ownership.
2. Qualify the lead and convert it without losing source or activity history.
3. Manage an opportunity through configurable pipelines and approval gates.
4. Create a quote, route discounts for approval, send or export it, and convert an accepted quote to a sales order.
5. Schedule activities and reminders across users and teams with read-only visibility by permission.
6. Open and resolve support cases with SLA timers and escalation history.
7. Share selected CRM records and files across departments using the double-layer permission model.

## Reporting and data operations

CRM must support dashboards and exports for pipeline coverage, weighted forecast, conversion by source, win/loss, activity performance, customer concentration, quote aging, case SLA compliance, campaign ROI, and owner/team targets. Exports must support CSV, Excel, PDF, and permission-filtered views. Imports require field mapping, validation, duplicate handling, preview, and an audit record.
