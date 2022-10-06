import { EnumMetadata } from '../../enums/types/EnumMetadata';
import { ComplexCoscradDataType } from './ComplexCoscradDataType';

export type EnumTypeDefinition = {
    type: ComplexCoscradDataType.enum;
} & EnumMetadata;
