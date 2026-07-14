import { describe, expect, it } from 'vitest';
import { assertActiveUser, canAdminister, type User } from './identity';

const admin: User = { id: 'user-1', tenantId: 'tenant-a', email: 'admin@example.com', displayName: 'Admin', roles: ['organization_admin'], status: 'active' };

describe('identity', () => {
  it('accepts active users with tenant context', () => {
    expect(() => assertActiveUser(admin)).not.toThrow();
  });

  it('rejects suspended users', () => {
    expect(() => assertActiveUser({ ...admin, status: 'suspended' })).toThrow('user_not_active');
  });

  it('limits administration to administrator roles', () => {
    expect(canAdminister(admin)).toBe(true);
    expect(canAdminister({ ...admin, roles: ['viewer'] })).toBe(false);
  });
});
