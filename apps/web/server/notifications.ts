export type Notification = { tenantId: string; recipient: string; subject: string; body: string; channel: 'in-app' | 'email' | 'sms' };
export type NotificationProvider = { send: (notification: Notification) => Promise<{ delivered: boolean; providerId?: string }> };

export function createNotificationService(provider: NotificationProvider) {
  return { notify: (notification: Notification) => provider.send(notification) };
}
