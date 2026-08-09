import crypto from 'node:crypto';
import { config } from '../../config.js';

/**
 * Intouch (IntouchPay) direct MTN Mobile Money / Orange Money collection,
 * widely used by Cameroonian platforms as an alternative to Flutterwave.
 *
 * Field/endpoint names follow Intouch's classic "deposit" collection API at
 * the time this was written — confirm the exact contract against the
 * integration guide your Intouch account rep provides, as partner IDs and
 * signature schemes vary by contract.
 */

const SERVICE = {
  MTN_MOMO: 'CM_MOMO',
  ORANGE_MONEY: 'CM_OM',
};

export const intouchReady = () => Boolean(config.intouch.loginApi && config.intouch.passwordApi);

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Login-Api': config.intouch.loginApi,
  'X-Password-Api': config.intouch.passwordApi,
});

/** Pushes a collection request; the customer confirms with their Mobile Money PIN. */
export async function initiateIntouchDeposit({ reference, amountXAF, phone, method }) {
  if (!intouchReady()) {
    throw Object.assign(new Error('Intouch is not configured (INTOUCH_LOGIN_API missing)'), {
      code: 'PROVIDER_NOT_CONFIGURED',
    });
  }

  const res = await fetch(`${config.intouch.baseUrl}/v1/deposit`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      partner_id: config.intouch.partnerId,
      operation_reference: reference,
      amount: amountXAF,
      currency: 'XAF',
      recipient_number: phone,
      service: SERVICE[method],
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw Object.assign(new Error(data?.message || 'Intouch deposit could not be started'), {
      code: 'PROVIDER_ERROR',
      raw: data,
    });
  }

  return {
    providerRef: String(data.transaction_id ?? data.id ?? reference),
    instructions: 'Confirm the Mobile Money prompt on your phone with your PIN.',
    raw: data,
  };
}

export async function getIntouchDepositStatus(providerRef) {
  const res = await fetch(`${config.intouch.baseUrl}/v1/deposit/status/${providerRef}`, {
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw Object.assign(new Error(data?.message || 'Could not check Intouch deposit status'), {
      code: 'PROVIDER_ERROR',
    });
  }
  return data;
}

/** HMAC-SHA256 of the raw callback body, signed with the shared callback secret. */
export function verifyIntouchCallbackSignature(rawBody, signatureHeader) {
  const secret = config.intouch.callbackSecret;
  if (!secret || !signatureHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expected.length !== signatureHeader.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
