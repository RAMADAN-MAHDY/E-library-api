// src/validations/file.validation.js
import Joi from 'joi';

// Validates metadata sent alongside an upload
export const uploadMetaSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'العنوان مطلوب.',
    'string.min': 'العنوان يجب أن يحتوي على حرف واحد على الأقل.',
    'string.max': 'العنوان لا يمكن أن يتجاوز 100 حرف.',
    'any.required': 'حقل العنوان إلزامي.'
  }),

  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'الوصف لا يمكن أن يتجاوز 1000 حرف.'
  }),

  price: Joi.number().min(0).required().messages({
    'number.base': 'السعر يجب أن يكون رقماً.',
    'number.min': 'السعر لا يمكن أن يكون أقل من 0.',
    'any.required': 'السعر إلزامي.'
  }),

  discountPrice: Joi.number()
    .min(0)
    .less(Joi.ref('price'))
    .when('isOnSale', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null)
    })
    .messages({
      'number.base': 'سعر الخصم يجب أن يكون رقماً.',
      'number.min': 'سعر الخصم لا يمكن أن يكون أقل من 0.',
      'number.less': 'سعر الخصم يجب أن يكون أقل من السعر الأساسي.',
      'any.required': 'يجب تحديد سعر الخصم عند تفعيل التخفيض.'
    }),

  isOnSale: Joi.boolean().default(false).messages({
    'boolean.base': 'قيمة التخفيض يجب أن تكون true أو false.'
  }),

  category: Joi.string().hex().length(24).required().messages({
    'string.length': 'معرف القسم غير صالح.',
    'string.hex': 'صيغة معرف القسم غير صالحة.',
    'any.required': 'معرف القسم إلزامي.'
  }),

  productType: Joi.string().hex().length(24).required().messages({
    'string.length': 'معرف نوع المنتج غير صالح.',
    'string.hex': 'صيغة معرف نوع المنتج غير صالحة.',
    'any.required': 'معرف نوع المنتج إلزامي.'
  }),
});

export const updateFileSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).optional().messages({
    'string.empty': 'العنوان لا يمكن أن يكون فارغاً.',
    'string.min': 'العنوان يجب أن يحتوي على حرف واحد على الأقل.',
    'string.max': 'العنوان لا يمكن أن يتجاوز 100 حرف.'
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'الوصف لا يمكن أن يتجاوز 1000 حرف.'
  }),
  price: Joi.number().min(0).optional().messages({
    'number.base': 'السعر يجب أن يكون رقماً.',
    'number.min': 'السعر لا يمكن أن يكون أقل من 0.'
  }),
  discountPrice: Joi.number().min(0).optional().allow(null).messages({
    'number.base': 'سعر الخصم يجب أن يكون رقماً.',
    'number.min': 'سعر الخصم لا يمكن أن يكون أقل من 0.'
  }),
  isOnSale: Joi.boolean().optional().messages({
    'boolean.base': 'يجب تحديد ما إذا كان المنتج في التخفيضات بصيغة صحيحة (نعم/لا).'
  }),
  category: Joi.string().hex().length(24).optional().messages({
    'string.length': 'معرف القسم غير صالح.',
    'string.hex': 'صيغة معرف القسم غير صالحة.'
  }),
  productType: Joi.string().hex().length(24).optional().messages({
    'string.length': 'معرف نوع المنتج غير صالح.',
    'string.hex': 'صيغة معرف نوع المنتج غير صالحة.'
  }),
});
