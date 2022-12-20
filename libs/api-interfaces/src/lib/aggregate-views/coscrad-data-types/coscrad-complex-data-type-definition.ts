import { ICoscradEnumTypeDefinition } from './coscrad-enum-type-definition.interface';
import { ICoscradNestedTypeDefinition } from './coscrad-nested-type-definition.interface';
import { ICoscradUnionDataTypeDefinition } from './coscrad-union-data-type-definition.interface';

export type CoscradComplexDataTypeDefinition = (
    | ICoscradEnumTypeDefinition
    | ICoscradNestedTypeDefinition
    | ICoscradUnionDataTypeDefinition
) & {
    isOptional: boolean;
    isArray: boolean;
    label: string;
    description: string;
};
