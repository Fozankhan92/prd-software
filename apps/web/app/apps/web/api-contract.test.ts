import { describe, expect, it } from 'vitest';
import { resolveWorkspaceRoute, workspaceApiRoutes, type WorkspaceApiResponse } from '../../../api-contract';

describe('workspace API contract', () => {
  it('resolves tenant-scoped routes safely', () => {
    expect(resolveWorkspaceRoute(workspaceApiRoutes.get, 'tenant/acme')).toBe('/api/v1/workspaces/tenant%2Facme');
  });

  it('models structured API errors for the future server adapter', () => {
    const response: WorkspaceApiResponse<unknown> = { error: { code: 'FORBIDDEN', message: 'Read permission required.' }, requestId: 'req-1' };
    expect('error' in response && response.error.code).toBe('FORBIDDEN');
  });
});
