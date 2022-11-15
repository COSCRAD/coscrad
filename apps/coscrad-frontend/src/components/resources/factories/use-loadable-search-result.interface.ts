import { ILoadable } from '../../../store/slices/interfaces/loadable.interface';

export interface IUseLoadableSearchResult<T> {
    useLoadableSearchResult: () => ILoadable<T>;
}
