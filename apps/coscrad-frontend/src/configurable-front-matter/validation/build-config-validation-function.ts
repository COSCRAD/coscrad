import { ConfigurableContentSchema } from '../data/configurable-content-schema';
import { InvalidConfigurationPropertyError } from '../errorHandling/errors/invalid-configuration-property.error';
import { getConstraintFunctionForCoscradDataType } from './get-contstraint-function-for-coscrad-data-type';

export const buildConfigValidationFunction =
    (schema: ConfigurableContentSchema) =>
    (instance: unknown): Error[] =>
        Object.entries(schema).reduce(
            (accumulatedErrors: Error[], [propertyName, propertyType]) => {
                const constraintFunction = getConstraintFunctionForCoscradDataType(propertyType);

                const propertyValue = instance[propertyName];

                const isSatisfied = constraintFunction(propertyValue);

                if (!isSatisfied)
                    return accumulatedErrors.concat(
                        new InvalidConfigurationPropertyError({
                            propertyName,
                            propertyType,
                            invalidReceivedValue: propertyValue,
                        })
                    );

                return accumulatedErrors;
            },
            []
        );
