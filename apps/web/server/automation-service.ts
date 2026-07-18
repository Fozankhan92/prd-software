export type AutomationEvent = { tenantId: string; type: string; recordId: string; fields: Record<string, string | number | boolean> };
export type AutomationCondition = { field: string; operator: 'equals' | 'not_equals' | 'contains' | 'greater_than'; value: string | number | boolean };
export type AutomationAction = { type: 'notify' | 'create-task' | 'request-approval'; target: string; message: string };
export type AutomationRule = { id: string; name: string; eventType: string; conditions: AutomationCondition[]; actions: AutomationAction[]; active: boolean };
export type AutomationResult = { ruleId: string; matched: boolean; actions: AutomationAction[] };

export function evaluateAutomation(rule: AutomationRule, event: AutomationEvent): AutomationResult {
  if (!rule.active || rule.eventType !== event.type || rule.conditions.some((condition) => !matches(condition, event.fields[condition.field]))) return { ruleId: rule.id, matched: false, actions: [] };
  return { ruleId: rule.id, matched: true, actions: rule.actions };
}

export function runAutomations(rules: AutomationRule[], event: AutomationEvent): AutomationResult[] {
  return rules.map((rule) => evaluateAutomation(rule, event)).filter((result) => result.matched);
}

function matches(condition: AutomationCondition, actual: string | number | boolean | undefined): boolean {
  if (actual === undefined) return false;
  if (condition.operator === 'equals') return actual === condition.value;
  if (condition.operator === 'not_equals') return actual !== condition.value;
  if (condition.operator === 'contains') return String(actual).toLowerCase().includes(String(condition.value).toLowerCase());
  return Number(actual) > Number(condition.value);
}
