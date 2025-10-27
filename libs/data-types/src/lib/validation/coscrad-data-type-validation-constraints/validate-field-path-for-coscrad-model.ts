// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CoscradComplexDataType, ICoscradNestedTypeDefinition } from '@coscrad/api-interfaces';
import { ClassSchema, isSimpleCoscradPropertyTypeDefinition } from '../../types';

const SEPARATOR = '.';

const ARRAY_ELEMENT_DELIMETER = '[*]';

export const validateFieldPathForCoscradModel = (
    fieldPath: string,
    schema: ClassSchema,
    parentPath = ''
): Error[] => {
    const parts = fieldPath.split(SEPARATOR);

    let current = parts[0];

    let isArray = false;

    if (current.endsWith(ARRAY_ELEMENT_DELIMETER)) {
        current = current.slice(0, -ARRAY_ELEMENT_DELIMETER.length);

        isArray = true;

        // is there more to check here? Should we recurse?
    }

    if (!(current in schema)) {
        return [new Error(`Encountered an unknown property at path: ${parentPath}.${current}`)];
    }

    const schemaForTargetProperty = schema[current];

    if (isArray && !schemaForTargetProperty.isArray) {
        return [
            new Error(
                `Unexpected array reference in field path: ${fieldPath}. Field: ${current} is not array-valued.`
            ),
        ];
    }

    if (parts.length > 1) {
        if (isSimpleCoscradPropertyTypeDefinition(schemaForTargetProperty)) {
            return [
                new Error(
                    `The property ${parts[1]} cannot be referenced on ${parts[0]} as this field is of type ${schemaForTargetProperty.coscradDataType}`
                ),
            ];
        }

        if (schemaForTargetProperty.complexDataType === CoscradComplexDataType.enum) {
            return [
                new Error(
                    `The property ${parts[1]} cannot be referenced on ${parts[0]} as this field is of type enum [${schemaForTargetProperty.enumName}]`
                ),
            ];
        }

        if (schemaForTargetProperty.complexDataType === CoscradComplexDataType.union) {
            throw new Error(`Not implemented: Paths to union models cannot be validated yet.`);
        }

        const { schema: nestedSchema } = schemaForTargetProperty as ICoscradNestedTypeDefinition;

        const nextParentPath = parentPath === '' ? current : `${parentPath}.${current}`;

        return validateFieldPathForCoscradModel(
            parts.slice(1).join('.'),
            // @ts-expect-error TODO fix the types here
            nestedSchema,
            nextParentPath
        );
    }

    return [];
};
