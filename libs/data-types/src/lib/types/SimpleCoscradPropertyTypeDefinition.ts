import { isBoolean } from '@coscrad/validation';
import { CoscradDataType, isCoscradDataType } from './CoscradDataType';

// TODO consolidate with api-interfaces
export type SimpleCoscradPropertyTypeDefinition = {
    coscradDataType: CoscradDataType;
    isArray: boolean;
    isOptional: boolean;
};

export const isSimpleCoscradPropertyTypeDefinition = (
    input: unknown
): input is SimpleCoscradPropertyTypeDefinition => {
    const { coscradDataType, isArray, isOptional } = input as SimpleCoscradPropertyTypeDefinition;

    return isCoscradDataType(coscradDataType) && isBoolean(isArray) && isBoolean(isOptional);
};
