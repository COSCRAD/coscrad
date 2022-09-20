import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { EnumMetadata, isEnumMetadata } from '../enums/types/EnumMetadata';
import { UnionMetadata } from '../enums/types/UnionMetadata';
import { ClassDataTypeMetadata } from '../types';
import { CoscradDataType } from '../types/CoscradDataType';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

type OptionalMetadata = { isOptional: boolean; isArray: boolean };

export default (
    target: Object,
    propertyKey: string | symbol,
    // The union type here is to support nested data types
    propertyType: CoscradDataType | ClassDataTypeMetadata | EnumMetadata | UnionMetadata,
    { isOptional, isArray }: OptionalMetadata
): void => {
    const existingMeta = getCoscradDataSchemaFromPrototype(target);

    Reflect.defineMetadata(
        COSCRAD_DATA_TYPE_METADATA,
        {
            ...existingMeta,
            [propertyKey]: isEnumMetadata(propertyType)
                ? { ...propertyType, isOptional, isArray }
                : { coscradDataType: propertyType, isOptional, isArray },
        },
        target
    );
};
