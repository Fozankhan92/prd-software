export type SlaCase = { openedAt: string; dueAt: string; status: string; pausedMinutes?: number };
export type SlaPolicy = { warningMinutes: number; businessStartHour: number; businessEndHour: number; weekdaysOnly?: boolean };

export function evaluateSla(caseItem: SlaCase, now = new Date(), policy: SlaPolicy = { warningMinutes: 60, businessStartHour: 9, businessEndHour: 17, weekdaysOnly: true }) {
  if (['Resolved', 'Closed'].includes(caseItem.status)) return { state: 'closed' as const, remainingMinutes: 0, shouldEscalate: false };
  if (caseItem.status === 'Waiting for Customer') return { state: 'paused' as const, remainingMinutes: minutesBetween(now, new Date(caseItem.dueAt)), shouldEscalate: false };
  const dueAt = new Date(caseItem.dueAt);
  const remainingMinutes = minutesBetween(now, dueAt);
  const state = remainingMinutes < 0 ? 'breached' : remainingMinutes <= policy.warningMinutes ? 'warning' : 'on-track';
  return { state: state as 'breached' | 'warning' | 'on-track', remainingMinutes, shouldEscalate: state === 'breached' };
}

export function addBusinessMinutes(start: Date, minutes: number, policy: SlaPolicy): Date {
  const result = new Date(start);
  let remaining = Math.max(0, minutes);
  while (remaining > 0) {
    const weekday = result.getUTCDay();
    const inBusinessDay = !policy.weekdaysOnly || (weekday > 0 && weekday < 6);
    if (inBusinessDay && result.getUTCHours() >= policy.businessStartHour && result.getUTCHours() < policy.businessEndHour) {
      result.setUTCMinutes(result.getUTCMinutes() + 1);
      remaining -= 1;
    } else {
      if (result.getUTCHours() >= policy.businessEndHour) result.setUTCDate(result.getUTCDate() + 1);
      result.setUTCHours(policy.businessStartHour, 0, 0, 0);
      if (result.getUTCDay() === 0) result.setUTCDate(result.getUTCDate() + 1);
      if (result.getUTCDay() === 6) result.setUTCDate(result.getUTCDate() + 2);
    }
  }
  return result;
}

function minutesBetween(from: Date, to: Date): number { return Math.round((to.getTime() - from.getTime()) / 60000); }
