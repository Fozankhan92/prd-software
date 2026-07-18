# Deployment foundation

The web workspace currently runs in browser-local mode and has a server/API boundary ready for PostgreSQL. This document defines the production handoff.

## Local database

1. Copy `apps/web/.env.example` to `apps/web/.env.local`.
2. Start PostgreSQL with `docker compose -f apps/web/docker-compose.yml up -d postgres`.
3. Apply `apps/web/database-schema.sql` through the deployment migration process.
4. Set `DATABASE_URL` in the server environment only; never expose it to browser code.

## Production requirements

- Use a managed PostgreSQL service with encrypted connections, automated backups, point-in-time recovery, and restricted network access.
- Store database, signing, and notification credentials in the hosting provider secret manager.
- Run the SLA sweep as a protected scheduled worker, not from a browser tab.
- Serve portal routes through authenticated HTTPS and enforce tenant and record permissions server-side.
- Send structured logs and audit events to the monitoring provider; do not log tokens or customer-sensitive fields.
- Test restore procedures and retain backup/audit policies according to the organization's legal requirements.

## Health and release checks

Before each release, run TypeScript validation, all tests, the production build, schema migration checks, and a portal permission smoke test. The `/api/health` contract must not disclose database credentials or tenant data.
