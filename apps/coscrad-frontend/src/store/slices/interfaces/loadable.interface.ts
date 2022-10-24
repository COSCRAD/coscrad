import { IHttpErrorInfo } from '@coscrad/api-interfaces';

export interface ILoadable<T> {
    data: T;
    isLoading: boolean;
    errorInfo: null | IHttpErrorInfo;
}
