/* eslint-disable-next-line */
import { CoscradDataType } from '@coscrad/api-interfaces';
import { isConstraintSatisfied, PredicateFunction } from '@coscrad/validation-constraints';
import { getConstraintNamesForCoscradDataType } from './get-constraint-names-for-coscrad-data-type';

// Consider moving this to the `data-types` lib
export const getConstraintFunctionForCoscradDataType = (
    dataType: CoscradDataType
): PredicateFunction => {
    const constraints = getConstraintNamesForCoscradDataType(dataType);

    return (input: unknown) =>
        constraints.every((constraintName) => isConstraintSatisfied(constraintName, input));
};
