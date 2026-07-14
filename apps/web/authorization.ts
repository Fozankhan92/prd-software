export type Action = 'read' | 'edit' | 'approve' | 'delete' | 'download' | 'share' | 'administer';

export type Effect = 'allow' | 'deny';

export interface PermissionGrant {
  tenantId: string;
  principalId: string;
  resourceId: string;
  action: Action;
  effect: Effect;
}

export interface AuthorizationRequest {
  tenantId: string;
  principalId: string;
  resourceId: string;
  action: Action;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reason: 'allowed' | 'tenant_mismatch' | 'visibility_denied' | 'action_denied';
}

export function authorize(request: AuthorizationRequest, grants: readonly PermissionGrant[]): AuthorizationDecision {
  const scoped = grants.filter((grant) => grant.tenantId === request.tenantId && grant.principalId === request.principalId && grant.resourceId === request.resourceId);
  if (grants.some((grant) => grant.principalId === request.principalId && grant.resourceId === request.resourceId && grant.tenantId !== request.tenantId)) return { allowed: false, reason: 'tenant_mismatch' };
  const visibility = scoped.filter((grant) => grant.action === 'read');
  if (visibility.some((grant) => grant.effect === 'deny')) return { allowed: false, reason: 'visibility_denied' };
  if (!visibility.some((grant) => grant.effect === 'allow')) return { allowed: false, reason: 'visibility_denied' };
  const actions = scoped.filter((grant) => grant.action === request.action);
  if (actions.some((grant) => grant.effect === 'deny')) return { allowed: false, reason: 'action_denied' };
  if (request.action !== 'read' && !actions.some((grant) => grant.effect === 'allow')) return { allowed: false, reason: 'action_denied' };
  return { allowed: true, reason: 'allowed' };
}
