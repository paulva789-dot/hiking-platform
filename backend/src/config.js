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

  // Deposit-only booking: hikers pay this share of the trip price via MTN
  // MoMo / Orange Money to hold their seats; the rest is paid in cash to the
  // guide at the trailhead. Must stay above commission.booking so the
  // platform's cut always clears within the deposit itself.
  booking: {
    depositPct: num(process.env.BOOKING_DEPOSIT_PCT, 20),
    // Premium perk: a standing discount off the deposit, absorbed by the
    // platform's own commission rather than the guide's take (guide still
    // collects subtotal - commission, just more of it as cash at the
    // trailhead and less via the deposit).
    premiumDepositDiscountPct: num(process.env.BOOKING_PREMIUM_DISCOUNT_PCT, 15),
  },

  // MTN Mobile Money / Orange Money collection, via either gateway.
  flutterwave: {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
    webhookHash: process.env.FLUTTERWAVE_WEBHOOK_HASH || '',
    baseUrl: process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
  },
  intouch: {
    loginApi: process.env.INTOUCH_LOGIN_API || '',
    passwordApi: process.env.INTOUCH_PASSWORD_API || '',
    partnerId: process.env.INTOUCH_PARTNER_ID || '',
    baseUrl: process.env.INTOUCH_BASE_URL || 'https://api.intouchpay.co/api',
    callbackSecret: process.env.INTOUCH_CALLBACK_SECRET || '',
  },

  // Africa's Talking SMS -- used for the Premium safety check-in alert
  // (backend/src/lib/sms.js). Chosen over Twilio for CEMAC-region coverage.
  africasTalking: {
    apiKey: process.env.AFRICASTALKING_API_KEY || '',
    username: process.env.AFRICASTALKING_USERNAME || '',
    senderId: process.env.AFRICASTALKING_SENDER_ID || '',
    baseUrl: process.env.AFRICASTALKING_BASE_URL || 'https://api.africastalking.com/version1',
  },

  // Safety check-in: how often the server sweeps for overdue Premium
  // check-ins and alerts the emergency contact (backend/src/lib/safety-sweep.js).
  safetySweepIntervalMs: num(process.env.SAFETY_SWEEP_INTERVAL_MS, 5 * 60 * 1000),

  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@trekcameroon.cm',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  },
};

if (config.env === 'production' && config.jwt.secret === 'dev-only-insecure-secret') {
  throw new Error('JWT_SECRET must be set in production');
}
