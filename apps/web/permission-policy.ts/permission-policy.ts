export type PermissionAction = 'read' | 'edit' | 'delete' | 'export';

export type PermissionGrant = { subjectId: string; module: string; resourceId?: string; actions: readonly PermissionAction[]; effect: 'allow' | 'deny' };
export type PermissionRequest = { subjectId: string; module: string; resourceId: string; action: PermissionAction };

export function canAccess(request: PermissionRequest, grants: readonly PermissionGrant[]): boolean {
  const matching = grants.filter((grant) => grant.subjectId === request.subjectId && grant.module === request.module && (!grant.resourceId || grant.resourceId === request.resourceId));
  if (matching.some((grant) => grant.effect === 'deny' && grant.actions.includes(request.action))) return false;
  const moduleGrant = matching.find((grant) => !grant.resourceId && grant.effect === 'allow');
  const recordGrant = matching.find((grant) => grant.resourceId === request.resourceId && grant.effect === 'allow');
  return Boolean(moduleGrant?.actions.includes(request.action) && recordGrant?.actions.includes(request.action));
}
