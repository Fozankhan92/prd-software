import { describe, expect, it } from 'vitest';
import { createOrganizationBootstrap } from './organization';

describe('createOrganizationBootstrap', () => {
  it('creates a tenant and organization admin', () => {
    expect(createOrganizationBootstrap({ id: 'tenant-a', name: 'Acme Ltd', slug: 'Acme-Ltd', adminUserId: 'user-1', now: '2026-01-01T00:00:00.000Z' })).toEqual({ organization: { id: 'tenant-a', tenantId: 'tenant-a', name: 'Acme Ltd', slug: 'acme-ltd', createdAt: '2026-01-01T00:00:00.000Z' }, adminUserId: 'user-1', role: 'organization_admin' });
  });

  it('rejects an empty organization name', () => {
    expect(() => createOrganizationBootstrap({ id: 'tenant-a', name: '  ', slug: 'acme', adminUserId: 'user-1' })).toThrow('organization_name_required');
  });

  it('rejects unsafe slugs', () => {
    expect(() => createOrganizationBootstrap({ id: 'tenant-a', name: 'Acme', slug: 'Acme Ltd', adminUserId: 'user-1' })).toThrow('organization_slug_invalid');
  });
});
