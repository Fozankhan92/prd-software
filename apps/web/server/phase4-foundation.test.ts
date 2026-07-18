import { describe, expect, it } from 'vitest';
import { analyticsSnapshot, assignByRules, commissionTotal, relationshipHealth, scoreLead, weightedForecast } from './phase4-foundation';

describe('phase 4 foundation', () => {
  it('scores leads and assigns the highest priority matching rule', () => {
    expect(scoreLead([{ name: 'source', points: 10, matched: true }, { name: 'email', points: 5, matched: false }])).toBe(10);
    expect(assignByRules({ territory: 'north', segment: 'enterprise' }, [{ id: 'a', name: 'default', match: { territory: 'north' }, assignee: 'Team A', priority: 1 }, { id: 'b', name: 'key', match: { territory: 'north', segment: 'enterprise' }, assignee: 'Team B', priority: 5 }])).toBe('Team B');
  });

  it('calculates forecast, split commission, relationship health, and analytics', () => {
    expect(weightedForecast([{ amount: 1000, probability: 50, category: 'pipeline' }])).toBe(500);
    expect(commissionTotal([{ amount: 1000, rate: 10, split: 50 }])).toBe(50);
    expect(relationshipHealth([{ fromId: 'a', toId: 'b', type: 'influences', strength: 80, influence: 50 }])).toBe(40);
    expect(analyticsSnapshot({ leads: 10, qualifiedLeads: 4, won: 2, opportunities: 5, revenue: 1200, campaignCost: 200 })).toEqual({ leadConversionRate: 40, winRate: 40, campaignRoi: 500 });
  });
});
