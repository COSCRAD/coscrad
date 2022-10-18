import { ConfigurableContentSchema } from '../data/configurableContentSchema';
import { InvalidConfigurationPropertyError } from '../errorHandling/errors/InvalidConfigurationPropertyError';
import { getConstraintFunctionForCoscradDataType } from './getConstraintFunctionForCoscradDataType';

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
