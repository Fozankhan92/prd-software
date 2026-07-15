# Entry-Point Mounting Guide

## Current state

The native desktop shell is implemented in DesktopShell.tsx, DesktopApp.tsx, DesktopWorkspaceFrame.tsx, and DesktopEntryPoint.tsx. The existing page.tsx remains the authenticated admin dashboard and must remain the fallback until the native shell passes verification.

## Mount contract

DesktopEntryPoint accepts:
- useNativeShell: feature flag
- nativeWorkspace: DesktopApp or DesktopWorkspaceFrame
- legacyWorkspace: current authenticated dashboard

The initial production-safe default is false. This preserves login, local database bootstrap, permission grants, audit logging, and existing module summaries.

## Enablement sequence

1. Add the DesktopEntryPoint import to page.tsx.
2. Pass the existing dashboard JSX as legacyWorkspace.
3. Pass DesktopApp or an authenticated DesktopWorkspaceFrame as nativeWorkspace.
4. Keep useNativeShell false in development until the full flow is verified.
5. Enable the flag only after TypeScript, lint, unit tests, Tauri build, database bootstrap, permissions, offline behavior, and restore flows pass.
6. Retain a user-visible fallback or recovery setting for failed migrations.

## Verification gates

- First-launch administrator setup still works.
- Optional email remains optional.
- Read-only and edit permissions remain separate.
- Admin summary and detail views remain available.
- CRM, HR, ERP, POS, IMS, OMS, SCM, accounting, finance, and Files/Cloud navigation is permission-aware.
- No web deployment is required; the UI runs inside the Tauri desktop application.
