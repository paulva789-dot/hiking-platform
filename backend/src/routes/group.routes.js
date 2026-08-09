import { Router } from 'express';
import slugify from 'slugify';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, badRequest, forbidden, notFound } from '../lib/errors.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { groupSchema } from '../lib/schemas.js';

const router = Router();

const makeSlug = (name) =>
  `${slugify(name, { lower: true, strict: true }).slice(0, 60)}-${crypto
    .randomBytes(2)
    .toString('hex')}`;

/** GET /api/groups — public groups, plus any private ones the viewer belongs to. */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const where = req.user
      ? { OR: [{ isPrivate: false }, { members: { some: { userId: req.user.id } } }] }
      : { isPrivate: false };

    const groups = await prisma.hikingGroup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { members: true } },
        ...(req.user ? { members: { where: { userId: req.user.id }, select: { role: true } } } : {}),
      },
    });

    res.json({
      groups: groups.map(({ members, ...g }) => ({
        ...g,
        myRole: members?.[0]?.role ?? null,
      })),
    });
  })
);

/** GET /api/groups/:slug */
router.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const group = await prisma.hikingGroup.findUnique({
      where: { slug: req.params.slug },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true, region: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!group) throw notFound('Group not found');

    const myRole = group.members.find((m) => m.userId === req.user?.id)?.role ?? null;
    if (group.isPrivate && !myRole && req.user?.role !== 'ADMIN') {
      throw forbidden('This is a private group');
    }

    res.json({ group, myRole });
  })
);

/** POST /api/groups — creator becomes OWNER member. */
router.post(
  '/',
  requireAuth,
  validate(groupSchema),
  asyncHandler(async (req, res) => {
    const group = await prisma.hikingGroup.create({
      data: {
        ...req.body,
        slug: makeSlug(req.body.name),
        ownerId: req.user.id,
        members: { create: { userId: req.user.id, role: 'OWNER' } },
      },
      include: { _count: { select: { members: true } } },
    });
    res.status(201).json({ group });
  })
);

/** POST /api/groups/:id/join */
router.post(
  '/:id/join',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await prisma.hikingGroup.findUnique({ where: { id: req.params.id } });
    if (!group) throw notFound('Group not found');
    if (group.isPrivate) throw forbidden('This group is invite-only');

    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: req.user.id } },
      create: { groupId: group.id, userId: req.user.id },
      update: {},
    });
    res.status(201).json({ joined: true });
  })
);

/** DELETE /api/groups/:id/leave — owners must transfer or delete instead. */
router.delete(
  '/:id/leave',
  requireAuth,
  asyncHandler(async (req, res) => {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: req.params.id, userId: req.user.id } },
    });
    if (!membership) throw notFound('You are not a member of that group');
    if (membership.role === 'OWNER') {
      throw badRequest('Transfer ownership or delete the group instead of leaving it');
    }

    await prisma.groupMember.delete({ where: { id: membership.id } });
    res.json({ joined: false });
  })
);

/** DELETE /api/groups/:id — owner or admin. */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await prisma.hikingGroup.findUnique({ where: { id: req.params.id } });
    if (!group) throw notFound('Group not found');
    if (group.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw forbidden('Only the group owner can delete it');
    }

    await prisma.hikingGroup.delete({ where: { id: group.id } });
    res.json({ ok: true });
  })
);

export default router;
