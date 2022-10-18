import { HttpStatusCode } from './http-status-code.enum';

// TODO Use this in the api responses
export interface IHttpErrorInfo {
    code: HttpStatusCode;
    message: string;
}
