import { IHttpErrorInfo } from '@coscrad/api-interfaces';
import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';

export class Loadable<T> implements ILoadable<T> {
    readonly isLoading: boolean;

    readonly errorInfo: IHttpErrorInfo;

    readonly data: T;

    constructor({ isLoading, errorInfo, data }: ILoadable<T>) {
        this.isLoading = isLoading;

        this.errorInfo = errorInfo;

        this.data = data;
    }

    map<U>(callback: (loadedData: T) => U): Loadable<U> {
        if (this.isLoading || !isNull(this.errorInfo) || !this.hasData())
            return new Loadable({
                isLoading: this.isLoading,
                errorInfo: this.errorInfo,
                data: null,
            });

        return new Loadable({
            isLoading: false,
            errorInfo: null,
            data: callback(this.data),
        });
    }

    chain<U>(callback: (loadedData: T) => Loadable<U>): Loadable<U> {
        if (this.isLoading || !isNull(this.errorInfo) || !this.hasData())
            return new Loadable({
                isLoading: this.isLoading,
                errorInfo: this.errorInfo,
                data: null,
            });

        return new Loadable(callback(this.data));
    }

    hasData() {
        return !isNullOrUndefined(this.data);
    }
}
