/* eslint-disable-next-line */
import { ICoscradModelSchema } from '@coscrad/api-interfaces';
/* eslint-disable-next-line */
/* eslint-disable-next-line */
/* eslint-disable-next-line */
import { CoscradConstraint } from '../constraints';
import { isConstraintSatisfied } from '../validators';
import { validateCoscradModelProperty } from './validate-coscrad-model-property';

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
        (allErrors: Error[], [propertyName, coscradDataTypeDefinition]): Error[] => [
            ...allErrors,
            ...validateCoscradModelProperty(
                coscradDataTypeDefinition,
                propertyName,
                instance[propertyName],
                forbidUnknownValues
            ),
        ],
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
