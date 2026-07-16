import { describe, expect, it } from 'vitest';
import { createWorkspaceRepository } from './workspace-repository';
import type { WebWorkspaceState } from './web-store';

const state = (): WebWorkspaceState => ({ organization: 'Demo', adminName: 'Admin', tenantId: 'tenant-1', session: null, records: [], permissions: [], files: [], lineItems: [], approvals: [], portalShares: [], campaignMembers: [], customFields: [], customPipelineStages: [] });

describe('workspace repository boundary', () => {
  it('delegates load and save to the selected adapter', () => {
    let stored = state();
    const repository = createWorkspaceRepository({ load: () => stored, save: (next) => { stored = next; } });
    expect(repository.load().organization).toBe('Demo');
    repository.save({ ...stored, organization: 'Updated' });
    expect(repository.load().organization).toBe('Updated');
  });
});
