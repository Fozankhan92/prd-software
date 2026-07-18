import { runAutomations, type AutomationEvent } from './automation-service';
import { executionFromEvent, type AutomationRepository } from './automation-repository';
import { executeAutomationActions, type AutomationHandlers } from './automation-executor';

export async function processAutomationEvent(repository: AutomationRepository, handlers: AutomationHandlers, event: AutomationEvent): Promise<number> {
  const rules = await repository.listRules(event.tenantId);
  const results = runAutomations(rules, event);
  let processed = 0;
  for (const result of results) {
    const execution = executionFromEvent(event, result);
    const previous = await repository.listExecutions(event.tenantId, event.recordId);
    if (previous.some((item) => item.executionKey === execution.executionKey)) continue;
    await repository.recordExecution(execution);
    await executeAutomationActions(result.actions, event, handlers);
    processed += 1;
  }
  return processed;
}

export function createAutomationScheduler(repository: AutomationRepository, handlers: AutomationHandlers) {
  return { process: (event: AutomationEvent) => processAutomationEvent(repository, handlers, event) };
}
