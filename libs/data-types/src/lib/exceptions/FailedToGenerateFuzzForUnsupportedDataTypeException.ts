import { CoscradPropertyTypeDefinition, isSimpleCoscradPropertyTypeDefinition } from '../types';

export class FailedToGenerateFuzzForUnsupportedDataTypeException extends Error {
    constructor(dataSchema: CoscradPropertyTypeDefinition) {
        const type = isSimpleCoscradPropertyTypeDefinition(dataSchema)
            ? dataSchema.coscradDataType
            : dataSchema.complexDataType;

        super(`Failed to generate fuzz for unsupported data type: ${type}`);
    }
}
