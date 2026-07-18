export type SurveyType = 'CSAT' | 'NPS' | 'Customer feedback';
export type SurveyResponse = { surveyId: string; customerId: string; score?: number; comment?: string; submittedAt: string };
export type Survey = { id: string; name: string; type: SurveyType; audience: string; active: boolean; questions: string[] };

export function validateSurveyResponse(survey: Survey, response: SurveyResponse): string[] {
  const errors: string[] = [];
  if (!survey.active) errors.push('Survey is not active.');
  if (!response.customerId.trim()) errors.push('Customer is required.');
  if (response.score === undefined || !Number.isInteger(response.score)) errors.push('A whole-number score is required.');
  if (survey.type === 'CSAT' && (response.score! < 1 || response.score! > 5)) errors.push('CSAT score must be between 1 and 5.');
  if (survey.type === 'NPS' && (response.score! < 0 || response.score! > 10)) errors.push('NPS score must be between 0 and 10.');
  return errors;
}

export function summarizeSurvey(survey: Survey, responses: SurveyResponse[]) {
  const valid = responses.filter((response) => validateSurveyResponse(survey, response).length === 0);
  const average = valid.length ? valid.reduce((sum, response) => sum + (response.score ?? 0), 0) / valid.length : 0;
  if (survey.type !== 'NPS') return { responseCount: valid.length, average: Number(average.toFixed(2)) };
  const promoters = valid.filter((response) => (response.score ?? 0) >= 9).length;
  const detractors = valid.filter((response) => (response.score ?? 0) <= 6).length;
  return { responseCount: valid.length, average: Number(average.toFixed(2)), nps: valid.length ? Math.round((promoters - detractors) / valid.length * 100) : 0 };
}
