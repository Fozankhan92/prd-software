import type { AutomationAction, AutomationEvent } from './automation-service';

export type AutomationHandlers = { notify: (action: AutomationAction, event: AutomationEvent) => Promise<void>; 'create-task': (action: AutomationAction, event: AutomationEvent) => Promise<void>; 'request-approval': (action: AutomationAction, event: AutomationEvent) => Promise<void> };
export type AutomationExecution = { actionType: AutomationAction['type']; target: string; success: boolean; error?: string };

export async function executeAutomationActions(actions: AutomationAction[], event: AutomationEvent, handlers: AutomationHandlers): Promise<AutomationExecution[]> {
  const results: AutomationExecution[] = [];
  for (const action of actions) {
    try {
      await handlers[action.type](action, event);
      results.push({ actionType: action.type, target: action.target, success: true });
    } catch (error) {
      results.push({ actionType: action.type, target: action.target, success: false, error: error instanceof Error ? error.message : 'Automation action failed.' });
    }
  }
  return results;
}
