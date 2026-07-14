import { describe, expect, it } from 'vitest';
import { assertSessionUsable } from './auth';

const session = { id: 'session-1', tenantId: 'tenant-a', userId: 'user-1', issuedAt: '2026-01-01T00:00:00.000Z', expiresAt: '2026-01-02T00:00:00.000Z' };

describe('assertSessionUsable', () => {
  it('accepts a live tenant-scoped session', () => {
    expect(() => assertSessionUsable(session, '2026-01-01T12:00:00.000Z')).not.toThrow();
  });

  it('rejects revoked sessions', () => {
    expect(() => assertSessionUsable({ ...session, revokedAt: '2026-01-01T13:00:00.000Z' }, '2026-01-01T14:00:00.000Z')).toThrow('session_revoked');
  });

  it('rejects expired sessions', () => {
    expect(() => assertSessionUsable(session, '2026-01-03T00:00:00.000Z')).toThrow('session_expired');
  });

  it('rejects sessions without tenant context', () => {
    expect(() => assertSessionUsable({ ...session, tenantId: '' }, '2026-01-01T12:00:00.000Z')).toThrow('session_context_required');
  });
});
