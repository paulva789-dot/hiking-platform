import crypto from 'node:crypto';
import { config } from '../../config.js';

/**
 * Flutterwave mobile money collection for Cameroon (MTN / Orange).
 * Docs: https://developer.flutterwave.com/docs/collecting-payments/mobile-money/franco-phone
 *
 * Field names below follow Flutterwave's v3 "Franco phone" mobile money charge
 * endpoint at the time this was written — confirm against current API docs
 * before going live, payment provider APIs do change.
 */

const NETWORK = {
  MTN_MOMO: 'MTN',
  ORANGE_MONEY: 'ORANGE',
};

export const flutterwaveReady = () => Boolean(config.flutterwave.secretKey);

/**
 * Kicks off a mobile money charge. Flutterwave pushes a USSD/STK prompt to
 * the phone; the customer approves it, and Flutterwave calls our webhook.
 */
export async function initiateFlutterwaveCharge({ reference, amountXAF, phone, method, email, name }) {
  if (!flutterwaveReady()) {
    throw Object.assign(new Error('Flutterwave is not configured (FLUTTERWAVE_SECRET_KEY missing)'), {
      code: 'PROVIDER_NOT_CONFIGURED',
    });
  }

  const res = await fetch(`${config.flutterwave.baseUrl}/charges?type=mobile_money_franco`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.flutterwave.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: reference,
      amount: amountXAF,
      currency: 'XAF',
      phone_number: phone,
      network: NETWORK[method],
      email,
      fullname: name,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw Object.assign(new Error(data?.message || 'Flutterwave charge could not be started'), {
      code: 'PROVIDER_ERROR',
      raw: data,
    });
  }

  return {
    providerRef: String(data.data?.id ?? data.data?.flw_ref ?? reference),
    // Franco-phone mobile money is an in-app USSD/PIN prompt, not a redirect —
    // there is usually no `data.data.link` the way card charges have.
    instructions:
      data.data?.processor_response ||
      'Approve the payment prompt sent to your phone, then enter your Mobile Money PIN.',
    raw: data,
  };
}

/**
 * Refunds a charge back to the customer's Mobile Money wallet.
 * Docs: https://developer.flutterwave.com/docs/refunds — mobile money refunds
 * typically settle to the wallet in 3-5 days once accepted here.
 */
export async function refundFlutterwaveCharge({ providerRef, amountXAF, reason }) {
  if (!flutterwaveReady()) {
    throw Object.assign(new Error('Flutterwave is not configured (FLUTTERWAVE_SECRET_KEY missing)'), {
      code: 'PROVIDER_NOT_CONFIGURED',
    });
  }

  const res = await fetch(`${config.flutterwave.baseUrl}/refunds`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.flutterwave.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      charge_id: providerRef,
      amount: amountXAF,
      reason: reason || 'Booking cancelled by hiker',
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.status === 'error') {
    throw Object.assign(new Error(data?.message || 'Flutterwave refund could not be started'), {
      code: 'PROVIDER_ERROR',
      raw: data,
    });
  }

  return { refundRef: String(data.data?.id ?? providerRef), raw: data };
}

export async function verifyFlutterwaveTransaction(transactionId) {
  const res = await fetch(`${config.flutterwave.baseUrl}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${config.flutterwave.secretKey}` },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw Object.assign(new Error(data?.message || 'Could not verify Flutterwave transaction'), {
      code: 'PROVIDER_ERROR',
    });
  }
  return data.data;
}

/** Flutterwave signs webhooks with a static secret hash you set in the dashboard. */
export function verifyFlutterwaveWebhookSignature(headerHash) {
  const expected = config.flutterwave.webhookHash;
  if (!expected || !headerHash || headerHash.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(headerHash), Buffer.from(expected));
}
