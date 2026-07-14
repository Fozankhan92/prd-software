import { describe, expect, it } from 'vitest';
import { assertTenantRecord } from './storage';

describe('assertTenantRecord', () => {
  it('accepts a complete tenant-scoped record', () => {
    expect(() => assertTenantRecord({ tenantId: 'tenant-a', id: 'record-1', type: 'customer', data: {}, updatedAt: '2026-01-01T00:00:00.000Z' })).not.toThrow();
  });

  it('rejects records without tenant context', () => {
    expect(() => assertTenantRecord({ tenantId: '', id: 'record-1', type: 'customer', data: {}, updatedAt: '2026-01-01T00:00:00.000Z' })).toThrow('tenant_record_context_required');
  });
});
