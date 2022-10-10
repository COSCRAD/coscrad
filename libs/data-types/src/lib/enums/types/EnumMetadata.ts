import { ComplexCoscradDataType } from '../../types/ComplexDataTypes/ComplexCoscradDataType';
import { CoscradEnum } from '../CoscradEnum';
import { LabelAndValue } from './LabelAndValue';

export type EnumMetadata = {
    complexDataType: ComplexCoscradDataType.enum;

    enumName: CoscradEnum;

    enumLabel: string;

    labelsAndValues: LabelAndValue[];
};
