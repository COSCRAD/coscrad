import { ICoscradEnumTypeDefinition } from './coscrad-enum-type-definition.interface';
import { ICoscradNestedTypeDefinition } from './coscrad-nested-type-definition.interface';
import { ICoscradUnionDataTypeDefinition } from './coscrad-union-data-type-definition.interface';

export type ComplexCoscradDataTypeDefinition =
    | ICoscradEnumTypeDefinition
    | ICoscradNestedTypeDefinition
    | ICoscradUnionDataTypeDefinition;
