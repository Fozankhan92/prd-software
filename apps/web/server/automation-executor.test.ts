import { describe, expect, it } from 'vitest';
import { executeAutomationActions } from './automation-executor';

describe('automation executor', () => {
  it('executes each action through its injected handler', async () => {
    const calls: string[] = [];
    const result = await executeAutomationActions([{ type: 'notify', target: 'manager', message: 'Review' }, { type: 'create-task', target: 'owner', message: 'Follow up' }], { tenantId: 't1', type: 'lead.created', recordId: 'l1', fields: {} }, { notify: async () => { calls.push('notify'); }, 'create-task': async () => { calls.push('task'); }, 'request-approval': async () => { calls.push('approval'); } });
    expect(calls).toEqual(['notify', 'task']);
    expect(result.every((item) => item.success)).toBe(true);
  });
  it('captures handler failures without stopping later actions', async () => {
    const result = await executeAutomationActions([{ type: 'notify', target: 'manager', message: 'Review' }, { type: 'request-approval', target: 'finance', message: 'Approve' }], { tenantId: 't1', type: 'quote.accepted', recordId: 'q1', fields: {} }, { notify: async () => { throw new Error('provider unavailable'); }, 'create-task': async () => undefined, 'request-approval': async () => undefined });
    expect(result[0].success).toBe(false);
    expect(result[0].error).toBe('provider unavailable');
    expect(result[1].success).toBe(true);
  });
});
