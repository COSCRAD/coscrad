/* eslint-disable-next-line */
import { ICoscradModelSchema } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
/* eslint-disable-next-line */
/* eslint-disable-next-line */
/* eslint-disable-next-line */
import { validateCoscradModelProperty } from './validate-coscrad-model-property';

export const validateCoscradModelInstance = (
    schema: ICoscradModelSchema,
    instance: any,
    forbidUnknownValues = false
): Error[] => {
    if (isNullOrUndefined(instance)) {
        return [new Error(`Expected an instance of a coscrad model, received: ${instance}`)];
    }

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
                          new Error(
                              `The property ${propertyKey} is not part of the schema: \n ${JSON.stringify(
                                  schema
                              )}`
                          )
                  )
            : []),
        ...errorsFromKnownProperties,
    ];
};
