/* eslint-disable-next-line */
import { CoscradDataType } from '@coscrad/api-interfaces';
import { CoscradConstraint, isNullOrUndefined } from '@coscrad/validation-constraints';

const lookupTable: { [K in CoscradDataType]: CoscradConstraint[] } = {
    [CoscradDataType.CompositeIdentifier]: [CoscradConstraint.isCompositeIdentifier], // This is auto-populated or a dynamic selection
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
    [CoscradDataType.String]: [CoscradConstraint.isString],
};

type Options = { isArray: boolean; isOptional: boolean };

// Consider moving to `data-types` lib
export const getConstraintNamesForCoscradDataType = (
    coscradDataType: CoscradDataType,
    userOptions: Options
): CoscradConstraint[] => {
    const { isOptional } = userOptions;

    const constraints = lookupTable[coscradDataType];

    const additionalConstraints = [...(isOptional === true ? [] : [CoscradConstraint.isRequired])];

    if (isNullOrUndefined(constraints)) {
        throw new Error(
            `Failed to find validation constraints for COSCRAD data type: ${coscradDataType}`
        );
    }

    return [...constraints, ...additionalConstraints];
};
