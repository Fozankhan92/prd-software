# Shared React Design System and Desktop UI Architecture

## Scope

The React interface is embedded inside the Tauri desktop application. It is not a standalone web product. The same components serve CRM, HR, ERP, POS, IMS, OMS, SCM, accounting, finance, administration, reporting, files, and settings.

## Design tokens

Define semantic tokens for background, surface, border, text, muted text, primary, success, warning, danger, focus, spacing, typography, density, radius, elevation, motion, and light/dark/high-contrast themes. Never hard-code module-specific colors.

## Application shell

Provide desktop navigation, role-filtered module menu, organization and branch switcher, global search, accounting period selector, sync state, notifications, command palette, workspace tabs, breadcrumbs, favorites, recent records, universal create menu, keyboard shortcuts, and session controls.

## Reusable components

Build AppShell, SideNav, TopBar, WorkspaceTabs, DataGrid, FilterBar, SavedViewPicker, RecordHeader, DetailPanel, FormSection, Field, Lookup, DateInput, CurrencyInput, QuantityInput, StatusBadge, ApprovalStepper, PermissionMatrix, ActivityTimeline, AttachmentPanel, CommentThread, NotificationCenter, KPIカード, ChartPanel, ImportWizard, ExportWizard, PrintPreview, ConfirmDialog, Toast, EmptyState, LoadingState, OfflineState, ConflictState, and ErrorState.

## Standard page contracts

Each module page has overview, workbench/list, record detail, create/edit form, approvals, reports, settings, import, export, and audit views. Each list supports search, filters, saved views, column selection, sorting, grouping, bulk actions, permission-aware actions, pagination, Excel, CSV, PDF, JSON, and print.

## Permission-aware UI

Every action checks view, create, edit, delete, approve, export, print, share, manage-permissions, and sensitive-field permissions. Read-only users see a clear read-only label and disabled controls with an explanation. Sensitive fields can be masked independently from record access.

## Form and workflow rules

Forms provide draft saving, validation summaries, inline errors, required markers, optional email fields, duplicate detection, attachments, narration/notes, autosave indicators, approval submission, rejection reasons, and audit history. Status transitions show actor, date, reason, and next permitted action.

## Export and print

ExportWizard supports current view or full permitted data, selected records, columns, grouping, totals, sensitive-field masking, reusable templates, Excel, CSV, PDF, JSON, and print. All exports are permission checked and written to audit history.

## Accessibility and testing

Use semantic labels, keyboard navigation, visible focus, readable contrast, non-color status indicators, reduced motion, accessible dialogs, and screen-reader-friendly tables. Test every component in loading, empty, error, offline, conflict, read-only, and populated states.

## Delivery order

1. Tokens and theme provider. 2. Desktop shell. 3. Data grid and form primitives. 4. Permission and workflow components. 5. Files, comments, audit, import/export, and reporting primitives. 6. CRM and HR vertical slices. 7. ERP, POS, IMS, OMS, SCM, accounting, and finance vertical slices. 8. Tauri/Rust native integrations and packaging.
