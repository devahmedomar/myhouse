import { z } from 'zod';

export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

// Validates req.body / req.query / req.params with zod before a controller runs.
export function validate(schemas = {}) {
  return (req, res, next) => {
    for (const [source, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        const issue = result.error.issues[0];
        return res.status(400).json({ message: issue?.message || 'Invalid input' });
      }
      req[source] = result.data;
    }
    return next();
  };
}
