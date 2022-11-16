import { ResourceCompositeIdentifier, ResourceType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { buildUseLoadableSearchResult } from '../resources/factories/buildUseLoadableSearchResult';
import { displayLoadableSearchResult } from './display-loadable-search-result';

export interface AggregateDetailContainerProps<T> {
    detailPresenterFactory: (resourceType: ResourceType) => FunctionalComponent<T>;
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const AggregateDetailContainer = <T,>({
    compositeIdentifier: { type: resourceType, id },
    detailPresenterFactory,
}: AggregateDetailContainerProps<T>) => {
    const useLoadableSearchResult = buildUseLoadableSearchResult(resourceType);

    const loadableSearchResult = useLoadableSearchResult(id);

    const DetailPresenter = detailPresenterFactory(resourceType);

    // Wrap in error, pending, and not found presentation
    const Presenter = displayLoadableSearchResult(DetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
