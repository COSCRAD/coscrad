import {
    AggregateCompositeIdentifier,
    AggregateType,
    CategorizableCompositeIdentifier,
    CategorizableType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    IBaseViewModel,
    IDetailQueryResult,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { IMaybeLoadable, NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { ConnectedResourcesPanel } from '../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../store/slices/resources/shared/notes-for-resource';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CommandPanel, ICommandExecutorAndLabels } from '../commands';
import { buildStaticCommandExecutors } from '../commands/build-static-command-executors';
import { buildCommandExecutor, buildDynamicCommandForm } from '../commands/command-executor';
import { ErrorDisplay } from '../error-display/error-display';
import { Loading } from '../loading';
import { NotFoundPresenter } from '../not-found';
import { NoteDetailPageContainer } from '../notes/note-detail-page.container';
import { buildUseLoadableSearchResult } from './buildUseLoadableSearchResult';

type DetailPresenter = (viewModel: IDetailQueryResult<IBaseViewModel>) => JSX.Element;

interface ResourcePageProps {
    aggregateType: AggregateType;
    detailPresenterFactory: (categorizableType: AggregateType) => DetailPresenter;
}

const isCategorizableCompositeIdentifier = (
    input: unknown
): input is CategorizableCompositeIdentifier => {
    if (input === null || typeof input === 'undefined') return false;

    const { type } = input as CategorizableCompositeIdentifier;

    return Object.values(CategorizableType).includes(type);
};

const buildCommandExecutionFormsAndLabels = (
    actionsFromApi: IBackendCommandFormAndLabels[],
    compositeIdentifier: AggregateCompositeIdentifier
) => {
    const commandExecutionFormsAndLabels = actionsFromApi
        .map(
            (action): ICommandExecutorAndLabels => ({
                ...action,
                executor: buildCommandExecutor(buildDynamicCommandForm(action), {
                    /**
                     * Any command that naturally appears in the context of
                     * a categorizable page is an update command for the
                     * current categorizable (resource or note) in whose detail
                     * view the user is presently working. Therefore, we must
                     * bind the `aggregateCompositeIdentifier` prop for this
                     * categorizable.
                     */
                    aggregateCompositeIdentifier: compositeIdentifier,
                }),
            })
        )
        /**
         * TODO We should expose the following commands via the back-end.
         * that will require a mechanism to bind the aggregate context
         * for the resource we are viewing (e.g. book/123) to a non-standard
         * property (resourceCompositeIdentifier) while generating a new
         * ID for the note, which is the proper aggregate context for
         * this command.
         */
        .concat(buildStaticCommandExecutors(compositeIdentifier));

    return commandExecutionFormsAndLabels;
};

/**
 * A Categorizable is a Resource or a Note. These types of aggregate root share in
 * common that they can be tagged and categorized, and they collectively constitute
 * the web-of-knowledge.
 *
 * We may want to extends this to an `AggregatePage`. We aren't too concerned
 * about that right now as our core value is being extensbile to adding new resource
 * types, while non-resource aggregates are one-offs.
 *
 * We may want to put this in `/Components/Resources/Shared`.
 */
export const AggregatePage = ({
    aggregateType,
    detailPresenterFactory,
}: ResourcePageProps): JSX.Element => {
    const id = useIdFromLocation();

    const useLoadableSearchResult = buildUseLoadableSearchResult(aggregateType);

    const {
        isLoading,
        errorInfo,
        data: viewModel,
    } = useLoadableSearchResult(id) as IMaybeLoadable<IDetailQueryResult<IBaseViewModel>>;

    const { shouldEnableWebOfKnowledgeForResources } = useContext(ConfigurableContentContext);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (viewModel === NOT_FOUND) return <NotFoundPresenter />;

    if (isLoading || viewModel === null) return <Loading />;

    // TODO Remove this exceptional case
    if (aggregateType === CategorizableType.note) {
        return <NoteDetailPageContainer />;
    }

    const compositeIdentifier = { type: aggregateType, id };

    const DetailPresenter = detailPresenterFactory(aggregateType);

    const actionsFromApi = viewModel.actions as IBackendCommandFormAndLabels[];

    const DetailPresenterWithCommands = () => (
        <>
            <DetailPresenter {...viewModel} />
            {/* Note that we don't mix-in static forms if there were no
                    actions returned from the back-end as we're not in admin
                    mode in that case. Note that exposing the forms is only a 
                    matter of user experience and not security. The command will
                    fail if the user doesn't have a valid admin token. */}
            {viewModel?.actions?.length > 0 ? (
                <CommandPanel
                    actions={buildCommandExecutionFormsAndLabels(
                        actionsFromApi,
                        compositeIdentifier
                    )}
                />
            ) : null}
        </>
    );

    return (
        <>
            <DetailPresenterWithCommands />
            {shouldEnableWebOfKnowledgeForResources &&
            isCategorizableCompositeIdentifier(compositeIdentifier) ? (
                <>
                    <ConnectedResourcesPanel compositeIdentifier={compositeIdentifier} />
                    <SelfNotesPanelContainer compositeIdentifier={compositeIdentifier} />
                </>
            ) : null}
        </>
    );
};
