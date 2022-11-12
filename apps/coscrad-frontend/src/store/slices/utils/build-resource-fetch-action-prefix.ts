import { RESOURCES } from '../resources/constants';

export const buildResourceFetchActionPrefix = (sliceName: string) =>
    `${RESOURCES}/${sliceName}/fetch`;
