import { describe, expect, it } from 'vitest';
import { authorize, type PermissionGrant } from './authorization';

const base: PermissionGrant[] = [
  { tenantId: 'tenant-a', principalId: 'user-1', resourceId: 'file-1', action: 'read', effect: 'allow' },
  { tenantId: 'tenant-a', principalId: 'user-1', resourceId: 'file-1', action: 'edit', effect: 'allow' },
];

describe('authorize', () => {
  it('allows a visible resource when the requested action is granted', () => {
    expect(authorize({ tenantId: 'tenant-a', principalId: 'user-1', resourceId: 'file-1', action: 'edit' }, base)).toEqual({ allowed: true, reason: 'allowed' });
  });

  it('denies action access when visibility is missing', () => {
    expect(authorize({ tenantId: 'tenant-a', principalId: 'user-2', resourceId: 'file-1', action: 'read' }, base).reason).toBe('visibility_denied');
  });

  it('denies edit when the user can only read', () => {
    const grants = base.filter((grant) => grant.action === 'read');
    expect(authorize({ tenantId: 'tenant-a', principalId: 'user-1', resourceId: 'file-1', action: 'edit' }, grants)).toEqual({ allowed: false, reason: 'action_denied' });
  });

  it('lets an explicit deny override an allow', () => {
    const grants = [...base, { tenantId: 'tenant-a', principalId: 'user-1', resourceId: 'file-1', action: 'edit' as const, effect: 'deny' as const }];
    expect(authorize({ tenantId: 'tenant-a', principalId: 'user-1', resourceId: 'file-1', action: 'edit' }, grants)).toEqual({ allowed: false, reason: 'action_denied' });
  });

  it('denies cross-tenant access', () => {
    expect(authorize({ tenantId: 'tenant-b', principalId: 'user-1', resourceId: 'file-1', action: 'read' }, base)).toEqual({ allowed: false, reason: 'tenant_mismatch' });
  });
});
