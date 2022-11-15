import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { displayLoadableSearchResult } from './display-loadable-search-result';

export interface AggregateDetailContainerProps<T> {
    useLoadableSearchResult: (id: string) => ILoadable<T>;
    DetailPresenter: FunctionalComponent<T>;
    useId?: () => string;
}

export const AggregateDetailContainer = <T,>({
    useLoadableSearchResult,
    DetailPresenter,
    // TODO remove me
    useId = useIdFromLocation,
}: AggregateDetailContainerProps<T>) => {
    const idToFind = useId();

    const loadableSearchResult = useLoadableSearchResult(idToFind);

    // Wrap in error, pending, and not found presentation
    const Presenter = displayLoadableSearchResult(DetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
