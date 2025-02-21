import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
    ClassSchema,
    CoscradDataType,
    CoscradPropertyTypeDefinition,
    isSimpleCoscradPropertyTypeDefinition,
} from '../../types';

export const convertCoscradSchemaToOpenApiFormat = (
    schema: ClassSchema<Record<string, unknown>>
): SchemaObject => {
    if (isNullOrUndefined(schema)) {
        return {};
    }

    const properties = Object.entries(schema).reduce(
        (acc, [propertyName, typeDefinition]: [string, CoscradPropertyTypeDefinition]) => {
            if (!isSimpleCoscradPropertyTypeDefinition(typeDefinition)) {
                return acc;
                // throw new Error(
                //     `Unsupported property schema (only simple types are supported): ${JSON.stringify(
                //         typeDefinition
                //     )}`
                // );
            }

            const openApiSchemaForThisProperty: SchemaObject = {
                type:
                    typeDefinition.coscradDataType === CoscradDataType.NonNegativeFiniteNumber
                        ? 'number'
                        : typeDefinition.coscradDataType,
                description: 'non-negative, finite number',
                minimum: 0,
            };

            acc[propertyName] = openApiSchemaForThisProperty;

            return acc;
        },
        {}
    );

    return {
        properties,
        description: 'we should put a description here',
    };
};
