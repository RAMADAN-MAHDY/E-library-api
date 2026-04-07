import Joi from 'joi';

export const updateSettingsSchema = Joi.object({
  footerText: Joi.string().min(3).max(200).allow('', null).optional().messages({
    'string.min': 'نص التذييل يجب أن يحتوي على 3 أحرف على الأقل.',
    'string.max': 'نص التذييل لا يمكن أن يتجاوز 200 حرف.'
  }),
  phone: Joi.string().min(8).max(20).allow('', null).optional().messages({
    'string.min': 'رقم الهاتف يجب أن يحتوي على 8 رموز أو أرقام على الأقل.',
    'string.max': 'رقم الهاتف لا يمكن أن يتجاوز 20 رمزاً.'
  }),
  facebookLink: Joi.string().uri().max(200).allow('', null).optional().messages({
    'string.uri': 'صيغة رابط الفيسبوك غير صالحة.',
    'string.max': 'رابط الفيسبوك لا يمكن أن يتجاوز 200 حرف.'
  }),
  instagramLink: Joi.string().uri().max(200).allow('', null).optional().messages({
    'string.uri': 'صيغة رابط الانستجرام غير صالحة.',
    'string.max': 'رابط الانستجرام لا يمكن أن يتجاوز 200 حرف.'
  }),
  whatsappLink: Joi.string().uri().max(200).allow('', null).optional().messages({
    'string.uri': 'صيغة رابط الواتساب غير صالحة.',
    'string.max': 'رابط الواتساب لا يمكن أن يتجاوز 200 حرف.'
  })
}).min(1).messages({
  'object.min': 'يجب تعديل حقل واحد على الأقل.'
});
