import { ClassSchema } from '../../types';
import { ComplexCoscradDataType } from '../../types/ComplexDataTypes/ComplexCoscradDataType';
import { CoscradDataType } from '../../types/CoscradDataType';
import { CoscradEnum } from '../CoscradEnum';
import { LabelAndValue } from './LabelAndValue';
import { UnionMetadata } from './UnionMetadata';

export type EnumMetadata = {
    // TODO We need a single source of truth for the following key
    complexDataType: ComplexCoscradDataType.enum;

    enumName: CoscradEnum;

    enumLabel: string;

    labelsAndValues: LabelAndValue[];
};

export const isEnumMetadata = (
    input: CoscradDataType | ClassSchema | EnumMetadata | UnionMetadata
): input is EnumMetadata =>
    input && (input as EnumMetadata).complexDataType === ComplexCoscradDataType.enum;
