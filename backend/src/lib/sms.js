import { config } from '../config.js';

/**
 * Africa's Talking SMS -- used to alert a Premium member's emergency contact
 * when a safety check-in goes overdue (see safety-checkin.routes.js and
 * safety-sweep.js). Same "not configured" honesty as the payment providers:
 * this fails loudly rather than pretending a message went out.
 */

export const smsReady = () => Boolean(config.africasTalking.apiKey && config.africasTalking.username);

export async function sendSms({ to, message }) {
  if (!smsReady()) {
    throw Object.assign(new Error('SMS is not configured (AFRICASTALKING_API_KEY missing)'), {
      code: 'PROVIDER_NOT_CONFIGURED',
    });
  }

  const body = new URLSearchParams({
    username: config.africasTalking.username,
    to,
    message,
    ...(config.africasTalking.senderId ? { from: config.africasTalking.senderId } : {}),
  });

  const res = await fetch(`${config.africasTalking.baseUrl}/messaging`, {
    method: 'POST',
    headers: {
      apiKey: config.africasTalking.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  const data = await res.json().catch(() => null);
  const recipient = data?.SMSMessageData?.Recipients?.[0];
  const ok = res.ok && recipient && /Success/i.test(recipient.status || '');

  if (!ok) {
    throw Object.assign(
      new Error(recipient?.status || data?.SMSMessageData?.Message || 'SMS could not be sent'),
      { code: 'PROVIDER_ERROR', raw: data }
    );
  }

  return { messageId: recipient.messageId, raw: data };
}
