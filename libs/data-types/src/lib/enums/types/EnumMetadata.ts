import { ClassDataTypeMetadata } from '../../types';
import { CoscradDataType } from '../../types/CoscradDataType';
import { CoscradEnum } from '../CoscradEnum';
import { LabelAndValue } from './LabelAndValue';

export type EnumMetadata = {
    // TODO We need a single source of truth for the following key
    coscradDataType: CoscradDataType.Enum;

    enumName: CoscradEnum;

    enumLabel: string;

    labelsAndValues: LabelAndValue[];
};

export const isEnumMetadata = (
    input: CoscradDataType | ClassDataTypeMetadata | EnumMetadata
): input is EnumMetadata =>
    input && (input as EnumMetadata).coscradDataType === CoscradDataType.Enum;
