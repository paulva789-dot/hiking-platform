import { config } from '../config.js';
import { badRequest } from './errors.js';

/** Server-side source of truth for prices — never trust an amount sent by the client. */
export const PREMIUM_PRICING_XAF = { 1: 3500, 6: 18000, 12: 30000 };
export const GUIDE_PLAN_MONTHLY_XAF = { BASIC: 10000, PRO: 25000 };

/** segment comes from req.user.travelerSegment, never from the request body
 * — a client-supplied segment would let anyone self-select the cheaper tier. */
export function priceForPremium(months, segment = 'LOCAL') {
  const base = PREMIUM_PRICING_XAF[months];
  if (!base) throw badRequest(`Premium is not sold in ${months}-month terms — choose 1, 6 or 12`);
  const multiplier = segment === 'INTERNATIONAL' ? config.premiumInternationalMultiplier : 1;
  return Math.round(base * multiplier);
}

export function priceForGuidePlan(plan, months) {
  const monthly = GUIDE_PLAN_MONTHLY_XAF[plan];
  if (!monthly) throw badRequest(`Unknown guide plan ${plan}`);
  if (!Number.isInteger(months) || months < 1 || months > 24) {
    throw badRequest('months must be between 1 and 24');
  }
  return monthly * months;
}
