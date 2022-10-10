import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { EnumTypeDefinition } from '../types/ComplexDataTypes/EnumTypeDefinition';
import { NestedTypeDefinition } from '../types/ComplexDataTypes/NestedTypeDefinition';
import { UnionDataTypeDefinition } from '../types/ComplexDataTypes/UnionDataTypeDefinition';
import { CoscradDataType, isCoscradDataType } from '../types/CoscradDataType';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

type OptionalMetadata = { isOptional: boolean; isArray: boolean };

export default (
    target: Object,
    propertyKey: string | symbol,
    // The union type here is to support nested data types
    propertyType:
        | CoscradDataType
        | EnumTypeDefinition
        | NestedTypeDefinition
        | UnionDataTypeDefinition,
    { isOptional, isArray }: OptionalMetadata
): void => {
    const existingMeta = getCoscradDataSchemaFromPrototype(target);

    Reflect.defineMetadata(
        COSCRAD_DATA_TYPE_METADATA,
        {
            ...existingMeta,
            [propertyKey]: isCoscradDataType(propertyType)
                ? { coscradDataType: propertyType, isOptional, isArray }
                : { ...propertyType, isOptional, isArray },
        },
        target
    );
};
