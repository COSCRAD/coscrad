import { RESOURCES } from '../resources/constants';

// It's not right to use this for non-resource aggregates unless we change the prefix a bit
export const buildResourceFetchActionPrefix = (sliceName: string) =>
    `${RESOURCES}/${sliceName}/fetch`;
