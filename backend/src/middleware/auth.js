import { prisma } from '../lib/prisma.js';
import { verifyToken } from '../lib/token.js';
import { forbidden, unauthorized } from '../lib/errors.js';
import { isPremiumActive } from '../lib/entitlements.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return req.cookies?.token || null;
};

/**
 * Attaches req.user when a valid token is present, otherwise leaves it null.
 * Never throws — use for endpoints that behave differently for signed-in users.
 */
export const optionalAuth = async (req, _res, next) => {
  req.user = null;
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user?.isActive) req.user = user;
  } catch {
    // Expired or tampered token — treated as an anonymous visitor.
  }
  return next();
};

/** Requires a valid token. */
export const requireAuth = async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next(unauthorized());

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return next(unauthorized('Account no longer exists'));
    if (!user.isActive) return next(forbidden('This account has been suspended'));
    req.user = user;
    return next();
  } catch {
    return next(unauthorized('Invalid or expired session'));
  }
};

/** Requires one of the given roles. Must run after requireAuth. */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(forbidden(`This action requires the ${roles.join(' or ')} role`));
    }
    return next();
  };

/** Requires an active Premium membership (or admin). Must run after requireAuth. */
export const requirePremium = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (req.user.role === 'ADMIN') return next();
  if (!isPremiumActive(req.user)) {
    return next(forbidden('Starting a group is a Premium feature — free accounts can apply to join one instead'));
  }
  return next();
};

/** Loads the signed-in guide's approved profile onto req.guide. */
export const requireApprovedGuide = async (req, _res, next) => {
  if (!req.user) return next(unauthorized());

  const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return next(forbidden('Create a guide profile first'));
  if (profile.status !== 'APPROVED') {
    return next(forbidden(`Your guide profile is ${profile.status.toLowerCase()}`));
  }
  req.guide = profile;
  return next();
};
