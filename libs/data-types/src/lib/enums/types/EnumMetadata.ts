import { ClassDataTypeMetadata } from '../../types';
import CoscradDataType from '../../types/CoscradDataType';
import { CoscradEnum } from '../CoscradEnum';
import { LabelAndValue } from './LabelAndValue';

export type EnumMetadata = {
    type: CoscradDataType.Enum;

    enumName: CoscradEnum;

    enumLabel: string;

    labelsAndValues: LabelAndValue[];
};

export const isEnumMetadata = (
    input: CoscradDataType | ClassDataTypeMetadata | EnumMetadata
): input is EnumMetadata => input && (input as EnumMetadata).type === CoscradDataType.Enum;
