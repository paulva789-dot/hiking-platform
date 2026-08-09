import { Router } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, badRequest, forbidden, notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paymentInitiateSchema } from '../lib/schemas.js';
import { priceForGuidePlan, priceForPremium } from '../lib/pricing.js';
import { applyPaymentEntitlement } from '../lib/entitlements.js';
import {
  flutterwaveReady,
  initiateFlutterwaveCharge,
  verifyFlutterwaveWebhookSignature,
} from '../lib/payments/flutterwave.js';
import { initiateIntouchDeposit, intouchReady, verifyIntouchCallbackSignature } from '../lib/payments/intouch.js';

const router = Router();

const makeReference = () => `TC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

/** POST /api/payments/initiate — starts an MTN MoMo / Orange Money charge via Flutterwave or Intouch. */
router.post(
  '/initiate',
  requireAuth,
  validate(paymentInitiateSchema),
  asyncHandler(async (req, res) => {
    const { purpose, provider, method, phone } = req.body;

    if (provider === 'FLUTTERWAVE' && !flutterwaveReady()) {
      throw badRequest('Card/mobile money via Flutterwave is not configured on this server yet');
    }
    if (provider === 'INTOUCH' && !intouchReady()) {
      throw badRequest('Mobile money via Intouch is not configured on this server yet');
    }

    const amountXAF =
      purpose === 'PREMIUM_MEMBERSHIP'
        ? priceForPremium(req.body.months)
        : priceForGuidePlan(req.body.guidePlan, req.body.months);

    // A guide plan purchase needs a guide profile to attach the plan to.
    if (purpose === 'GUIDE_PLAN') {
      const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) throw badRequest('Create a guide profile before buying a plan');
    }

    const reference = makeReference();

    const payment = await prisma.payment.create({
      data: {
        reference,
        userId: req.user.id,
        provider,
        method,
        purpose,
        phone,
        amountXAF,
        months: req.body.months,
        guidePlan: purpose === 'GUIDE_PLAN' ? req.body.guidePlan : undefined,
      },
    });

    try {
      const result =
        provider === 'FLUTTERWAVE'
          ? await initiateFlutterwaveCharge({
              reference,
              amountXAF,
              phone,
              method,
              email: req.user.email,
              name: req.user.name,
            })
          : await initiateIntouchDeposit({ reference, amountXAF, phone, method });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerRef: result.providerRef },
      });

      res.status(201).json({
        reference,
        status: 'PENDING',
        amountXAF,
        instructions: result.instructions,
      });
    } catch (err) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: err.message?.slice(0, 500) },
      });
      throw badRequest(err.message || 'Could not start the payment — try again');
    }
  })
);

/** GET /api/payments/:reference — for the frontend to poll while the customer confirms on their phone. */
router.get(
  '/:reference',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payment = await prisma.payment.findUnique({ where: { reference: req.params.reference } });
    if (!payment) throw notFound('Payment not found');
    if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw forbidden('That payment belongs to another account');
    }
    res.json({
      reference: payment.reference,
      status: payment.status,
      amountXAF: payment.amountXAF,
      purpose: payment.purpose,
      failureReason: payment.failureReason,
    });
  })
);

// ------------------------------------------------------- provider webhooks

/**
 * POST /api/payments/flutterwave/webhook
 * Configure this URL in the Flutterwave dashboard along with the same
 * secret hash as FLUTTERWAVE_WEBHOOK_HASH.
 */
router.post(
  '/flutterwave/webhook',
  asyncHandler(async (req, res) => {
    const signature = req.headers['verif-hash'];
    if (!verifyFlutterwaveWebhookSignature(Array.isArray(signature) ? signature[0] : signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const reference = event?.data?.tx_ref || event?.txRef;
    const success = event?.data?.status === 'successful' || event?.status === 'successful';
    if (!reference) return res.status(200).json({ ok: true });

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment || payment.status !== 'PENDING') return res.status(200).json({ ok: true });

    if (success) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESSFUL' } });
      await applyPaymentEntitlement(payment);
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: event?.data?.processor_response || 'Charge failed' },
      });
    }

    res.status(200).json({ ok: true });
  })
);

/**
 * POST /api/payments/intouch/callback
 * Configure this URL with Intouch; body is HMAC-signed with
 * INTOUCH_CALLBACK_SECRET in an `x-intouch-signature` header.
 */
router.post(
  '/intouch/callback',
  asyncHandler(async (req, res) => {
    const signature = req.headers['x-intouch-signature'];
    const rawBody = JSON.stringify(req.body);
    if (!verifyIntouchCallbackSignature(rawBody, Array.isArray(signature) ? signature[0] : signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const reference = req.body?.operation_reference;
    const success = req.body?.status === 'SUCCESS' || req.body?.status === 'SUCCESSFUL';
    if (!reference) return res.status(200).json({ ok: true });

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment || payment.status !== 'PENDING') return res.status(200).json({ ok: true });

    if (success) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESSFUL' } });
      await applyPaymentEntitlement(payment);
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: req.body?.message || 'Charge failed' },
      });
    }

    res.status(200).json({ ok: true });
  })
);

export default router;
