import Joi from 'joi';

export const updateSettingsSchema = Joi.object({
  footerText: Joi.string().min(3).max(200).allow('', null).optional(),
  phone: Joi.string().min(8).max(20).allow('', null).optional(),
  facebookLink: Joi.string().uri().max(200).allow('', null).optional(),
  instagramLink: Joi.string().uri().max(200).allow('', null).optional(),
  whatsappLink: Joi.string().uri().max(200).allow('', null).optional()
}).min(1);
