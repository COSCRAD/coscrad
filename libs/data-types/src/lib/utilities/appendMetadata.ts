import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import CoscradDataType from '../types/CoscradDataType';
import getCoscradDataSchemea, { Ctor } from './getCoscradDataSchemeaFromPrototype';

export default (
    // eslint-disable-next-line
    target: Object,
    propertyKey: string | symbol,
    propertyType: CoscradDataType,
    { isOptional }: { isOptional: boolean }
): void => {
    const existingMeta = getCoscradDataSchemea(target as unknown as Ctor<Record<string, unknown>>);

    Reflect.defineMetadata(
        COSCRAD_DATA_TYPE_METADATA,
        {
            ...existingMeta,
            [propertyKey]: { type: propertyType, isOptional },
        },
        target
    );
};
