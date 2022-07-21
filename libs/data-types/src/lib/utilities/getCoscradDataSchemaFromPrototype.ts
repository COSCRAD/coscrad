import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import { ClassDataTypeMetadata } from '../types';

export type Ctor<T> = new (...args: unknown[]) => T;

/**
 * Gets the class's `Coscrad Data Type` schema using reflection. Returns an
 * empty schmea ({}) if no metadata is found.
 */
// eslint-disable-next-line
export default <T extends Record<string, unknown>>(target: Object): ClassDataTypeMetadata<T> => {
    const metadata = Reflect.getMetadata(COSCRAD_DATA_TYPE_METADATA, target);

    return metadata || {};
};
