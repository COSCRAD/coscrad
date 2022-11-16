import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { IResourceDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';
import { buildUseLoadableSearchResult } from './buildUseLoadableSearchResult';
import { displayLoadableSearchResult } from './display-loadable-search-result';

export interface AggregateDetailContainerProps<T> {
    /**
     * We program to an abstract factory so we can inject a different "kit" of
     * presenters (e.g. thumnail, maybe someday mobile) while reusing all of the
     * non-presentational logic.
     */
    detailPresenterFactory: IResourceDetailPresenterFactory<T>;
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
