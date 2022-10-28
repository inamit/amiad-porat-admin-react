import Joi from 'joi';

export const isNumberRequired = (
  value: number,
  fieldName: string
): Joi.ValidationResult => {
  return Joi.number()
    .required()
    .messages({ 'any.required': `השדה ${fieldName} הינו חובה` })
    .validate(value);
};

export const isNumberBetween = (
  value: number,
  fieldName: string,
  min: number,
  max: number
) => {
  return Joi.number()
    .min(min)
    .max(max)
    .messages({
      'number.min': `${fieldName} לא יכול להיות מתחת ל${min}`,
      'number.max': `${fieldName} לא יכול להיות מעל ${max}`
    })
    .validate(value);
};
