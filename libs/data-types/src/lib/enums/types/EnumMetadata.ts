import { ComplexCoscradDataType } from '../../types/ComplexDataTypes/ComplexCoscradDataType';
import { LabelAndValue } from './LabelAndValue';

export type EnumMetadata = {
    complexDataType: ComplexCoscradDataType.enum;

    enumName: string;

    enumLabel: string;

    labelsAndValues: LabelAndValue[];
};
