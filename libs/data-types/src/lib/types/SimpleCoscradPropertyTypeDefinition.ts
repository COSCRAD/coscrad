// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CoscradDataType, ISimpleCoscradPropertyTypeDefinition } from '@coscrad/api-interfaces';
import { isBoolean } from '@coscrad/validation';
import { isCoscradDataType } from './CoscradDataType';

export type SimpleCoscradPropertyTypeDefinition =
    ISimpleCoscradPropertyTypeDefinition<CoscradDataType>;

export const isSimpleCoscradPropertyTypeDefinition = (
    input: unknown
): input is SimpleCoscradPropertyTypeDefinition => {
    const { coscradDataType, isArray, isOptional } = input as SimpleCoscradPropertyTypeDefinition;

    return isCoscradDataType(coscradDataType) && isBoolean(isArray) && isBoolean(isOptional);
};
