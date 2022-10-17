import { InvalidConfigurationPropertyError } from '../errorHandling/errors/InvalidConfigurationPropertyError';
import { getConstraintFunctionForCoscradDataType } from './getConstraintFunctionForCoscradDataType';

export type ConfigSchema<TPropertyNames extends string | symbol | number = string> = Record<
    TPropertyNames,
    string
>;

export const buildConfigValidationFunction =
    <TConfigType extends Record<string | symbol, unknown>>(
        schema: ConfigSchema<keyof TConfigType>
    ) =>
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
