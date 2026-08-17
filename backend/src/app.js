import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { cloudinaryReady } from './lib/cloudinary.js';

import authRoutes from './routes/auth.routes.js';
import trailRoutes from './routes/trail.routes.js';
import reviewRoutes from './routes/review.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import photoRoutes from './routes/photo.routes.js';
import guideRoutes from './routes/guide.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import groupRoutes from './routes/group.routes.js';
import communityRoutes from './routes/community.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import contentRoutes from './routes/content.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import safetyCheckinRoutes from './routes/safety-checkin.routes.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  // Cross-origin images (Cloudinary) are loaded by the Next.js frontend, so the
  // default same-origin resource policy would block them.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Slow down — too many requests.' },
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      env: config.env,
      services: {
        weather: Boolean(config.openWeatherKey),
        imageStorage: cloudinaryReady(),
      },
      time: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/trails', trailRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/photos', photoRoutes);
  app.use('/api/guides', guideRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/checkins', safetyCheckinRoutes);
  // Review routes carry their own /trails/:id/reviews and /reviews/:id paths.
  app.use('/api', reviewRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
