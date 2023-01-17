/* eslint-disable-next-line */
import {
    CoscradDataType,
    ICoscradModelSchema,
    isComplexCoscradDataTypeDefinition,
} from '@coscrad/api-interfaces';
/* eslint-disable-next-line */
import { ComplexCoscradDataType, SimpleCoscradPropertyTypeDefinition } from '@coscrad/data-types';
/* eslint-disable-next-line */
import { CoscradConstraint, isNullOrUndefined } from '../constraints';
import { isConstraintSatisfied } from '../validators';
import { getConstraintNamesForCoscradDataType } from './get-constraint-names-for-coscrad-data-type';

const validateSingleConstraint = (
    propertyName: string,
    inputValue: unknown,
    constraintName: CoscradConstraint,
    validateEachMemberOfArray: boolean
): Error[] => {
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

export const validateCoscradModelInstance = (
    schema: ICoscradModelSchema,
    instance: any,
    forbidUnknownValues = false
) => {
    const errorsFromKnownProperties = Object.entries(schema).reduce(
        (allErrors: Error[], [propertyName, coscradDataTypeDefinition]): Error[] => {
            const actualPropertyValue = instance[propertyName];

            const { isOptional } = coscradDataTypeDefinition;

            /**
             * If this property is optional and not specified, we break early
             * by adding no new errors to the accumulator.
             */
            if (isOptional && isNullOrUndefined(actualPropertyValue)) return allErrors;

            if (isComplexCoscradDataTypeDefinition(coscradDataTypeDefinition)) {
                const { complexDataType } = coscradDataTypeDefinition;

                if (complexDataType === ComplexCoscradDataType.enum) {
                    const { labelsAndValues, enumName } = coscradDataTypeDefinition;

                    const isConstraintSatisfied = labelsAndValues.some(
                        ({ value }) => value === actualPropertyValue
                    );

                    return isConstraintSatisfied
                        ? allErrors
                        : allErrors.concat(
                              new Error(
                                  `Property ${propertyName} has failed the validation constraint: is enum ${enumName}`
                              )
                          );
                }

                if (complexDataType === ComplexCoscradDataType.union) {
                    throw new Error(`Union types are not yet supported in validation`);
                }

                // recurse
                if (complexDataType === ComplexCoscradDataType.nested)
                    return [
                        ...allErrors,
                        ...validateCoscradModelInstance(
                            coscradDataTypeDefinition.schema,
                            actualPropertyValue
                        ),
                    ];
            }

            // investigate why `isComplexCoscradDataTypeDefinition` is not working as a typeguard here
            const { coscradDataType, isArray } =
                coscradDataTypeDefinition as SimpleCoscradPropertyTypeDefinition;

            if (!coscradDataType) {
                throw new Error(
                    `Missing coscradDataType in COSCRAD data taype definition: ${JSON.stringify(
                        coscradDataTypeDefinition
                    )}`
                );
            }

            const constraints = getConstraintNamesForCoscradDataType(
                coscradDataType as CoscradDataType
            );

            const errorsForThisProp = constraints.reduce(
                (allErrors: Error[], constraintName) => [
                    ...allErrors,
                    ...validateSingleConstraint(
                        propertyName,
                        actualPropertyValue,
                        constraintName,
                        isArray
                    ),
                ],
                []
            );

            return [...allErrors, ...errorsForThisProp];
        },
        []
    );

    return [
        ...(forbidUnknownValues
            ? Object.keys(instance)
                  .filter((propertyKey) => {
                      const isPropInSchema = Object.keys(schema).some(
                          (knownPropertyKey) => knownPropertyKey === propertyKey
                      );

                      return !isPropInSchema;
                  })
                  .map(
                      (propertyKey) =>
                          new Error(`The property ${propertyKey} is not part of the schema`)
                  )
            : []),
        ...errorsFromKnownProperties,
    ];
};
