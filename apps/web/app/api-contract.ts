import type { WebWorkspaceState } from './app/web-store';

export type WorkspaceApiError = { code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'CONFLICT' | 'SERVER_ERROR'; message: string };
export type WorkspaceApiResponse<T> = { data: T; requestId: string } | { error: WorkspaceApiError; requestId: string };

export type WorkspaceApi = {
  getWorkspace: (tenantId: string) => Promise<WorkspaceApiResponse<WebWorkspaceState>>;
  saveWorkspace: (tenantId: string, state: WebWorkspaceState, expectedVersion?: string) => Promise<WorkspaceApiResponse<{ version: string }>>;
};

export const workspaceApiRoutes = {
  get: '/api/v1/workspaces/:tenantId',
  save: '/api/v1/workspaces/:tenantId',
  health: '/api/health',
} as const;

export function resolveWorkspaceRoute(route: string, tenantId: string): string {
  return route.replace(':tenantId', encodeURIComponent(tenantId));
}
