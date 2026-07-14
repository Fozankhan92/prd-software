import { describe, expect, it } from 'vitest';

function assertHrTenantContext(record: { id: string; tenantId: string }): void {
  if (!record.id || !record.tenantId) throw new Error('hr_tenant_context_required');
}

describe('HR tenant context', () => {
  it('accepts a department', () => {
    expect(() => assertHrTenantContext({ id: 'dept-1', tenantId: 'tenant-a' })).not.toThrow();
  });

  it('accepts an employee', () => {
    expect(() => assertHrTenantContext({ id: 'employee-1', tenantId: 'tenant-a' })).not.toThrow();
  });

  it('rejects missing tenant context', () => {
    expect(() => assertHrTenantContext({ id: 'employee-1', tenantId: '' })).toThrow('hr_tenant_context_required');
  });
});
