import { ID_ROUTE_PARAM_KEY } from './constants';

export const IdRouteBuilder = (prefix: string) => (id?: string) =>
    `${prefix}/${typeof id === 'string' ? id : `:${ID_ROUTE_PARAM_KEY}`}`;
