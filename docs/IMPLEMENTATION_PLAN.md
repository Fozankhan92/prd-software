# Implementation Plan

## Milestone 1 — Foundation

1. Create a Tauri 2 workspace with React and TypeScript UI plus Rust application boundary.
2. Define shared contracts for tenants, organizations, users, roles, resources, permission grants, and audit events.
3. Implement encrypted local database migrations for identity, authorization, and audit tables.
4. Implement a fail-closed double-layer permission service with tests.
5. Add login, organization setup, and admin bootstrap flow.
6. Add an admin dashboard shell with summary-to-detail navigation.
7. Add disabled cloud sync and MCP adapter interfaces.

## Acceptance criteria

- Visibility and action permissions are evaluated independently.
- Read access never grants edit, delete, download, share, approve, or administer access.
- Explicit denies override inherited grants.
- Cross-tenant access fails closed.
- Authorization decisions and mutations create audit events.
- MCP is disabled and exposes zero business tools by default.

## Delivery order

Foundation and authorization first; then files and collaboration; then CRM and inventory; then HR, POS, OMS, SCM, accounting, and finance.
