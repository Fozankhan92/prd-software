import type { Survey, SurveyResponse } from './survey-service';

export type SurveyInvite = { surveyId: string; customerId: string; destination: string; channel: 'email' | 'sms' | 'portal' };
export type SurveyDeliveryProvider = { sendInvite: (invite: SurveyInvite, survey: Survey) => Promise<{ providerId: string }> };
export type SurveyResponseSink = { saveResponse: (response: SurveyResponse) => Promise<void> };

export function createSurveyDelivery(provider: SurveyDeliveryProvider, sink: SurveyResponseSink) {
  return {
    send: (invite: SurveyInvite, survey: Survey) => provider.sendInvite(invite, survey),
    receive: (response: SurveyResponse) => sink.saveResponse(response),
  };
}
