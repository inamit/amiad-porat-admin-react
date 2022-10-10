import { FieldType } from './enums/fieldTypes';
import Joi from 'joi';
import { RadioGroupDirection } from './enums/radioGroupDirection';
import { RootState } from 'store/store';
import { ConfigValues } from 'store/config/config.model';

type Operator = '===' | '>' | '<' | '<=' | '>=';

export interface Condition {
  field: string;
  operator: Operator;
  value: any;
}

export interface FormField {
  placeholder: string;
  icon?: any;
  objectLocation: string;
  type?: FieldType;
  required: boolean;
  showConditions?: Condition[];
  validationFunction?: (value: any, fieldName: string) => Joi.ValidationResult;
}

export interface SelectFormField extends FormField {
  multiple: boolean;
}

export interface SyncSelectFormField extends SelectFormField {
  children: { value: any; label: string }[];
}

export interface StoreFormField extends FormField {
  select: (state: RootState) => ConfigValues;
}

export interface AsyncSelectFormField extends SelectFormField {
  asyncChildren: () => Promise<{ value: any; label: string }[]>;
}

export interface RadioFormField extends FormField {
  children: { value: any; label: string }[];
  direction: RadioGroupDirection;
}

export type FormFieldType =
  | FormField
  | SyncSelectFormField
  | AsyncSelectFormField
  | RadioFormField
  | StoreFormField;
