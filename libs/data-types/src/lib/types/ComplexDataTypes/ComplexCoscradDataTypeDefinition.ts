import { EnumTypeDefinition } from './EnumTypeDefinition';
import { NestedTypeDefinition } from './NestedTypeDefinition';
import { UnionDataTypeDefinition } from './UnionDataTypeDefinition';

export type ComplexCoscradDataTypeDefinition =
    | EnumTypeDefinition
    | NestedTypeDefinition
    | UnionDataTypeDefinition;
