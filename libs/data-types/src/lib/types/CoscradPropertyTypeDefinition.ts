import { CoscradComplexDataTypeDefinition } from './ComplexDataTypes';
import { SimpleCoscradPropertyTypeDefinition } from './SimpleCoscradPropertyTypeDefinition';

export type CoscradPropertyTypeDefinition =
    | SimpleCoscradPropertyTypeDefinition
    | CoscradComplexDataTypeDefinition;
