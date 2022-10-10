export interface EnumValue<T> {
  value: T;
  label: string;
  [field: string]: any;
}
export interface Enum<T> {
  [key: string]: EnumValue<T>;
}
