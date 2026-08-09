import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, badRequest, conflict, notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ------------------------------------------------------- safety guidelines

/** GET /api/content/safety — grouped by category for the safety page. */
router.get(
  '/safety',
  asyncHandler(async (_req, res) => {
    const items = await prisma.safetyGuideline.findMany({
      where: { published: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    const categories = [];
    for (const item of items) {
      let bucket = categories.find((c) => c.category === item.category);
      if (!bucket) {
        bucket = { category: item.category, items: [] };
        categories.push(bucket);
      }
      bucket.items.push(item);
    }

    res.json({ categories });
  })
);

// ------------------------------------------------------- accommodation & gear listings

/** GET /api/content/listings?kind=ACCOMMODATION|EQUIPMENT */
router.get(
  '/listings',
  validate(
    z.object({
      kind: z.enum(['ACCOMMODATION', 'EQUIPMENT']).optional(),
      region: z.string().optional(),
    }),
    'query'
  ),
  asyncHandler(async (req, res) => {
    const where = { published: true };
    if (req.query.kind) where.kind = req.query.kind;
    if (req.query.region) where.region = req.query.region;

    const listings = await prisma.listing.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        kind: true,
        name: true,
        description: true,
        imageUrl: true,
        region: true,
        town: true,
        priceFromXAF: true,
        partnerName: true,
        featured: true,
      },
    });
    res.json({ listings });
  })
);

/**
 * GET /api/content/listings/:id/go — counts the click, then redirects to the
 * partner. Affiliate attribution depends on this hop, so it is a server route
 * rather than a plain outbound link.
 */
router.get(
  '/listings/:id/go',
  asyncHandler(async (req, res) => {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing || !listing.published) throw notFound('Listing not found');

    await prisma.listing.update({
      where: { id: listing.id },
      data: { clickCount: { increment: 1 } },
    });
    res.redirect(302, listing.affiliateUrl);
  })
);

// ------------------------------------------------------- events & tickets

/** GET /api/content/events — upcoming events with seats remaining. */
router.get(
  '/events',
  asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({
      where: { published: true, endDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
    });
    res.json({
      events: events.map((e) => ({ ...e, ticketsLeft: e.capacity - e.ticketsSold })),
    });
  })
);

/** GET /api/content/events/:slug */
router.get(
  '/events/:slug',
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({ where: { slug: req.params.slug } });
    if (!event || !event.published) throw notFound('Event not found');
    res.json({ event: { ...event, ticketsLeft: event.capacity - event.ticketsSold } });
  })
);

/** POST /api/content/events/:id/tickets — atomic ticket claim. */
router.post(
  '/events/:id/tickets',
  requireAuth,
  validate(z.object({ quantity: z.coerce.number().int().min(1).max(10) })),
  asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event || !event.published) throw notFound('Event not found');
    if (event.startDate < new Date()) throw badRequest('That event has already started');

    const ticket = await prisma.$transaction(async (tx) => {
      const claimed = await tx.$queryRaw`
        UPDATE "Event"
        SET "ticketsSold" = "ticketsSold" + ${quantity}
        WHERE "id" = ${event.id} AND "ticketsSold" + ${quantity} <= "capacity"
        RETURNING "id"
      `;
      if (!Array.isArray(claimed) || claimed.length === 0) {
        throw conflict(`Only ${event.capacity - event.ticketsSold} ticket(s) left`);
      }

      return tx.eventTicket.create({
        data: {
          reference: `EVT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          eventId: event.id,
          userId: req.user.id,
          quantity,
          totalXAF: event.priceXAF * quantity,
        },
        include: { event: { select: { title: true, startDate: true, location: true } } },
      });
    });

    res.status(201).json({ ticket });
  })
);

/** GET /api/content/tickets/mine */
router.get(
  '/tickets/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const tickets = await prisma.eventTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        event: { select: { slug: true, title: true, startDate: true, location: true, coverImage: true } },
      },
    });
    res.json({ tickets });
  })
);

// ------------------------------------------------------- advertising

/**
 * GET /api/content/ads?placement=... — weighted random pick from the live
 * slots for that placement, recording an impression.
 */
router.get(
  '/ads',
  validate(z.object({ placement: z.string().min(1) }), 'query'),
  asyncHandler(async (req, res) => {
    const now = new Date();
    const slots = await prisma.adSlot.findMany({
      where: {
        placement: req.query.placement,
        active: true,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
    });

    if (slots.length === 0) return res.json({ ad: null });

    const totalWeight = slots.reduce((sum, s) => sum + Math.max(1, s.weight), 0);
    let roll = Math.random() * totalWeight;
    const chosen = slots.find((s) => (roll -= Math.max(1, s.weight)) <= 0) ?? slots[0];

    prisma.adSlot
      .update({ where: { id: chosen.id }, data: { impressions: { increment: 1 } } })
      .catch(() => {});

    res.json({
      ad: {
        id: chosen.id,
        advertiser: chosen.advertiser,
        imageUrl: chosen.imageUrl,
        placement: chosen.placement,
      },
    });
  })
);

/** GET /api/content/ads/:id/click */
router.get(
  '/ads/:id/click',
  asyncHandler(async (req, res) => {
    const ad = await prisma.adSlot.findUnique({ where: { id: req.params.id } });
    if (!ad) throw notFound('Ad not found');

    await prisma.adSlot.update({ where: { id: ad.id }, data: { clicks: { increment: 1 } } });
    res.redirect(302, ad.targetUrl);
  })
);

// ------------------------------------------------------- premium membership

/**
 * POST /api/content/membership — activate premium.
 * Same note as guide membership: wire a payment webhook here in production.
 */
router.post(
  '/membership',
  requireAuth,
  validate(z.object({ months: z.coerce.number().int().min(1).max(24) })),
  asyncHandler(async (req, res) => {
    const base =
      req.user.tierExpires && req.user.tierExpires > new Date() ? req.user.tierExpires : new Date();
    const tierExpires = new Date(base);
    tierExpires.setMonth(tierExpires.getMonth() + req.body.months);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { tier: 'PREMIUM', tierExpires },
      select: { id: true, tier: true, tierExpires: true },
    });
    res.json({ user });
  })
);

/**
 * GET /api/content/offline-pack/:slug — premium perk: the whole trail bundled
 * for offline use (route geometry, waypoints, emergency notes).
 */
router.get(
  '/offline-pack/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const premium =
      req.user.tier === 'PREMIUM' && (!req.user.tierExpires || req.user.tierExpires > new Date());
    if (!premium && req.user.role !== 'ADMIN') {
      throw badRequest('Offline maps are a Premium feature');
    }

    const trail = await prisma.trail.findUnique({
      where: { slug: req.params.slug },
      include: { waypoints: { orderBy: { order: 'asc' } } },
    });
    if (!trail) throw notFound('Trail not found');

    res.json({
      generatedAt: new Date().toISOString(),
      trail: {
        slug: trail.slug,
        name: trail.name,
        region: trail.region,
        difficulty: trail.difficulty,
        distanceKm: trail.distanceKm,
        elevationGainM: trail.elevationGainM,
        durationMinutes: trail.durationMinutes,
        startLat: trail.startLat,
        startLng: trail.startLng,
        routeGeoJson: trail.routeGeoJson,
        hazards: trail.hazards,
        waterSources: trail.waterSources,
        permitInfo: trail.permitInfo,
        gettingThere: trail.gettingThere,
        waypoints: trail.waypoints,
      },
      emergency: {
        police: '117',
        fireBrigade: '118',
        ambulance: '119',
        note: 'Mobile coverage is unreliable above 2,000 m on Mount Cameroon and Mount Oku. Agree a check-in time with someone in the valley before you set off.',
      },
    });
  })
);

export default router;
