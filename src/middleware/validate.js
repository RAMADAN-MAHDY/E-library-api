// src/middleware/validate.js
import { translations } from '../locales/validation.js';

/**
 * Higher-order middleware factory for Joi schema validation.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register);
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate req.body against.
 */
const validate = (schema) => (req, res, next) => {
  let lang = req.headers['accept-language'] || 'ar'; // Default to Arabic
  
  // Normalize language code (e.g., 'en-US' -> 'en')
  if (lang.startsWith('ar')) lang = 'ar';
  else if (lang.startsWith('en')) lang = 'en';
  else if (lang.startsWith('es')) lang = 'es';
  else lang = 'ar'; // Default to Arabic if not supported

  const locale = translations[lang];

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => {
      const field = d.path.join('.');
      const type = d.type; // e.g., 'any.required', 'string.min'
      
      // Get the translated message or fallback to default
      let message = locale[type] || d.message;
      
      // Get field label (translated)
      const labelKey = `label.${field}`;
      const label = locale[labelKey] || field;

      // Replace placeholders: {{#label}}, {{#limit}}, etc.
      message = message.replace(/{{#label}}/g, label);
      if (d.context && d.context.limit) {
        message = message.replace(/{{#limit}}/g, d.context.limit);
      }

      return {
        field,
        message: message.replace(/"/g, "'"),
      };
    });

    return res.status(422).json({
      status: 'error',
      message: lang === 'en' ? 'Validation failed.' : (lang === 'es' ? 'Error de validación.' : 'فشل التحقق من البيانات.'),
      errors,
    });
  }

  req.body = value;
  next();
};

export default validate;
