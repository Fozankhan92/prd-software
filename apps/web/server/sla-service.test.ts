import { describe, expect, it } from 'vitest';
import { addBusinessMinutes, evaluateSla } from './sla-service';

describe('SLA service', () => {
  it('pauses while waiting for customer', () => {
    const result = evaluateSla({ openedAt: '2026-07-16T09:00:00Z', dueAt: '2026-07-16T10:00:00Z', status: 'Waiting for Customer' }, new Date('2026-07-16T12:00:00Z'));
    expect(result.state).toBe('paused');
    expect(result.shouldEscalate).toBe(false);
  });
  it('flags breached cases for escalation', () => {
    const result = evaluateSla({ openedAt: '2026-07-16T09:00:00Z', dueAt: '2026-07-16T10:00:00Z', status: 'In Progress' }, new Date('2026-07-16T11:00:00Z'));
    expect(result.state).toBe('breached');
    expect(result.shouldEscalate).toBe(true);
  });
  it('skips weekends when adding business minutes', () => {
    const result = addBusinessMinutes(new Date('2026-07-17T16:30:00Z'), 60, { warningMinutes: 30, businessStartHour: 9, businessEndHour: 17, weekdaysOnly: true });
    expect(result.toISOString()).toBe('2026-07-20T09:30:00.000Z');
  });
});
