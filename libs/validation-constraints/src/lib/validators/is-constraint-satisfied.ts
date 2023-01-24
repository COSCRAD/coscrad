import {
    isBoolean,
    isFiniteNumber,
    isInteger,
    isISBN,
    isNonEmptyString,
    isNonNegativeNumber,
    isNullOrUndefined,
    isObject,
    isPositiveInteger,
    isString,
    isURL,
    isUUID,
    isYear,
} from '../constraints';
import { CoscradConstraint } from '../constraints/coscrad-constraint.enum';
import { isFunction } from '../constraints/is-function';
import { PredicateFunction } from '../types';

const constraintsLookupTable: { [K in CoscradConstraint]: PredicateFunction } = {
    [CoscradConstraint.isNonEmptyString]: isNonEmptyString,
    [CoscradConstraint.isBoolean]: isBoolean,
    [CoscradConstraint.isRequired]: (input: unknown) => !isNullOrUndefined(input),
    [CoscradConstraint.isInteger]: isInteger,
    [CoscradConstraint.isObject]: isObject,
    [CoscradConstraint.isYear]: isYear,
    [CoscradConstraint.isUUID]: (input: unknown): input is string =>
        isString(input) && isUUID(input),
    [CoscradConstraint.isISBN]: (input: unknown): input is string =>
        isString(input) && isISBN(input),
    [CoscradConstraint.isNonNegative]: isNonNegativeNumber,
    [CoscradConstraint.isFiniteNumber]: isFiniteNumber,
    [CoscradConstraint.isPositive]: isPositiveInteger,
    [CoscradConstraint.isURL]: isURL,
    [CoscradConstraint.isString]: isString,
    [CoscradConstraint.isCompositeIdentifier]: (input: unknown) => {
        const { type, id } = input as { type: string; id: string };

        // TODO Make the id a `UUID`
        return [type, id].every(isNonEmptyString);
    },
};

export const isConstraintSatisfied = (
    constraintName: CoscradConstraint,
    value: unknown
): boolean => {
    /**
     * This is a hack. Currently, we don't register `IS_ENUM` as a proper
     * constraint because it requires parameters (the allowed values).
     * However, we render dynamic selections for these values, so the only
     * constraint that needs to be validated client side is that the selection
     * is not null if the field is required.
     */
    if (constraintName === ('IS_ENUM' as CoscradConstraint)) {
        return true;
    }

    const predicateFunction = constraintsLookupTable[constraintName];

    if (!isFunction(predicateFunction))
        throw new Error(`Cannot validate unknown constraint: ${constraintName}`);

    return predicateFunction(value);
};
