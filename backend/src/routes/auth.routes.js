import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { publicUser, signToken } from '../lib/token.js';
import { asyncHandler, conflict, unauthorized } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../lib/schemas.js';

const router = Router();

// Brute-force guard on the credential endpoints only.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

const setSessionCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: config.env === 'production' ? 'none' : 'lax',
    secure: config.env === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, region, asGuide } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw conflict('An account with that email already exists');

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        region,
        // The GUIDE role is granted now, but tours stay invisible until an
        // admin approves the guide profile.
        role: asGuide ? 'GUIDE' : 'USER',
      },
    });

    const token = signToken(user);
    setSessionCookie(res, token);
    res.status(201).json({ user: publicUser(user), token });
  })
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Same message either way so the endpoint does not confirm which
    // addresses are registered.
    if (!user) throw unauthorized('Email or password is incorrect');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw unauthorized('Email or password is incorrect');
    if (!user.isActive) throw unauthorized('This account has been suspended');

    const token = signToken(user);
    setSessionCookie(res, token);
    res.json({ user: publicUser(user), token });
  })
);

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [guideProfile, counts] = await Promise.all([
      prisma.guideProfile.findUnique({ where: { userId: req.user.id } }),
      prisma.$transaction([
        prisma.favorite.count({ where: { userId: req.user.id } }),
        prisma.review.count({ where: { userId: req.user.id } }),
        prisma.booking.count({ where: { userId: req.user.id } }),
        prisma.photo.count({ where: { userId: req.user.id } }),
        // A "completed" trail is a self-reported review with a hike date on it —
        // there is no separate completion record, this *is* the completion log.
        prisma.review.count({ where: { userId: req.user.id, status: 'APPROVED', hikedOn: { not: null } } }),
      ]),
    ]);

    res.json({
      user: publicUser(req.user),
      guideProfile,
      stats: {
        favorites: counts[0],
        reviews: counts[1],
        bookings: counts[2],
        photos: counts[3],
        hiked: counts[4],
      },
    });
  })
);

router.patch(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
    res.json({ user: publicUser(user) });
  })
);

router.post(
  '/change-password',
  requireAuth,
  authLimiter,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const ok = await bcrypt.compare(req.body.currentPassword, req.user.passwordHash);
    if (!ok) throw unauthorized('Your current password is incorrect');

    const passwordHash = await bcrypt.hash(req.body.newPassword, config.bcryptRounds);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ ok: true });
  })
);

export default router;
