import type { WebWorkspaceState } from './web-store';

/** Storage boundary for the web application. Replace the browser adapter with an authenticated API adapter later. */
export type WorkspaceRepository = {
  load(): WebWorkspaceState;
  save(state: WebWorkspaceState): void;
};

export function createWorkspaceRepository(adapter: WorkspaceRepository): WorkspaceRepository {
  return {
    load: () => adapter.load(),
    save: (state) => adapter.save(state),
  };
}

export function createApiWorkspaceRepository(config: { baseUrl: string; tenantId: string; getToken: () => string | undefined }): WorkspaceRepository {
  // The synchronous interface keeps the current UI stable. API calls are intentionally deferred
  // until the authenticated server adapter is wired in; no credentials or data are sent here.
  return {
    load: () => { throw new Error(`API workspace adapter pending for ${config.baseUrl} / ${config.tenantId}`); },
    save: () => { throw new Error('API workspace adapter pending'); },
  };
}
