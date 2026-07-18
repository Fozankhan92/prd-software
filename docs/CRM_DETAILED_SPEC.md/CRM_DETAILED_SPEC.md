# CRM detailed implementation specification

This document translates the supplied CRM requirements into the implementation rules for PRD Software. CRM remains an independent module with optional, permission-aware links to Accounting, ERP, POS, OMS, SCM, Finance, Files, and Communication.

## Functional areas

- Lead management: manual, website, import, email, API, referral, and social capture; duplicate validation; source and campaign attribution; scoring; qualification; routing; ownership; consent; follow-up; conversion.
- Accounts and contacts: organization hierarchies, branches, subsidiaries, multiple contacts, contact roles, buying committees, relationship strength, influence mapping, lifecycle, key accounts, health, churn, and retention.
- Opportunities and pipelines: multiple pipelines, products, amount, probability, weighted value, forecast category, competitors, next action, close date, win/loss reasons, stage requirements, stage history, velocity, and approvals.
- Activities and communication: calls, meetings, tasks, notes, demonstrations, site visits, email, SMS, WhatsApp where supported, templates, calendar, reminders, outcomes, next activity, and communication history.
- Sales documents: quotations, line items, discounts, taxes, terms, versions, approval thresholds, electronic signatures, sales-order conversion, contracts, renewals, expiry alerts, and renewal opportunities.
- Customer service: cases, complaints, queues, assignment, severity, SLA response and resolution timers, escalation, knowledge links, root cause, corrective action, CSAT, NPS, surveys, and customer-visible notes.
- Marketing: campaigns, members, audiences, responses, lifecycle statuses, segmentation, multi-touch attribution, cost, revenue, ROI, and source history.
- Organization and finance controls: territories, territory hierarchies, sales teams, quotas, targets, ownership history, commission plans and splits, credit holds, credit exposure, available credit, balances, statements, and profitability views.
- External access: explicit portal shares with record, user, actions, approval, start date, expiry, and internal-field protection.
- Data quality and administration: duplicate scoring, merge and survivorship, import mapping, validation, bulk update, reassignment, export, tags, saved views, favorites, custom fields, custom objects, custom layouts, custom forms, and audit history.

## Core business rules

1. Lead lifecycle: New -> Assigned -> Contacted -> Qualified -> Converted, with Disqualified, Duplicate, Unresponsive, and Not Interested outcomes.
2. Lead conversion creates or links an organization, contact, and opportunity without deleting the original lead history.
3. Exact email, phone, tax number, or registration matches are high-confidence duplicates; similar organization, domain, or contact matches warn or require approval according to configuration.
4. Weighted opportunity value equals amount multiplied by probability percentage.
5. Pipeline stages define sequence, probability, required fields, allowed transitions, maximum duration, approvals, entry rules, exit rules, and automatic activities.
6. Open opportunities should have a future next activity; the system warns or creates a task when one is missing.
7. A quotation must preserve versions after being sent. Discount approvals are calculated from configurable thresholds.
8. Sales-order conversion validates quotation approval and expiry, customer status, credit availability, active products, pricing, and required approvals.
9. Credit exposure is outstanding invoices plus delivered-but-uninvoiced orders plus open sales orders. Available credit is approved credit less exposure.
10. Contract renewal preparation is contract end date minus configured lead time and may create a renewal opportunity, task, notification, and copied products.
11. SLA timers use business hours, pause while waiting for the customer, and escalate at configurable warning and breach thresholds.
12. Ownership, stage changes, merges, credit changes, approvals, portal shares, exports, permissions, and deletion/archive actions are audited.

## Permission model

Support role, record, field, action, and portal-level permissions. Access scopes include own records, team, territory, business unit, all records, and explicitly shared records. Sensitive fields such as credit limits, commission rates, compensation, consent, and internal notes require separate field permissions.

## Approval placement by module

The Admin module owns the central approval inbox, approval policies, delegation, escalation, and audit governance. Business modules retain contextual approval views for their own records: CRM shows quotation, contract, renewal, and credit-limit approval status; Accounting and Finance show financial approval context; ERP, POS, OMS, SCM, HR, and Files show only their own approval workflows. A module must not become a mixed approval workspace for unrelated domains.

## Customer 360 boundary

Customer 360 is CRM-owned and shows CRM relationships: customer summary, contacts, opportunities, quotes, orders, contracts, renewals, activities, service cases, complaints, campaigns, documents, relationships, and audit history. Financial, inventory, HR, and operations records remain owned by their modules and are displayed only through permission-filtered shared references.

## Delivery phases

1. Foundation: leads, organizations, contacts, opportunities, pipelines, activities, notes, permissions, custom fields, and duplicate detection.
2. Sales operations: quotations, sales-order references, contracts, renewals, approvals, credit visibility, Customer 360, and sales reports.
3. Service and marketing: cases, complaints, SLAs, campaigns, segmentation, attribution, surveys, and customer feedback.
4. Advanced operations: workflow engine, lead scoring, automatic assignment, forecasting, commissions, relationship mapping, portal sharing, notifications, and analytics.

### Phase 4 scope from the product roadmap

Phase 4 expands the CRM automation layer with:

- Workflow engine: event triggers, conditions, ordered actions, priorities, active/inactive rules, per-record idempotency, retries, and execution audit history.
- Lead scoring: configurable positive and negative signals, score thresholds, grading, qualification triggers, and score history.
- Automatic assignment: routing by territory, team, owner capacity, source, product interest, and round-robin rules, with reassignment history.
- Forecasting: pipeline coverage, weighted forecast, forecast categories, commit/best-case/pipeline views, targets, quotas, and forecast accuracy.
- Commissions: plans, rates, tiers, splits, adjustments, approval status, payable periods, and commission audit history.
- Relationship mapping: contacts, organizations, buying committees, stakeholder influence, relationship strength, and relationship history.
- Portal sharing: explicit customer access to approved CRM records, read-only defaults, expiry, revocation, field restrictions, and access audit.
- Advanced analytics: conversion funnels, lead-source performance, sales velocity, win/loss, forecast accuracy, campaign ROI, customer health, productivity, and lifetime value.

These capabilities remain CRM-owned and permission-aware. The Admin module governs shared workflow policies and audit controls, while CRM retains contextual configuration and record-level execution.

## Suggested future entities

`crm_lead`, `crm_organization`, `crm_contact`, `crm_contact_organization`, `crm_relationship`, `crm_opportunity`, `crm_pipeline`, `crm_pipeline_stage`, `crm_opportunity_stage_history`, `crm_activity`, `crm_quotation`, `crm_quotation_line`, `crm_sales_order_reference`, `crm_contract`, `crm_renewal`, `crm_case`, `crm_sla`, `crm_campaign`, `crm_campaign_member`, `crm_territory`, `crm_sales_team`, `crm_commission_plan`, `crm_duplicate_match`, `crm_custom_field`, `crm_workflow`, `crm_approval`, `crm_portal_share`, `crm_document`, and `crm_audit_log`.
