// src/middleware/validate.js

/**
 * Higher-order middleware factory for Joi schema validation.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register);
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate req.body against.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // collect ALL errors, not just the first
    stripUnknown: true,  // strip unknown keys for safety
  });

  if (error) {
    const details = error.details.map((d) => d.message.replace(/"/g, "'"));
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed.',
      errors: details,
    });
  }

  // Replace req.body with the sanitised/coerced value from Joi
  req.body = value;
  next();
};

export default validate;
