import { describe, expect, it, vi } from 'vitest';
import { createSqlAutomationRepository, executionFromEvent } from './automation-repository';

describe('automation repository', () => {
  it('persists rules and execution history through the SQL boundary', async () => {
    const query = vi.fn(async (text: string) => text.startsWith('select rule') ? { rows: [{ rule: { id: 'r1', name: 'Route', eventType: 'lead.created', conditions: [], actions: [], active: true } }] } : { rows: [] });
    const repository = createSqlAutomationRepository({ query });
    const rules = await repository.listRules('t1');
    await repository.saveRule('t1', rules[0]);
    await repository.recordExecution(executionFromEvent({ tenantId: 't1', type: 'lead.created', recordId: 'l1', fields: {} }, { ruleId: 'r1', matched: true, actions: [] }, 'e1'));
    expect(rules[0].id).toBe('r1');
    expect(query).toHaveBeenCalledTimes(3);
  });
});
