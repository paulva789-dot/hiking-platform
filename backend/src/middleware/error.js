import { Prisma } from '@prisma/client';
import { config } from '../config.js';
import { ApiError } from '../lib/errors.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `No route matches ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'value';
      return res.status(409).json({ error: `That ${target} is already taken` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'The requested record does not exist' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Referenced record does not exist' });
    }
  }

  if (err?.type === 'entity.too.large' || err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'That upload is too large (10 MB maximum)' });
  }

  console.error('[unhandled]', err);
  return res.status(500).json({
    error: 'Something went wrong on our side',
    ...(config.env === 'development' ? { debug: err.message, stack: err.stack } : {}),
  });
};
