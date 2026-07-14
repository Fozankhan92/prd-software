export type Role = 'platform_admin' | 'organization_admin' | 'department_admin' | 'manager' | 'staff' | 'viewer';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  roles: readonly Role[];
  status: 'invited' | 'active' | 'suspended';
}

export interface Session {
  id: string;
  tenantId: string;
  userId: string;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt?: string;
}

export function assertActiveUser(user: User): void {
  if (user.status !== 'active') throw new Error('user_not_active');
  if (!user.tenantId || !user.id || !user.email) throw new Error('user_identity_context_required');
}

export function canAdminister(user: User): boolean {
  return user.roles.includes('platform_admin') || user.roles.includes('organization_admin');
}
