import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';
import { buildUseLoadableSearchResult } from './buildUseLoadableSearchResult';
import { displayLoadableSearchResult } from './display-loadable-search-result';

export interface AggregateDetailContainerProps<T> {
    /**
     * We program to an abstract factory so we can inject a different "kit" of
     * presenters (e.g. thumnail, maybe someday mobile) while reusing all of the
     * non-presentational logic.
     */
    detailPresenterFactory: ICategorizableDetailPresenterFactory<T>;
    compositeIdentifier: CategorizableCompositeIdentifier;
}

export const AggregateDetailContainer = <T,>({
    compositeIdentifier,
    detailPresenterFactory,
}: AggregateDetailContainerProps<T>) => {
    const { type: resourceType, id } = compositeIdentifier;

    const useLoadableSearchResult = buildUseLoadableSearchResult(resourceType);

    const loadableSearchResult = useLoadableSearchResult(id);

    const DetailPresenter = detailPresenterFactory(resourceType);

    // Wrap in error, pending, and not found presentation
    const Presenter = displayLoadableSearchResult(DetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
