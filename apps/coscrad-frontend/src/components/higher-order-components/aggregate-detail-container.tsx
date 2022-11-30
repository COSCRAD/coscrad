import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { ConnectedResourcesPanel } from '../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../store/slices/resources/shared/notes-for-resource';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';
import { buildUseLoadableSearchResult } from './buildUseLoadableSearchResult';
import { displayLoadableSearchResult } from './display-loadable-search-result';

export interface AggregateDetailContainerProps<T> {
    /**
     * We program to an abstract factory so we can inject a different "kit" of
     * presenters (e.g. thumnail, maybe someday mobile) while reusing all of the
     * non-presentational logic.
     */
    detailPresenterFactory: ICategorizableDetailPresenterFactory<T>;
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const AggregateDetailContainer = <T,>({
    compositeIdentifier,
    detailPresenterFactory,
}: AggregateDetailContainerProps<T>) => {
    const { type: resourceType, id } = compositeIdentifier;

    const useLoadableSearchResult = buildUseLoadableSearchResult(resourceType);

    const loadableSearchResult = useLoadableSearchResult(id);

    const DetailPresenter = detailPresenterFactory(resourceType);

    const WithConnectionsPanels = (props: unknown) => (
        <div>
            {DetailPresenter(props as T)}
            <ConnectedResourcesPanel compositeIdentifier={compositeIdentifier} />
            <SelfNotesPanelContainer compositeIdentifier={compositeIdentifier} />
        </div>
    );

    // Wrap in error, pending, and not found presentation
    const Presenter = displayLoadableSearchResult(WithConnectionsPanels);

    return <Presenter {...loadableSearchResult} />;
};
