import { ComplexCoscradDataTypeDefinition } from './complex-coscrad-data-type-definition';
import { ISimpleCoscradPropertyTypeDefinition } from './simple-coscrad-property-type-definition.interface';

export type CoscradPropertyTypeDefinition =
    | ISimpleCoscradPropertyTypeDefinition
    | ComplexCoscradDataTypeDefinition;
