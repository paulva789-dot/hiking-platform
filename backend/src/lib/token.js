import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

export const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

/** Fields that are safe to send to a client. */
export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  phone: user.phone,
  region: user.region,
  tier: user.tier,
  tierExpires: user.tierExpires,
  createdAt: user.createdAt,
});
