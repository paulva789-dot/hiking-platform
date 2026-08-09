import { ApiError } from '../lib/errors.js';

/**
 * Validates a request part against a Zod schema and replaces it with the
 * parsed result, so handlers always receive coerced, trusted values.
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'|'params'} part
 */
export const validate =
  (schema, part = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.') || part,
        message: i.message,
      }));
      return next(new ApiError(422, 'Validation failed', details));
    }
    req[part] = result.data;
    return next();
  };
