import { isBoolean } from '@coscrad/validation';
import { CoscradDataType, isCoscradDataType } from './CoscradDataType';

export type CoscradDataSchema = {
    coscradDataType: CoscradDataType;
    isArray: boolean;
    isOptional: boolean;
};

export const isCoscradDataSchema = (input: unknown): input is CoscradDataSchema => {
    const { coscradDataType, isArray, isOptional } = input as CoscradDataSchema;

    return isCoscradDataType(coscradDataType) && isBoolean(isArray) && isBoolean(isOptional);
};
