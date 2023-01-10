import { CoscradDataType } from '@coscrad/api-interfaces';
import { PredicateFunction } from '../types';
import { isConstraintSatisfied } from '../validators';
import { getConstraintNamesForCoscradDataType } from './get-constraint-names-for-coscrad-data-type';

export const getConstraintFunctionForCoscradDataType = (
    dataType: CoscradDataType
): PredicateFunction => {
    const constraints = getConstraintNamesForCoscradDataType(dataType);

    return (input: unknown) =>
        constraints.every((constraintName) => isConstraintSatisfied(constraintName, input));
};
