import { UnionMetadata } from '../../enums/types/UnionMetadata';
import { ComplexCoscradDataType } from './ComplexCoscradDataType';

export type UnionDataTypeDefinition = {
    complexDataType: ComplexCoscradDataType.union;
} & UnionMetadata;
