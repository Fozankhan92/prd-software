import { describe, expect, it } from 'vitest';
import { createPostgresWorkspaceStore, type SqlClient } from './postgres-workspace-store';
import type { WebWorkspaceState } from '../app/web-store';

const state = (): WebWorkspaceState => ({ organization: 'Demo', adminName: 'Admin', tenantId: 't1', session: null, records: [], permissions: [], files: [], lineItems: [], approvals: [], portalShares: [], campaignMembers: [], customFields: [], customPipelineStages: [] });

describe('postgres workspace store', () => {
  it('uses parameterized tenant reads', async () => {
    let values: readonly unknown[] = [];
    const db: SqlClient = { query: async (_sql, params) => { values = params ?? []; return { rows: [{ state: state(), version: '1' }] }; } };
    const result = await createPostgresWorkspaceStore(db).read('tenant-1');
    expect(values).toEqual(['tenant-1']);
    expect(result?.version).toBe('1');
  });
  it('serializes workspace state and returns conflicts', async () => {
    let values: readonly unknown[] = [];
    const db: SqlClient = { query: async (_sql, params) => { values = params ?? []; return { rows: [] }; } };
    const result = await createPostgresWorkspaceStore(db).write('tenant-1', state(), '2');
    expect(values[0]).toBe('tenant-1');
    expect(JSON.parse(String(values[1])).organization).toBe('Demo');
    expect(result).toBe('CONFLICT');
  });
});
