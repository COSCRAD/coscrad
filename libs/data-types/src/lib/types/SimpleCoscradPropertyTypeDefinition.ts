// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CoscradDataType, ISimpleCoscradPropertyTypeDefinition } from '@coscrad/api-interfaces';
import { isCoscradDataType } from './CoscradDataType';

/**
 * Note that importing this from `validation-constraints` would lead to circular build deps for `api`.
 */
const isBoolean = (input: unknown): input is boolean => typeof input === 'boolean';

export type SimpleCoscradPropertyTypeDefinition =
    ISimpleCoscradPropertyTypeDefinition<CoscradDataType>;

export const isSimpleCoscradPropertyTypeDefinition = (
    input: unknown
): input is SimpleCoscradPropertyTypeDefinition => {
    const { coscradDataType, isArray, isOptional } = input as SimpleCoscradPropertyTypeDefinition;

    return isCoscradDataType(coscradDataType) && isBoolean(isArray) && isBoolean(isOptional);
};
