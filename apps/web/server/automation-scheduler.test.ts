import { describe, expect, it, vi } from 'vitest';
import { createAutomationScheduler } from './automation-scheduler';
import type { AutomationRepository } from './automation-repository';

describe('automation scheduler', () => {
  it('loads matching tenant rules, executes actions, and records history', async () => {
    const repository: AutomationRepository = {
      listRules: vi.fn(async () => [{ id: 'r1', name: 'Notify', eventType: 'lead.created', conditions: [], actions: [{ type: 'notify', target: 'owner', message: 'New lead' }], active: true }]),
      saveRule: vi.fn(),
      recordExecution: vi.fn(async () => undefined),
      listExecutions: vi.fn(),
    };
    const notify = vi.fn(async () => undefined);
    const scheduler = createAutomationScheduler(repository, { notify, 'create-task': vi.fn(), 'request-approval': vi.fn() });
    await expect(scheduler.process({ tenantId: 't1', type: 'lead.created', recordId: 'l1', fields: {} })).resolves.toBe(1);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ target: 'owner', message: 'New lead' }), expect.objectContaining({ recordId: 'l1' }));
    expect(repository.recordExecution).toHaveBeenCalledTimes(1);
  });
});
