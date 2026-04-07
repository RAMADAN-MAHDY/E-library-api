// src/validations/auth.validation.js
import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'الاسم مطلوب.',
    'string.min': 'الاسم يجب أن يحتوي على حرفين على الأقل.',
    'string.max': 'الاسم لا يمكن أن يتجاوز 50 حرفاً.',
    'any.required': 'حقل الاسم إلزامي.'
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.empty': 'البريد الإلكتروني مطلوب.',
    'string.email': 'صيغة البريد الإلكتروني غير صالحة.',
    'any.required': 'حقل البريد الإلكتروني إلزامي.'
  }),
  password: Joi.string().min(8).max(18).required().messages({
    'string.empty': 'كلمة المرور مطلوبة.',
    'string.min': 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.',
    'string.max': 'كلمة المرور لا يمكن أن تتجاوز 18 حرفاً.',
    'any.required': 'حقل كلمة المرور إلزامي.'
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'string.empty': 'البريد الإلكتروني مطلوب.',
    'string.email': 'صيغة البريد الإلكتروني غير صالحة.',
    'any.required': 'حقل البريد الإلكتروني إلزامي.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'كلمة المرور مطلوبة.',
    'any.required': 'حقل كلمة المرور إلزامي.'
  }),
});

export const registerAdminSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'الاسم مطلوب.',
    'string.min': 'الاسم يجب أن يحتوي على حرفين على الأقل.',
    'string.max': 'الاسم لا يمكن أن يتجاوز 50 حرفاً.',
    'any.required': 'حقل الاسم إلزامي.'
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.empty': 'البريد الإلكتروني مطلوب.',
    'string.email': 'صيغة البريد الإلكتروني غير صالحة.',
    'any.required': 'حقل البريد الإلكتروني إلزامي.'
  }),
  password: Joi.string().min(8).max(18).required().messages({
    'string.empty': 'كلمة المرور مطلوبة.',
    'string.min': 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.',
    'string.max': 'كلمة المرور لا يمكن أن تتجاوز 18 حرفاً.',
    'any.required': 'حقل كلمة المرور إلزامي.'
  }),
  adminSecret: Joi.string().required().messages({
    'string.empty': 'الرمز السري الخاص بالمدير مطلوب.',
    'any.required': 'حقل الرمز السري للمدير إلزامي.'
  }),
});
