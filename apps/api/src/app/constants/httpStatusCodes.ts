import { ValueType } from '../../lib/types/valueType';

const httpStatusCodes = {
    ok: 200,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    internalError: 500,
};

export default httpStatusCodes;

export type HttpStatusCode = ValueType<typeof httpStatusCodes>;
