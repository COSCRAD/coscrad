/* eslint-disable-next-line */
import { ICoscradModelSchema } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
/* eslint-disable-next-line */
import { validateCoscradModelProperty } from './validate-coscrad-model-property';
import { validateUnlistedProperties } from './validateUnlistedProperties';

export type CoscradModelValidatorOptions = {
    forbidUnknownValues: boolean;
};

export const validateCoscradModelInstance = (
    schema: ICoscradModelSchema,
    instance: any,
    { forbidUnknownValues }: CoscradModelValidatorOptions
): Error[] => {
    if (isNullOrUndefined(instance)) {
        return [new Error(`Expected an instance of a coscrad model, received: ${instance}`)];
    }

    const errorsFromKnownProperties = Object.entries(schema).reduce(
        (allErrors: Error[], [propertyName, coscradDataTypeDefinition]): Error[] => {
            const propertyValue = instance[propertyName];

            return [
                ...allErrors,
                ...validateCoscradModelProperty(
                    coscradDataTypeDefinition,
                    propertyName,
                    propertyValue,
                    forbidUnknownValues
                ),
            ];
        },
        []
    );

    return [
        // The schema is the source of truth for the known keys
        ...validateUnlistedProperties(instance, Object.keys(schema), { forbidUnknownValues }),
        ...errorsFromKnownProperties,
    ];
};
