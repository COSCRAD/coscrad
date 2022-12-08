import {
    IBaseViewModel,
    IDetailQueryResult,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { ConnectedResourcesPanel } from '../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../store/slices/resources/shared/notes-for-resource';
import { CommandPanel } from '../commands';
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
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const AggregateDetailContainer = <T,>({
    compositeIdentifier,
    detailPresenterFactory,
}: AggregateDetailContainerProps<T>) => {
    const { type: resourceType, id } = compositeIdentifier;

    const { shouldEnableWebOfKnowledgeForResources } = useContext(ConfigurableContentContext);

    const useLoadableSearchResult = buildUseLoadableSearchResult(resourceType);

    const loadableSearchResult = useLoadableSearchResult(id);

    const DetailPresenter = detailPresenterFactory(resourceType);

    const WithConnectionsPanelsAndCommands = (props: IDetailQueryResult<IBaseViewModel>) =>
        shouldEnableWebOfKnowledgeForResources ? (
            <div>
                {DetailPresenter(props as unknown as T)}
                {/* TODO Only expose commands if you have an admin user context */}
                <CommandPanel actions={props.actions} />
                <ConnectedResourcesPanel compositeIdentifier={compositeIdentifier} />
                <SelfNotesPanelContainer compositeIdentifier={compositeIdentifier} />
            </div>
        ) : (
            <div>{DetailPresenter(props as unknown as T)}</div>
        );

    // Wrap in error, pending, and not found presentation
    const Presenter = displayLoadableSearchResult(WithConnectionsPanelsAndCommands);

    return <Presenter {...loadableSearchResult} />;
};
