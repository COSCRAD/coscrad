import { CoscradDataType } from '@coscrad/api-interfaces';
import { isNotEmptyObject } from 'class-validator';

type ConstraintFunction = (input: unknown) => boolean;

type LookupTable = Record<string, ConstraintFunction>;

// TODO share with backend lib
const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

const lookupTable: LookupTable = {
    [CoscradDataType.CompositeIdentifier]: isStringWithNonzeroLength,
    [CoscradDataType.ISBN]: isStringWithNonzeroLength,
    [CoscradDataType.NonEmptyString]: isStringWithNonzeroLength,
    [CoscradDataType.NonEmptyString]: isStringWithNonzeroLength,
    [CoscradDataType.NonNegativeFiniteNumber]: isStringWithNonzeroLength,
    [CoscradDataType.PositiveInteger]: isStringWithNonzeroLength,
    [CoscradDataType.RawData]: isNotEmptyObject,
    [CoscradDataType.URL]: isStringWithNonzeroLength,
    [CoscradDataType.UUID]: isStringWithNonzeroLength,
    [CoscradDataType.Year]: isStringWithNonzeroLength,
};

export const getConstraintFunctionForCoscradDataType = (dataType: string): ConstraintFunction => {
    const lookupResult = lookupTable[dataType];

    if (lookupResult === null || typeof lookupResult === 'undefined') {
        throw new Error(`Failed to find a validation function for COSCRAD data type: ${dataType}`);
    }

    return lookupResult;
};
