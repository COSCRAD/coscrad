import { CoscradDataType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '../constraints';
import { CoscradConstraint } from '../constraints/coscrad-constraint.enum';

const lookupTable: { [K in CoscradDataType]: CoscradConstraint[] } = {
    [CoscradDataType.CompositeIdentifier]: [], // This is auto-populated or a dynamic selection
    // TODO Update the following
    [CoscradDataType.ISBN]: [CoscradConstraint.isNonEmptyString],
    [CoscradDataType.NonEmptyString]: [CoscradConstraint.isNonEmptyString],
    [CoscradDataType.NonNegativeFiniteNumber]: [CoscradConstraint.isNonEmptyString],
    [CoscradDataType.PositiveInteger]: [CoscradConstraint.isNonEmptyString],
    [CoscradDataType.RawData]: [CoscradConstraint.isObject],
    [CoscradDataType.URL]: [CoscradConstraint.isNonEmptyString],
    [CoscradDataType.UUID]: [CoscradConstraint.isNonEmptyString],
    [CoscradDataType.Year]: [CoscradConstraint.isYear],
    [CoscradDataType.BOOLEAN]: [CoscradConstraint.isBoolean],
};

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
