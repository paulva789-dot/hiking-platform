import dotenv from 'dotenv';

dotenv.config();

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 4000),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcryptRounds: num(process.env.BCRYPT_ROUNDS, 12),

  openWeatherKey: process.env.OPENWEATHER_API_KEY || '',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'trek-cameroon',
  },

  commission: {
    booking: num(process.env.BOOKING_COMMISSION_PCT, 12),
    photo: num(process.env.PHOTO_COMMISSION_PCT, 20),
  },

  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@trekcameroon.cm',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  },
};

if (config.env === 'production' && config.jwt.secret === 'dev-only-insecure-secret') {
  throw new Error('JWT_SECRET must be set in production');
}
