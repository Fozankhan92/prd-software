import { describe, expect, it } from 'vitest';
import { createAuditEvent } from './audit';

describe('createAuditEvent', () => {
  it('creates an event with a stable timestamp', () => {
    expect(createAuditEvent({ id: 'event-1', tenantId: 'tenant-a', actorId: 'user-1', eventType: 'authorization', action: 'edit', resourceId: 'file-1', outcome: 'denied', reason: 'action_denied', correlationId: 'corr-1', occurredAt: '2026-01-01T00:00:00.000Z' })).toMatchObject({ tenantId: 'tenant-a', actorId: 'user-1', occurredAt: '2026-01-01T00:00:00.000Z' });
  });

  it('requires audit context', () => {
    expect(() => createAuditEvent({ id: 'event-1', tenantId: '', actorId: 'user-1', eventType: 'admin', action: 'delete', outcome: 'failure', correlationId: 'corr-1' })).toThrow('audit_context_required');
  });
});
