/**
 * Zod request validation middleware.
 * Validates req.body against a Zod schema and calls next() with the
 * parsed (coerced) data attached to req.body.
 *
 * On failure, throws a ZodError which is caught by the central errorHandler
 * and returned as a VALIDATION_ERROR with field-level details.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err); // ZodError → errorHandler formats it as 422
  }
};

/**
 * Validates req.query against a Zod schema.
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validates req.params against a Zod schema.
 */
export const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (err) {
    next(err);
  }
};
