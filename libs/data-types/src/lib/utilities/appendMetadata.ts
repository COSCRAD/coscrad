import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { ClassDataTypeMetadata } from '../types';
import CoscradDataType from '../types/CoscradDataType';
import getCoscradDataSchemaFromPrototype from './getCoscradDataSchemaFromPrototype';

export default (
    target: Object,
    propertyKey: string | symbol,
    // The union type here is to support nested data types
    propertyType: CoscradDataType | ClassDataTypeMetadata,
    { isOptional }: { isOptional: boolean }
): void => {
    const existingMeta = getCoscradDataSchemaFromPrototype(target);

    Reflect.defineMetadata(
        COSCRAD_DATA_TYPE_METADATA,
        {
            ...existingMeta,
            [propertyKey]: { type: propertyType, isOptional },
        },
        target
    );
};
