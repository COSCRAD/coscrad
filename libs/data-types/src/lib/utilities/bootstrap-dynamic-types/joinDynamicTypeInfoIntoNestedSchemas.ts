import { COSCRAD_DATA_TYPE_METADATA } from '../../constants';
import {
    ClassSchema,
    ComplexCoscradDataType,
    isSimpleCoscradPropertyTypeDefinition,
    NestedTypeDefinition,
} from '../../types';
import getCoscradDataSchema from '../getCoscradDataSchema';

type CoscradDataSchema = ReturnType<typeof getCoscradDataSchema>;

const joinDynamicTypeInfoIntoSchemaForANestedDataType = (
    schemaForNestedProperty: NestedTypeDefinition
): NestedTypeDefinition => {
    const { complexDataType, schema: originalSchema } = schemaForNestedProperty;

    if (complexDataType !== 'NESTED_TYPE') {
        throw new Error(`Expected a nested data type definition, received: ${complexDataType}`);
    }

    const updatedSchema = Object.entries(originalSchema).reduce(
        (acc, [propertyKey, propertyTypeDefinition]) => {
            if (isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition))
                return {
                    ...acc,
                    [propertyKey]: propertyTypeDefinition,
                };

            const { complexDataType } = propertyTypeDefinition;

            if (complexDataType === 'ENUM') {
                return {
                    ...acc,
                    [propertyKey]: propertyTypeDefinition,
                };
            }

            if (complexDataType === 'UNION_TYPE') {
                throw new Error(`Cannot handle a union type definition on a nested data type`);
            }

            if (complexDataType === ComplexCoscradDataType.nested) {
                return {
                    ...acc,
                    [propertyKey]:
                        // @ts-expect-error fix types
                        joinDynamicTypeInfoIntoSchemaForANestedDataType(propertyTypeDefinition),
                };
            }
        },
        {} as unknown as ClassSchema
    );

    return {
        complexDataType,
        // @ts-expect-error fix types
        schema: updatedSchema,
    };
};

// Doesn't this lib use camel case for naming files?
export const joinDynamicTypeInfoIntoNestedSchemas = (c: unknown): void => {
    const originalDataSchema = getCoscradDataSchema(c);

    const updatedDataSchema = Object.entries(originalDataSchema).reduce(
        (acc, [propertyKey, propertySchema]) => {
            if (
                isSimpleCoscradPropertyTypeDefinition(propertySchema) ||
                propertySchema.complexDataType !== ComplexCoscradDataType.nested
            )
                return {
                    ...acc,
                    [propertyKey]: propertySchema,
                };

            // We know we have a nested data type definition here
            return {
                ...acc,
                [propertyKey]: {
                    ...propertySchema,
                    // @ts-expect-error todo fix types (deal with mismatch between interface and concrete types here)
                    schema: joinDynamicTypeInfoIntoSchemaForANestedDataType(propertySchema),
                },
            };
        },
        {}
    );

    // @ts-expect-error fix errors here
    Reflect.defineMetadata(COSCRAD_DATA_TYPE_METADATA, updatedDataSchema, c.prototype);
};
