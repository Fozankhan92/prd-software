import { describe, expect, it } from 'vitest';
import { attributeRevenue } from './attribution-service';
import { createSurveyDelivery } from './survey-delivery';
import type { Survey } from './survey-service';

const survey: Survey = { id: 's1', name: 'NPS', type: 'NPS', audience: 'Customers', active: true, questions: ['Recommend us?'] };

describe('survey delivery and attribution', () => {
  it('delegates invite delivery and response persistence', async () => {
    const received: string[] = [];
    const service = createSurveyDelivery({ sendInvite: async () => ({ providerId: 'p1' }) }, { saveResponse: async (response) => { received.push(response.customerId); } });
    expect((await service.send({ surveyId: 's1', customerId: 'c1', destination: 'customer@example.com', channel: 'email' }, survey)).providerId).toBe('p1');
    await service.receive({ surveyId: 's1', customerId: 'c1', score: 9, submittedAt: '2026-07-18' });
    expect(received).toEqual(['c1']);
  });
  it('supports first, last, and linear attribution', () => {
    const touches = [{ subjectId: 'o1', source: 'website', occurredAt: '2026-07-01' }, { subjectId: 'o1', source: 'event', occurredAt: '2026-07-02' }];
    expect(attributeRevenue(touches, 100, 'first-touch')).toEqual({ website: 100 });
    expect(attributeRevenue(touches, 100, 'last-touch')).toEqual({ event: 100 });
    expect(attributeRevenue(touches, 100, 'linear')).toEqual({ website: 50, event: 50 });
  });
});
