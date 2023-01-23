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
import {
    CoscradConstraint,
    isConstraintSatisfied,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { getConstraintNamesForCoscradDataType } from './get-constraint-names-for-coscrad-data-type';
import { validateCoscradModelInstance } from './validate-coscrad-model-instance';

const validateSingleConstraint = (
    propertyName: string,
    inputValue: unknown,
    constraintName: CoscradConstraint
): Error[] => {
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

    // Double check that if it's not optional it has length
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
    forbidUnknownValues: boolean
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
        if (complexDataType === ComplexCoscradDataType.nested) {
            const allErrors = validateCoscradModelInstance(
                propertyTypeDefinition.schema,
                actualPropertyValue,
                { forbidUnknownValues }
            );

            if (allErrors.length > 0)
                return [
                    new Error(
                        `Property ${propertyName} has failed nested validation. Inner Errors: ${allErrors.reduce(
                            // TODO We need `InternalError` to be part of a shared lib.
                            (acc, e) => acc.concat('\n').concat(e.toString()),
                            ''
                        )}`
                    ),
                ];

            return [];
        }
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

    const constraints = getConstraintNamesForCoscradDataType(coscradDataType as CoscradDataType, {
        isOptional,
        isArray,
    });

    return constraints.reduce(
        (allErrors: Error[], constraintName) => [
            ...allErrors,
            ...validateSingleConstraint(propertyName, actualPropertyValue, constraintName),
        ],
        []
    );
};
