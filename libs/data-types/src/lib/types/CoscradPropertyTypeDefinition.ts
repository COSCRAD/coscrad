import { ComplexCoscradDataTypeDefinition } from './ComplexDataTypes';
import { SimpleCoscradPropertyTypeDefinition } from './SimpleCoscradPropertyTypeDefinition';

export type CoscradPropertyTypeDefinition =
    | SimpleCoscradPropertyTypeDefinition
    | ComplexCoscradDataTypeDefinition;
