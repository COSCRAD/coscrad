import { CoscradComplexDataTypeDefinition } from './coscrad-complex-data-type-definition';
import { CoscradPropertyTypeDefinition } from './coscrad-property-type-definition';

export const isComplexCoscradDataTypeDefinition = (
    input: CoscradPropertyTypeDefinition
): input is CoscradComplexDataTypeDefinition =>
    typeof (input as CoscradComplexDataTypeDefinition).complexDataType === 'string';
