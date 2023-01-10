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
    [CoscradConstraint.isDefined]: (input: unknown) => !isNullOrUndefined(input),
    [CoscradConstraint.isInteger]: isInteger,
    [CoscradConstraint.isObject]: isObject,
    [CoscradConstraint.isYear]: isYear,
    [CoscradConstraint.isUUID]: isUUID,
    [CoscradConstraint.isISBN]: isISBN,
    [CoscradConstraint.isNonNegative]: isNonNegativeNumber,
    [CoscradConstraint.isFiniteNumber]: isFiniteNumber,
    [CoscradConstraint.isPositive]: isPositiveInteger,
    [CoscradConstraint.isURL]: isURL,
};

export const isConstraintSatisfied = (
    constraintName: CoscradConstraint,
    value: unknown
): boolean => {
    const predicateFunction = constraintsLookupTable[constraintName];

    if (!isFunction(predicateFunction))
        throw new Error(`Cannot validate unknown constraint: ${constraintName}`);

    return predicateFunction(value);
};