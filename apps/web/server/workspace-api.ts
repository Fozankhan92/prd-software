import type { WorkspaceApi, WorkspaceApiResponse } from '../api-contract';
import type { WebWorkspaceState } from '../app/web-store';

export type WorkspaceStore = {
  read: (tenantId: string) => Promise<{ state: WebWorkspaceState; version: string } | null>;
  write: (tenantId: string, state: WebWorkspaceState, expectedVersion?: string) => Promise<{ version: string } | 'CONFLICT'>;
};

export function createWorkspaceApi(store: WorkspaceStore, canAccessTenant: (tenantId: string) => boolean): WorkspaceApi {
  const responseId = () => crypto.randomUUID();
  const denied = <T>(): WorkspaceApiResponse<T> => ({ error: { code: 'FORBIDDEN', message: 'The current user cannot access this tenant.' }, requestId: responseId() });
  return {
    async getWorkspace(tenantId) {
      if (!tenantId || !canAccessTenant(tenantId)) return denied();
      const value = await store.read(tenantId);
      if (!value) return { error: { code: 'SERVER_ERROR', message: 'Workspace was not found.' }, requestId: responseId() };
      return { data: value.state, requestId: responseId() };
    },
    async saveWorkspace(tenantId, state, expectedVersion) {
      if (!tenantId || !canAccessTenant(tenantId)) return denied();
      if (!state.organization.trim() || !state.adminName.trim()) return { error: { code: 'VALIDATION_ERROR', message: 'Organization and administrator are required.' }, requestId: responseId() };
      const result = await store.write(tenantId, state, expectedVersion);
      if (result === 'CONFLICT') return { error: { code: 'CONFLICT', message: 'Workspace changed elsewhere. Reload before saving.' }, requestId: responseId() };
      return { data: result, requestId: responseId() };
    },
  };
}
