import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { EnumTypeDefinition } from '../types/ComplexDataTypes/EnumTypeDefinition';
import { NestedTypeDefinition } from '../types/ComplexDataTypes/NestedTypeDefinition';
import { UnionDataTypeDefinition } from '../types/ComplexDataTypes/UnionDataTypeDefinition';
import { CoscradDataType, isCoscradDataType } from '../types/CoscradDataType';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

type OptionalMetadata = {
    isOptional: boolean;
    isArray: boolean;
    label?: string;
    description?: string;
};

export default (
    target: Object,
    propertyKey: string | symbol,
    // The union type here is to support nested data types
    propertyType:
        | CoscradDataType
        | EnumTypeDefinition
        | NestedTypeDefinition
        | UnionDataTypeDefinition,
    { isOptional, isArray, label, description }: OptionalMetadata
): void => {
    const existingMeta = getCoscradDataSchemaFromPrototype(target);

    const existingMetaForThisProperty = existingMeta[propertyKey as string] || {};

    const newMetaForThisProperty = isCoscradDataType(propertyType)
        ? { coscradDataType: propertyType, isOptional, isArray, label, description }
        : { ...propertyType, isOptional, isArray, label, description };

    Reflect.defineMetadata(
        COSCRAD_DATA_TYPE_METADATA,
        {
            ...existingMeta,
            [propertyKey]: {
                ...existingMetaForThisProperty,
                ...newMetaForThisProperty,
            },
        },
        target
    );
};
