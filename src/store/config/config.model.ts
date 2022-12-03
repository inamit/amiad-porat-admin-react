import { EnumValue } from 'models/enums/enum';
import { LoadStatus } from 'store/loadStatus';

export type ConfigValues = { values: EnumValue<any>[]; status: LoadStatus };
export interface ConfigModel {
  grades: ConfigValues;
  subjects: ConfigValues;
  rooms: ConfigValues;
  whatsNew: string[];
}

export const initialState: ConfigModel = {
  grades: { values: [], status: LoadStatus.IDLE },
  subjects: { values: [], status: LoadStatus.IDLE },
  rooms: { values: [], status: LoadStatus.IDLE },
  whatsNew: []
};
