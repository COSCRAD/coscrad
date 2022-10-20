import { ILoadable } from '../interfaces/loadable.interface';

export const buildInitialLoadableState = <TData>(): ILoadable<TData> => ({
    data: null,
    isLoading: false,
    errorInfo: null,
});
