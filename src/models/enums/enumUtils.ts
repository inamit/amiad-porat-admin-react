import { EnumValue } from './enum';

export const getEnumByValue = <T>(
  enumArray: EnumValue<T>[],
  value: T
): EnumValue<T> => {
  return enumArray?.find((enumValue) => enumValue.value === value);
};
