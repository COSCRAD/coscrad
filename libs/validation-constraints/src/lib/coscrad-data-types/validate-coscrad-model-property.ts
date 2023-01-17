/* eslint-disable-next-line */
import {
    CoscradDataType,
    CoscradPropertyTypeDefinition,
    isComplexCoscradDataTypeDefinition,
} from '@coscrad/api-interfaces';
/* eslint-disable-next-line */
import { ComplexCoscradDataType, SimpleCoscradPropertyTypeDefinition } from '@coscrad/data-types';
import { isDeepStrictEqual } from 'util';
/* eslint-disable-next-line */
/* eslint-disable-next-line */
import { CoscradConstraint, isNullOrUndefined } from '../constraints';
import { isConstraintSatisfied } from '../validators';
import { getConstraintNamesForCoscradDataType } from './get-constraint-names-for-coscrad-data-type';
import { validateCoscradModelInstance } from './validate-coscrad-model-instance';

const validateSingleConstraint = (
    propertyName: string,
    inputValue: unknown,
    constraintName: CoscradConstraint,
    validateEachMemberOfArray: boolean
): Error[] => {
    // TODO Do I need this?
    if (validateEachMemberOfArray) {
        if (!Array.isArray(inputValue))
            return [new Error(`${propertyName} has failed the validation constraint: Is Array`)];

        const arrayValidationerrors = inputValue.reduce(
            (allErrors: Error[], nextElement: unknown, index) =>
                isConstraintSatisfied(constraintName, nextElement)
                    ? allErrors
                    : allErrors.concat(
                          new Error(
                              `${propertyName}[${index}]: ${nextElement} has failed the validation constraint: ${constraintName}`
                          )
                      ),
            []
        );

        return arrayValidationerrors;
    }

    return isConstraintSatisfied(constraintName, inputValue)
        ? []
        : [
              new Error(
                  `${propertyName}: ${inputValue} has failed validation constraint: ${constraintName}`
              ),
          ];
};

const validateArray = (
    propertyName: string,
    inputValue: unknown,
    propertySchema: CoscradPropertyTypeDefinition,
    { isOptional, forbidUnknownValues }: { isOptional: boolean; forbidUnknownValues: boolean }
): Error[] => {
    // TODO use validation lib
    if (!Array.isArray(inputValue))
        return [new Error(`${propertyName} has failed the validation constraint: Is Array`)];

    // Double check that if it's not optional it has length!
    if (isOptional && isDeepStrictEqual(inputValue, [])) return [];

    // At this point, we are safe to validate each member and collect the results
    return inputValue.flatMap((elementOfInputValue) =>
        validateCoscradModelProperty(
            { ...propertySchema, isArray: false, isOptional: false },
            propertyName,
            elementOfInputValue,
            forbidUnknownValues
        )
    );
};

export const validateCoscradModelProperty = (
    propertyTypeDefinition: CoscradPropertyTypeDefinition,
    propertyName: string,
    actualPropertyValue: any,
    // TODO Make this default to `true` so we are explicit about opting out
    forbidUnknownValues = false
): Error[] => {
    const { isOptional, isArray } = propertyTypeDefinition;

    if (isArray)
        /**
         * Reduce through the elements in the array, applying the validation
         * determined by the `CoscradPropertyTypeDefinition` to each member of the
         * array.
         */
        return validateArray(propertyName, actualPropertyValue, propertyTypeDefinition, {
            isOptional,
            forbidUnknownValues,
        });

    /**
     * If this property is optional and not specified, all is well.
     */
    if (isOptional && isNullOrUndefined(actualPropertyValue)) return [];

    if (isComplexCoscradDataTypeDefinition(propertyTypeDefinition)) {
        const { complexDataType } = propertyTypeDefinition;

        if (complexDataType === ComplexCoscradDataType.enum) {
            const { labelsAndValues, enumName } = propertyTypeDefinition;

            const isConstraintSatisfied = labelsAndValues.some(
                ({ value }) => value === actualPropertyValue
            );

            return isConstraintSatisfied
                ? []
                : [
                      new Error(
                          `Property ${propertyName} has failed the validation constraint: is enum ${enumName}`
                      ),
                  ];
        }

        if (complexDataType === ComplexCoscradDataType.union) {
            throw new Error(`Union types are not yet supported in validation`);
        }

        // recurse
        if (complexDataType === ComplexCoscradDataType.nested)
            return validateCoscradModelInstance(
                propertyTypeDefinition.schema,
                actualPropertyValue,
                // TODO Make this default to `true`
                forbidUnknownValues
            );
    }

    // investigate why `isComplexCoscradDataTypeDefinition` is not working as a typeguard here
    const { coscradDataType } = propertyTypeDefinition as SimpleCoscradPropertyTypeDefinition;

    if (!coscradDataType) {
        throw new Error(
            `Missing coscradDataType in COSCRAD data taype definition: ${JSON.stringify(
                propertyTypeDefinition
            )}`
        );
    }

    const constraints = getConstraintNamesForCoscradDataType(coscradDataType as CoscradDataType);

    return constraints.reduce(
        (allErrors: Error[], constraintName) => [
            ...allErrors,
            ...validateSingleConstraint(propertyName, actualPropertyValue, constraintName, isArray),
        ],
        []
    );
};
