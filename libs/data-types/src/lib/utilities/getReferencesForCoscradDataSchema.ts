import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { ClassSchema } from '../types';
import { doesUnionTypeDefinitionDeepContainReferences } from './doesUnionTypeDefinitionDeepContainReferences';

export interface ReferenceSpecification {
    type: string;
    path: string;
    isArray: boolean;
}

export const getReferencesForCoscradDataSchema = (
    schema: ClassSchema<Record<string, unknown>>,
    basePath = ''
): ReferenceSpecification[] =>
    Object.entries(schema).reduce(
        (acc: ReferenceSpecification[], [propertyKey, typeDefinition]) => {
            // @ts-expect-error TODO We need to improve type safety of @coscrad/data-types
            const { referenceTo, isArray, complexDataType, schema: nestedSchema } = typeDefinition;

            const fullPath = isNonEmptyString(basePath)
                ? `${basePath}.${propertyKey}`
                : propertyKey;

            if (!isNullOrUndefined(referenceTo))
                return acc.concat([
                    {
                        type: referenceTo,
                        path: fullPath,
                        isArray,
                    },
                ]);

            if (complexDataType == 'NESTED_TYPE') {
                return acc.concat(getReferencesForCoscradDataSchema(nestedSchema, fullPath));
            }

            if (complexDataType == 'UNION_TYPE') {
                // @ts-expect-error Fix data types for this lib
                if (doesUnionTypeDefinitionDeepContainReferences(typeDefinition))
                    throw new Error(`Gathering Nested References from a Union is not supported`);
            }

            return acc;
        },
        []
    ) as ReferenceSpecification[];
