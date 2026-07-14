import type { Session, User } from './identity';

export interface AuthProvider {
  authenticate(identifier: string): Promise<User | null>;
}

export interface SessionStore {
  create(session: Session): Promise<void>;
  revoke(sessionId: string, revokedAt: string): Promise<void>;
  get(sessionId: string): Promise<Session | null>;
}

export function assertSessionUsable(session: Session, now: string): void {
  if (session.revokedAt) throw new Error('session_revoked');
  if (session.expiresAt && session.expiresAt <= now) throw new Error('session_expired');
  if (!session.tenantId || !session.userId) throw new Error('session_context_required');
}
