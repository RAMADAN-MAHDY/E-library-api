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
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, "'"),
    }));

    return res.status(422).json({
      status: 'error',
      message: 'Validation failed.',
      errors,
    });
  }

  req.body = value;
  next();
};

export default validate;
