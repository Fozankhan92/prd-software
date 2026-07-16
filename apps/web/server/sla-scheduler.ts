import { evaluateSla, type SlaCase, type SlaPolicy } from './sla-service';
import type { Notification } from './notifications';

export type SlaCaseSource = { listOpenCases: (tenantId: string) => Promise<Array<SlaCase & { id: string; owner: string }>> };
export type SlaEscalationSink = { publish: (notification: Notification) => Promise<void> };

export async function runSlaSweep(tenantId: string, source: SlaCaseSource, sink: SlaEscalationSink, policy: SlaPolicy, now = new Date()): Promise<number> {
  const cases = await source.listOpenCases(tenantId);
  const breached = cases.filter((caseItem) => evaluateSla(caseItem, now, policy).shouldEscalate);
  await Promise.all(breached.map((caseItem) => sink.publish({ tenantId, recipient: caseItem.owner, subject: `SLA breach: ${caseItem.id}`, body: 'Customer service case requires escalation.', channel: 'in-app' })));
  return breached.length;
}
