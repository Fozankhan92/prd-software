import { describe, expect, it } from 'vitest';
import { summarizeSurvey, validateSurveyResponse, type Survey } from './survey-service';

const nps: Survey = { id: 's1', name: 'Quarterly NPS', type: 'NPS', audience: 'Customers', active: true, questions: ['How likely are you to recommend us?'] };

describe('survey service', () => {
  it('validates CSAT and NPS ranges', () => {
    expect(validateSurveyResponse({ ...nps, type: 'CSAT' }, { surveyId: 's1', customerId: 'c1', score: 6, submittedAt: '2026-07-18' })).toContain('CSAT score must be between 1 and 5.');
    expect(validateSurveyResponse(nps, { surveyId: 's1', customerId: 'c1', score: 10, submittedAt: '2026-07-18' })).toEqual([]);
  });
  it('calculates NPS from promoters and detractors', () => {
    const result = summarizeSurvey(nps, [9, 10, 5].map((score) => ({ surveyId: 's1', customerId: `c${score}`, score, submittedAt: '2026-07-18' })));
    expect(result.nps).toBe(33);
    expect(result.responseCount).toBe(3);
  });
});
