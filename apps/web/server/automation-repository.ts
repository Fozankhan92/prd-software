import type { AutomationEvent, AutomationResult, AutomationRule } from './automation-service';

export type AutomationExecution = { id: string; tenantId: string; ruleId: string; eventType: string; recordId: string; executionKey?: string; matched: boolean; result: AutomationResult; createdAt: string };
export type AutomationRepository = {
  listRules(tenantId: string): Promise<AutomationRule[]>;
  saveRule(tenantId: string, rule: AutomationRule): Promise<void>;
  recordExecution(execution: AutomationExecution): Promise<void>;
  listExecutions(tenantId: string, recordId?: string): Promise<AutomationExecution[]>;
};

export function createSqlAutomationRepository(db: { query<T = unknown>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }> }): AutomationRepository {
  return {
    async listRules(tenantId) {
      const result = await db.query<{ rule: AutomationRule }>('select rule from crm_automation_rule where tenant_id = $1 and active = true order by priority desc, name', [tenantId]);
      return result.rows.map((row) => row.rule);
    },
    async saveRule(tenantId, rule) {
      await db.query(`insert into crm_automation_rule (tenant_id, rule_id, name, event_type, rule, active, priority) values ($1, $2, $3, $4, $5::jsonb, $6, $7) on conflict (tenant_id, rule_id) do update set name = excluded.name, event_type = excluded.event_type, rule = excluded.rule, active = excluded.active, priority = excluded.priority, updated_at = now()`, [tenantId, rule.id, rule.name, rule.eventType, JSON.stringify(rule), rule.active, rule.priority ?? 0]);
    },
    async recordExecution(execution) {
      await db.query(`insert into crm_automation_execution (id, tenant_id, rule_id, event_type, record_id, execution_key, matched, result) values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb) on conflict (tenant_id, execution_key) do nothing`, [execution.id, execution.tenantId, execution.ruleId, execution.eventType, execution.recordId, execution.executionKey ?? null, execution.matched, JSON.stringify(execution.result)]);
    },
    async listExecutions(tenantId, recordId) {
      const result = await db.query<AutomationExecution>('select id, tenant_id as "tenantId", rule_id as "ruleId", event_type as "eventType", record_id as "recordId", matched, result, created_at as "createdAt" from crm_automation_execution where tenant_id = $1 and ($2::text is null or record_id = $2) order by created_at desc', [tenantId, recordId ?? null]);
      return result.rows;
    },
  };
}

export function executionFromEvent(event: AutomationEvent, result: AutomationResult, id = crypto.randomUUID()): AutomationExecution {
  return { id, tenantId: event.tenantId, ruleId: result.ruleId, eventType: event.type, recordId: event.recordId, executionKey: `${event.type}:${event.recordId}:${result.ruleId}`, matched: result.matched, result, createdAt: new Date().toISOString() };
}
