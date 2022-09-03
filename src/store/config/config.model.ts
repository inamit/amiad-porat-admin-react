import { EnumValue } from 'models/enums/enum';

export enum LoadStatus {
  IDLE,
  LOADING,
  FAILED
}

export type ConfigValues = { values: EnumValue<any>[]; status: LoadStatus };
export interface ConfigModel {
  grades: ConfigValues;
  subjects: ConfigValues;
}

export const initialState: ConfigModel = {
  grades: { values: [], status: LoadStatus.IDLE },
  subjects: { values: [], status: LoadStatus.IDLE }
};
