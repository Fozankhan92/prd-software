import { describe, expect, it } from 'vitest';
import { runSlaSweep } from './sla-scheduler';
import { authorizePortalToken } from './portal-auth';
import { createNotificationService } from './notifications';

describe('remaining Phase 3 foundations', () => {
  it('publishes only breached SLA cases', async () => {
    const sent: string[] = [];
    const count = await runSlaSweep('t1', { listOpenCases: async () => [{ id: 'case-1', owner: 'u1', openedAt: '2026-07-16T09:00:00Z', dueAt: '2026-07-16T10:00:00Z', status: 'In Progress' }, { id: 'case-2', owner: 'u2', openedAt: '2026-07-16T09:00:00Z', dueAt: '2026-07-16T12:00:00Z', status: 'In Progress' }] }, { publish: async (notification) => { sent.push(notification.recipient); } }, { warningMinutes: 30, businessStartHour: 9, businessEndHour: 17 }, new Date('2026-07-16T11:00:00Z'));
    expect(count).toBe(1);
    expect(sent).toEqual(['u1']);
  });
  it('rejects expired or cross-tenant portal tokens', async () => {
    const verifier = { verify: async () => ({ subject: 'customer-1', tenantId: 't1', expiresAt: '2026-12-31T00:00:00Z' }) };
    expect((await authorizePortalToken(verifier, 'token', 't2'))).toBeNull();
    expect((await authorizePortalToken(verifier, 'token', 't1'))?.subject).toBe('customer-1');
  });
  it('delegates notifications to the configured provider', async () => {
    const service = createNotificationService({ send: async () => ({ delivered: true, providerId: 'p1' }) });
    expect((await service.notify({ tenantId: 't1', recipient: 'u1', subject: 'Test', body: 'Body', channel: 'in-app' })).delivered).toBe(true);
  });
});
