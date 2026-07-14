[README .md](https://github.com/user-attachments/files/30008138/README.md)
# PRD Software

PRD Software is a custom, all-in-one business operations platform combining CRM, HR, ERP, POS, IMS, OMS, SCM, accounting, finance, document management, and secure cloud file sharing.

## Product vision

Create one connected workspace where departments share operational data and files while maintaining strict separation of access, edit rights, approvals, and audit history.

## Core modules

- CRM: customers, leads, contacts, pipelines, activities, and communication history
- HR: employees, departments, attendance, leave, payroll, recruitment, and performance
- ERP: organization-wide workflows, approvals, assets, and master data
- POS: products, sales, discounts, returns, tills, receipts, and outlets
- IMS: inventory, warehouses, stock movements, batches, serial numbers, and alerts
- OMS: orders, fulfillment, returns, delivery status, and customer notifications
- SCM: suppliers, purchasing, procurement, logistics, and demand planning
- Accounting and finance: chart of accounts, journals, invoices, payments, budgets, reporting, and reconciliation
- Cloud layer: secure file storage, sharing, versioning, previews, retention, and recovery
- Administration: dashboards, summaries, detailed drill-downs, policy management, audit logs, and system configuration

## Double-layer permission model

Access is evaluated at two independent layers:

1. **Visibility permission**: whether a user may discover and read a record or file.
2. **Action permission**: whether a user may edit, approve, delete, download, share, or administer it.

Read access never implies edit access. A user must pass both the resource visibility check and the requested-action check. Permissions can be granted by role, department, team, individual, project, record, folder, or file, with explicit deny rules taking precedence over inherited access.

## Administrative intelligence

Administrators receive role-aware executive summaries and detailed drill-down views covering operations, finance, HR, sales, inventory, orders, procurement, activity, risks, approvals, and security events. Every summary should link to the underlying authorized records.

## Initial architecture direction

- Modern TypeScript monorepo with strict typing, shared contracts, and domain-oriented modules
- Next.js 16 App Router and React for the web application
- Node.js Active LTS for backend services and workers, with the exact version pinned in the repository
- PostgreSQL 18 as the transactional system of record
- Redis-compatible infrastructure for queues, rate limits, sessions, locks, and short-lived caches
- S3-compatible object storage for files with metadata, versions, checksums, retention, previews, and access policies
- API-first backend with centralized authorization, OpenAPI contracts, validation, and immutable audit logging
- Background jobs for notifications, document processing, reporting, backups, and integrations
- Tenant-aware design so the product can support multiple companies and business units
- Containerized development, infrastructure as code, automated CI, observability, backups, and recovery testing
- Encryption in transit and at rest, secure secrets management, security headers, dependency scanning, and supply-chain controls

## MCP-ready integration layer

The platform must include an MCP server boundary from the beginning, but no AI tools, agents, models, prompts, or autonomous workflows are included in the initial product.

- MCP access is disabled by default and must be explicitly enabled by an administrator.
- The MCP server is a separate adapter layer and never bypasses the product API or permission engine.
- Future MCP resources, prompts, and tools must use the same tenant, identity, visibility, action, approval, and audit checks as the web application.
- The first release exposes zero business tools to AI clients. It provides only the versioned server foundation, authentication hooks, policy hooks, capability registry, rate limits, and audit events.
- Any future tool must be explicitly allowlisted, scoped, reviewed, versioned, rate-limited, and revocable.

## Repository roadmap

See [`docs/PRD.md`](docs/PRD.md) for the product requirements baseline, [`docs/SECURITY.md`](docs/SECURITY.md) for the security and permission model, and [`docs/MCP.md`](docs/MCP.md) for the AI-integration boundary.

This repository is intended to contain the custom product source code, technical documentation, database migrations, test suites, deployment configuration, and operational runbooks.
