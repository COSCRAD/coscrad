import { CoscradDataType } from '@coscrad/api-interfaces';
import {
    getConstraintNamesForCoscradDataType,
    isConstraintSatisfied,
} from '@coscrad/validation-constraints';

type ConstraintFunction = (input: unknown) => boolean;

export const getConstraintFunctionForCoscradDataType = (
    dataType: CoscradDataType
): ConstraintFunction => {
    const constraints = getConstraintNamesForCoscradDataType(dataType);

    return (input: unknown) =>
        constraints.every((constraintName) => isConstraintSatisfied(constraintName, input));
};
