export type AttributionTouch = { subjectId: string; source: string; occurredAt: string; revenue?: number };
export type AttributionModel = 'first-touch' | 'last-touch' | 'linear';

export function attributeRevenue(touches: AttributionTouch[], revenue: number, model: AttributionModel): Record<string, number> {
  if (!touches.length || revenue <= 0) return {};
  if (model === 'first-touch') return { [touches[0].source]: revenue };
  if (model === 'last-touch') return { [touches[touches.length - 1].source]: revenue };
  const share = revenue / touches.length;
  return touches.reduce<Record<string, number>>((result, touch) => ({ ...result, [touch.source]: (result[touch.source] ?? 0) + share }), {});
}
