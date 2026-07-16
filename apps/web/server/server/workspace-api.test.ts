import { describe, expect, it } from 'vitest';
import { createWorkspaceApi, type WorkspaceStore } from './workspace-api';
import type { WebWorkspaceState } from '../app/web-store';

const state = (): WebWorkspaceState => ({ organization: 'Demo', adminName: 'Admin', tenantId: 't1', session: null, records: [], permissions: [], files: [], lineItems: [], approvals: [], portalShares: [], campaignMembers: [], customFields: [], customPipelineStages: [] });

describe('workspace API service', () => {
  it('denies tenants outside the authenticated scope', async () => {
    const store: WorkspaceStore = { read: async () => ({ state: state(), version: '1' }), write: async () => ({ version: '2' }) };
    const result = await createWorkspaceApi(store, (tenant) => tenant === 'allowed').getWorkspace('blocked');
    expect('error' in result && result.error.code).toBe('FORBIDDEN');
  });
  it('returns a conflict when the workspace version is stale', async () => {
    const store: WorkspaceStore = { read: async () => ({ state: state(), version: '1' }), write: async () => 'CONFLICT' };
    const result = await createWorkspaceApi(store, () => true).saveWorkspace('t1', state(), '0');
    expect('error' in result && result.error.code).toBe('CONFLICT');
  });
});
