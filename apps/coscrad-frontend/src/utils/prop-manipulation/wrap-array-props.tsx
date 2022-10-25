import { HasData } from '../../components/higher-order-components';

/**
 * There are times when it is more convenient to have a nested property that
 * holds array data. This is useful, for example, when trying to deal with
 * the asymmetry between an `ILoadable` that loads a named-key object versus one that
 * loads an array of data.
 */
export const wrapArrayProps = <T,>(data: T[]): HasData<T[]> => ({
    data,
});
