import { describe, expect, it } from 'vitest';
import { runAutomations, type AutomationRule } from './automation-service';

const rule: AutomationRule = { id: 'r1', name: 'Escalate urgent case', eventType: 'service-case.created', active: true, conditions: [{ field: 'priority', operator: 'equals', value: 'Urgent' }], actions: [{ type: 'notify', target: 'service-manager', message: 'Urgent case requires attention.' }] };

describe('automation service', () => {
  it('runs matching active rules', () => {
    const results = runAutomations([rule], { tenantId: 't1', type: 'service-case.created', recordId: 'c1', fields: { priority: 'Urgent' } });
    expect(results).toHaveLength(1);
    expect(results[0].actions[0].type).toBe('notify');
  });
  it('does not run inactive or non-matching rules', () => {
    expect(runAutomations([{ ...rule, active: false }], { tenantId: 't1', type: 'service-case.created', recordId: 'c1', fields: { priority: 'Urgent' } })).toEqual([]);
    expect(runAutomations([rule], { tenantId: 't1', type: 'service-case.created', recordId: 'c1', fields: { priority: 'Low' } })).toEqual([]);
  });
});
