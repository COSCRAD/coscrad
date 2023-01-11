/* eslint-disable-next-line */
import { CoscradDataType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '../constraints';
import { CoscradConstraint } from '../constraints/coscrad-constraint.enum';

const lookupTable: { [K in CoscradDataType]: CoscradConstraint[] } = {
    [CoscradDataType.CompositeIdentifier]: [], // This is auto-populated or a dynamic selection
    [CoscradDataType.ISBN]: [CoscradConstraint.isISBN],
    [CoscradDataType.NonEmptyString]: [CoscradConstraint.isNonEmptyString],
    [CoscradDataType.NonNegativeFiniteNumber]: [
        CoscradConstraint.isNonNegative,
        CoscradConstraint.isFiniteNumber,
    ],
    [CoscradDataType.PositiveInteger]: [CoscradConstraint.isInteger, CoscradConstraint.isPositive],
    [CoscradDataType.RawData]: [CoscradConstraint.isObject],
    [CoscradDataType.URL]: [CoscradConstraint.isURL],
    [CoscradDataType.UUID]: [CoscradConstraint.isUUID],
    [CoscradDataType.Year]: [CoscradConstraint.isYear],
    [CoscradDataType.BOOLEAN]: [CoscradConstraint.isBoolean],
};

// Consider moving to `data-types` lib
export const getConstraintNamesForCoscradDataType = (
    coscradDataType: CoscradDataType
): CoscradConstraint[] => {
    const constraints = lookupTable[coscradDataType];

    if (isNullOrUndefined(constraints)) {
        throw new Error(
            `Failed to find validation constraints for COSCRAD data type: ${coscradDataType}`
        );
    }

    return constraints;
};
