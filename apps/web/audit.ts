export type AuditOutcome = 'allowed' | 'denied' | 'success' | 'failure';
export type AuditEventType = 'authorization' | 'authentication' | 'mutation' | 'sharing' | 'download' | 'admin';

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  eventType: AuditEventType;
  action: string;
  resourceId?: string;
  outcome: AuditOutcome;
  reason?: string;
  correlationId: string;
  occurredAt: string;
  metadata?: Readonly<Record<string, string>>;
}

export function createAuditEvent(input: Omit<AuditEvent, 'occurredAt'> & { occurredAt?: string }): AuditEvent {
  if (!input.tenantId || !input.actorId || !input.correlationId) throw new Error('audit_context_required');
  return { ...input, occurredAt: input.occurredAt ?? new Date().toISOString() };
}
