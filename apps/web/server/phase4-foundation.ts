export type LeadSignal = { name: string; points: number; matched: boolean };
export type AssignmentRule = { id: string; name: string; match: Record<string, string>; assignee: string; priority: number };
export type ForecastOpportunity = { amount: number; probability: number; category: 'pipeline' | 'best-case' | 'commit' };
export type CommissionLine = { amount: number; rate: number; split?: number };
export type Relationship = { fromId: string; toId: string; type: string; strength: number; influence?: number };

export function scoreLead(signals: LeadSignal[]): number {
  return Math.max(0, signals.filter((signal) => signal.matched).reduce((total, signal) => total + signal.points, 0));
}

export function assignByRules(fields: Record<string, string>, rules: AssignmentRule[]): string | null {
  return [...rules].sort((a, b) => b.priority - a.priority).find((rule) => Object.entries(rule.match).every(([key, value]) => fields[key] === value))?.assignee ?? null;
}

export function weightedForecast(opportunities: ForecastOpportunity[]): number {
  return opportunities.reduce((total, opportunity) => total + opportunity.amount * opportunity.probability / 100, 0);
}

export function commissionTotal(lines: CommissionLine[]): number {
  return lines.reduce((total, line) => total + line.amount * line.rate / 100 * (line.split ?? 100) / 100, 0);
}

export function relationshipHealth(relationships: Relationship[]): number {
  if (!relationships.length) return 0;
  return relationships.reduce((total, relationship) => total + relationship.strength * (relationship.influence ?? 100) / 100, 0) / relationships.length;
}

export function analyticsSnapshot(input: { leads: number; qualifiedLeads: number; won: number; opportunities: number; revenue: number; campaignCost: number }) {
  return {
    leadConversionRate: input.leads ? input.qualifiedLeads / input.leads * 100 : 0,
    winRate: input.opportunities ? input.won / input.opportunities * 100 : 0,
    campaignRoi: input.campaignCost ? (input.revenue - input.campaignCost) / input.campaignCost * 100 : 0,
  };
}
