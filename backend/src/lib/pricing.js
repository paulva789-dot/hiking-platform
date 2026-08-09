import { badRequest } from './errors.js';

/** Server-side source of truth for prices — never trust an amount sent by the client. */
export const PREMIUM_PRICING_XAF = { 1: 3500, 6: 18000, 12: 30000 };
export const GUIDE_PLAN_MONTHLY_XAF = { BASIC: 10000, PRO: 25000 };

export function priceForPremium(months) {
  const price = PREMIUM_PRICING_XAF[months];
  if (!price) throw badRequest(`Premium is not sold in ${months}-month terms — choose 1, 6 or 12`);
  return price;
}

export function priceForGuidePlan(plan, months) {
  const monthly = GUIDE_PLAN_MONTHLY_XAF[plan];
  if (!monthly) throw badRequest(`Unknown guide plan ${plan}`);
  if (!Number.isInteger(months) || months < 1 || months > 24) {
    throw badRequest('months must be between 1 and 24');
  }
  return monthly * months;
}
