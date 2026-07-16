import { describe, expect, it } from 'vitest';
import { createWorkspaceHttpHandler } from './http-handler';
import type { WorkspaceApi } from '../api-contract';

const api: WorkspaceApi = { getWorkspace: async () => ({ data: { ok: true }, requestId: 'r1' } as never), saveWorkspace: async () => ({ error: { code: 'CONFLICT', message: 'stale' }, requestId: 'r2' }) };

describe('workspace HTTP handler', () => {
  it('requires bearer authentication', async () => {
    const response = await createWorkspaceHttpHandler(api, () => ({ tenantId: 't1' }))({ method: 'GET', path: '/api/v1/workspaces/t1', headers: {} });
    expect(response.status).toBe(401);
  });
  it('maps save conflicts to HTTP 409', async () => {
    const response = await createWorkspaceHttpHandler(api, () => ({ tenantId: 't1' }))({ method: 'PUT', path: '/api/v1/workspaces/t1', headers: { authorization: 'Bearer token' }, body: { organization: 'Demo' } });
    expect(response.status).toBe(409);
  });
});
