import {
    CoscradConstraint,
    isConstraintSatisfied,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { configurableContentPropertiesAndConstraints } from '../data/configurable-content-schema';

export const validateConfig = (instance: unknown): Error[] =>
    Object.entries(configurableContentPropertiesAndConstraints).reduce(
        (accumulatedErrors: Error[], [propertyName, constraints]) => {
            if (isNullOrUndefined(instance)) {
                return [new Error(`A content config must be defined`)];
            }

            const propertyValue = instance[propertyName];

            if (isNullOrUndefined(propertyValue)) {
                return constraints.includes(CoscradConstraint.isRequired)
                    ? [
                          new Error(
                              `The required property: ${propertyName} is missing from the content config`
                          ),
                      ]
                    : [];
            }

            const newConstraintErrors = constraints.reduce(
                (allErrors: Error[], constraint) =>
                    isConstraintSatisfied(constraint, propertyValue)
                        ? allErrors
                        : allErrors.concat(
                              new Error(
                                  `Configurable content property: ${propertyName} does not satisfy the validation constraint: ${constraint}`
                              )
                          ),
                []
            );

            return accumulatedErrors.concat(...newConstraintErrors);
        },
        []
    );
