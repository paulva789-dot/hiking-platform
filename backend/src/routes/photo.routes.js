import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { asyncHandler, badRequest, forbidden, notFound } from '../lib/errors.js';
import { destroyAsset, uploadBuffer } from '../lib/cloudinary.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paginationQuery, photoMetaSchema } from '../lib/schemas.js';

const router = Router();

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(badRequest('Only JPEG, PNG, WebP or AVIF images are accepted'));
    }
    return cb(null, true);
  },
});

/** GET /api/photos — public gallery of approved photos. */
router.get(
  '/',
  validate(paginationQuery.extend({}), 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const where = { status: 'APPROVED' };
    if (req.query.trailId) where.trailId = String(req.query.trailId);
    if (req.query.forSale === 'true') where.forSale = true;

    const [total, photos] = await prisma.$transaction([
      prisma.photo.count({ where }),
      prisma.photo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          url: true,
          width: true,
          height: true,
          caption: true,
          takenAt: true,
          forSale: true,
          priceXAF: true,
          licence: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
          trail: { select: { id: true, slug: true, name: true, region: true } },
        },
      }),
    ]);

    res.json({
      photos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      // Surfaced so the storefront can show the split without hard-coding it.
      photoCommissionPct: config.commission.photo,
    });
  })
);

/** GET /api/photos/mine */
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const photos = await prisma.photo.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { trail: { select: { id: true, slug: true, name: true } } },
    });
    res.json({ photos });
  })
);

/**
 * POST /api/photos — multipart upload straight to Cloudinary.
 * Field name: "image". Metadata travels alongside as form fields.
 */
router.post(
  '/',
  requireAuth,
  upload.single('image'),
  validate(photoMetaSchema),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Attach an image in the "image" field');

    const { trailId, forSale, priceXAF } = req.body;
    if (forSale && !priceXAF) throw badRequest('Set a price for photos listed for sale');

    if (trailId) {
      const trail = await prisma.trail.findUnique({ where: { id: trailId }, select: { id: true } });
      if (!trail) throw notFound('Trail not found');
    }

    const result = await uploadBuffer(req.file.buffer, { folder: 'gallery' });

    const photo = await prisma.photo.create({
      data: {
        userId: req.user.id,
        trailId: trailId || null,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        caption: req.body.caption,
        takenAt: req.body.takenAt,
        forSale: Boolean(forSale),
        priceXAF: forSale ? priceXAF : null,
        licence: req.body.licence,
        // Admins publish instantly; everyone else joins the moderation queue.
        status: req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      },
    });

    res.status(201).json({ photo });
  })
);

/** POST /api/photos/avatar — replaces the signed-in user's avatar. */
router.post(
  '/avatar',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Attach an image in the "image" field');

    const result = await uploadBuffer(req.file.buffer, {
      folder: 'avatars',
      publicId: `user-${req.user.id}`,
    });
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: result.secure_url },
      select: { id: true, avatarUrl: true },
    });
    res.json({ user });
  })
);

/** DELETE /api/photos/:id — uploader or admin. */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
    if (!photo) throw notFound('Photo not found');
    if (photo.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw forbidden('You can only delete your own photos');
    }

    await prisma.photo.delete({ where: { id: photo.id } });
    await destroyAsset(photo.publicId);
    res.json({ ok: true });
  })
);

export default router;
