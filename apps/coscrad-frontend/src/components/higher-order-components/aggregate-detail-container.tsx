import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { displayLoadableSearchResult } from './display-loadable-search-result';

export interface AggregateDetailContainerProps<T> {
    useLoadableSearchResult: () => ILoadable<T>;
    DetailPresenter: FunctionalComponent<T>;
}

export const AggregateDetailContainer = <T,>({
    useLoadableSearchResult,
    DetailPresenter,
}: AggregateDetailContainerProps<T>) => {
    const loadableSearchResult = useLoadableSearchResult();

    // Wrap in error, pending, and not found presentation
    const Presenter = displayLoadableSearchResult(DetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
