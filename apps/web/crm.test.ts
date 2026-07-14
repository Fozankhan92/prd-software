import { describe, expect, it } from 'vitest';
import { assertCrmTenantContext } from './crm';

describe('CRM tenant context', () => {
  it('accepts a tenant-scoped organization', () => {
    expect(() => assertCrmTenantContext({ id: 'org-1', tenantId: 'tenant-a', name: 'Acme', createdAt: '2026-01-01T00:00:00.000Z' })).not.toThrow();
  });

  it('accepts a tenant-scoped contact', () => {
    expect(() => assertCrmTenantContext({ id: 'contact-1', tenantId: 'tenant-a', firstName: 'Ava', lastName: 'Khan', createdAt: '2026-01-01T00:00:00.000Z' })).not.toThrow();
  });

  it('rejects records without tenant context', () => {
    expect(() => assertCrmTenantContext({ id: 'org-1', tenantId: '', name: 'Acme', createdAt: '2026-01-01T00:00:00.000Z' })).toThrow('crm_tenant_context_required');
  });
});
