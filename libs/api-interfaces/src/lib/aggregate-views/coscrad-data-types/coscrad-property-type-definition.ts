import { CoscradComplexDataTypeDefinition } from './coscrad-complex-data-type-definition';
import { ISimpleCoscradPropertyTypeDefinition } from './simple-coscrad-property-type-definition.interface';

export type CoscradPropertyTypeDefinition<TDataTypeEnum extends string = string> =
    | ISimpleCoscradPropertyTypeDefinition<TDataTypeEnum>
    | CoscradComplexDataTypeDefinition;
