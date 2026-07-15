# Product Design and UX Specification

PRD Software is a desktop-first, configurable platform for organizations across industries. CRM, HR, ERP, POS, inventory, OMS, SCM, accounting, and finance remain independent but connected modules.

## Design principles

- Desktop-first, offline-capable, fast, keyboard-friendly.
- Progressive disclosure: simple defaults with advanced controls.
- Consistent behavior across every module.
- Summary-to-detail navigation for administrators and managers.
- Every action has a visible status, owner, timestamp, and audit trail.
- Email is optional; internal username or staff code must work.
- Permissions apply at organization, module, record, field, and action levels.
- Cloud features are optional and separately permissioned.

## Global desktop shell

Left navigation, favorite modules, role-controlled visibility, organization and branch selector, global search, accounting period selector, sync status, notifications, user menu, command palette, workspace tabs, breadcrumbs, recently visited records, universal create menu, saved views, and keyboard shortcuts. Support light, dark, and high-contrast themes.

## Standard module screens

Every module provides an overview dashboard, list/workbench, detail view, create/edit form, approval workflow, reports, configuration, import/export, and audit/activity history. Lists support search, filters, saved views, columns, grouping, sorting, bulk actions, pagination, print, Excel, CSV, and PDF. Records support related records, files, notes, comments, tasks, approvals, history, print, and export.

## Shared React design system

Define tokens for color, typography, spacing, density, focus, elevation, and motion. Build reusable components for the app shell, data grid, forms, lookups, date/time/currency/tax/quantity inputs, status badges, permission matrix, approval timeline, activity feed, file attachments, charts, command palette, dialogs, drawers, notifications, import mapping, export options, and loading/empty/offline/error/conflict states.

## Permission UX

Show read-only indicators whenever editing is unavailable. Distinguish view, create, edit, delete, approve, export, print, share, manage permissions, and sensitive-field visibility. Explain why an action is disabled. The final decision intersects role, department, record ownership, explicit grant, and current session.

## Export UX

Use a common wizard for current view or full permitted data, selected records, columns, grouping, Excel, CSV, PDF, JSON, or print. Support PDF layout, attachment links, sensitive-field masking, reusable templates, export history, and audit logging.

## Accessibility and delivery

Target WCAG 2.2 AA principles, visible focus, keyboard navigation, readable contrast, non-color status indicators, accessible labels, and clear validation. Deliver design tokens and screen inventory first, then shared React components, core records and permissions, module vertical slices, reporting/export, Rust/Tauri native integrations, cloud sync, and release validation.
