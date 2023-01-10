import {
    isBoolean,
    isInteger,
    isNonEmptyString,
    isNullOrUndefined,
    isObject,
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
