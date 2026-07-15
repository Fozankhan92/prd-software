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

## Customer 360 boundary and future module links

Customer 360 is a CRM-owned relationship view. It contains CRM customers, organizations, contacts, sales, activities, service, contracts, and statements. It does not become an accounting, HR, inventory, POS, OMS, SCM, or finance screen.

Other modules remain independently usable. A future shared-reference layer may let those modules link their own records to a CRM customer or organization using stable tenant-scoped IDs. The linked module remains the source of truth for its own data; CRM only displays permission-filtered relationship context when access is granted. This cross-module reference layer is planned for a later implementation phase.

## Reporting and data operations

CRM must support dashboards and exports for pipeline coverage, weighted forecast, conversion by source, win/loss, activity performance, customer concentration, quote aging, case SLA compliance, campaign ROI, and owner/team targets. Exports must support CSV, Excel, PDF, and permission-filtered views. Imports require field mapping, validation, duplicate handling, preview, and an audit record.

## Expanded CRM capability backlog

### Lead management

- Capture leads from website forms, imports, APIs, email, and manual entry.
- Support qualification, scoring, grading, prioritization, automatic routing, ownership, reassignment, and overdue follow-up alerts.
- Track source, campaign attribution, conversion, lost-lead reasons, and lost-opportunity reasons.
- Convert a lead into prospect, customer, contact, organization, and opportunity records without losing history.

### Account and contact management

- Support account hierarchies, parent and child organizations, branches, subsidiaries, account status, lifecycle stages, ownership history, and key-account management.
- Manage contact roles, buying committees, stakeholder influence, relationship strength, preferences, consent, opt-in, opt-out, and do-not-contact controls.
- Track product and service interests, customer segments, dynamic lists, health score, engagement score, churn risk, retention activity, and lifetime value.

### Opportunity and pipeline management

- Support opportunity products, expected revenue, probability, weighted forecasts, competitors, next-best action, sales targets, quotas, pipeline health, velocity, and performance tracking.
- Allow multiple pipelines by business unit, product line, territory, or sales team.
- Track cross-sell, upsell, recurring revenue, subscriptions, renewals, contract expiry, and renewal opportunities.

### Activities and communication

- Add automated workflows, reminders, escalations, approval flows, call logging, meeting outcomes, calendar scheduling, and communication history.
- Plan integrations for email, templates, SMS, WhatsApp, and other communication channels.
- Support notifications and subscriptions for record changes, assignments, approvals, due dates, and SLA events.

### Sales documents and contracts

- Support document attachments, CRM-specific templates, quotation and contract versions, electronic signatures, approvals for discounts, quotations, credit limits, and contracts.
- Provide portal sharing for quotations, contracts, documents, cases, and approved customer records.

### Customer service

- Support SLAs, response targets, case categories, priorities, queues, assignment, escalation, resolution, knowledge-base links, feedback, NPS, CSAT, surveys, and customer-visible notes.

### Marketing and campaigns

- Manage campaign audiences, campaign members, responses, ROI, multi-touch attribution, source tracking, and conversion influence.

### Territory, teams, commissions, and credit

- Support territory hierarchies, assignment rules, sales-team roles, opportunity-sharing rules, commission plans, targets, tiers, splits, approvals, credit holds, and sales restrictions.

### Automation and approvals

- Provide configurable triggers, actions, reminders, escalation timers, approval thresholds, stage-specific requirements, and workflow audit history.

### Analytics and forecasting

- Add dashboards for KPIs, funnel analysis, conversion rates, sales velocity, win/loss, forecast accuracy, salesperson productivity, customer profitability, retention, and lifetime value.

### Data quality and bulk operations

- Provide duplicate prevention, duplicate review, merge, survivorship rules, bulk import, bulk export, bulk update, bulk reassignment, field mapping, validation, preview, and error reports.

### Customization and security

- Support tags, labels, saved views, advanced filters, favorites, global CRM search, custom fields, custom objects, custom layouts, custom forms, custom pipeline stages, stage-specific required fields, statuses, categories, priorities, and reason codes.
- Enforce role-based, record-level, field-level, and sharing permissions, with portal controls, retention, archival, privacy, audit, and version history.
