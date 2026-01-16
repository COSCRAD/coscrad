import {
    AggregateType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    IDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { NOT_FOUND } from '../../../store/slices/interfaces/maybe-loadable.interface';
import { useLoadableTermById } from '../../../store/slices/resources';
import { SelfNotesPanelPresenter } from '../../../store/slices/resources/shared/notes-for-resource/self-notes-panel.presenter';
import { useIdFromLocation } from '../../../utils/custom-hooks/use-id-from-location';
import { CommandPanel } from '../../commands';
import { ErrorDisplay } from '../../error-display/error-display';
import { CategorizablesOfMultipleTypeContainer } from '../../higher-order-components';
import { buildCommandExecutionFormsAndLabels } from '../../higher-order-components/aggregate-page';
import { CategorizablePageLayout } from '../../higher-order-components/categorizable-page-layout';
import { Loading } from '../../loading';
import { NotFoundPresenter } from '../../not-found';
import { thumbnailCategorizableDetailPresenterFactory } from '../factories/thumbnail-categorizable-detail-presenter-factory';

interface TermPageProps {
    DetailPresenter: (viewModel: IDetailQueryResult<ITermViewModel>) => JSX.Element;
}

export const TermDetailPage = ({ DetailPresenter }: TermPageProps): JSX.Element => {
    const id = useIdFromLocation();

    const { isLoading, errorInfo, data: viewModel } = useLoadableTermById(id);

    const { shouldEnableWebOfKnowledgeForResources } = useContext(ConfigurableContentContext);

    if (viewModel === NOT_FOUND) return <NotFoundPresenter />;

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading || viewModel === null) return <Loading />;

    const compositeIdentifier = { type: AggregateType.term, id };

    const actionsFromApi = viewModel.actions as IBackendCommandFormAndLabels[];

    const connectResourceCompositeIds = Object.values(viewModel.connections || {}).map(
        ({ otherCompositeIdentifier }) => otherCompositeIdentifier
    );

    /**
     * If the actions array is empty, the user does not have write access to
     * the aggregate root.
     *
     * For audio items, we disable the command panel, even for admin, in favor
     * of a more "immersive admin experience". This introduces collisions with
     * the dynamic command forms available in the command panel.
     */
    const shouldShowCommands = viewModel?.actions?.length > 0;

    const Commands = () => (
        <>
            {/* Note that we don't mix-in static forms if there were no
                        actions returned from the back-end as we're not in admin
                        mode in that case. Note that exposing the forms is only a 
                        matter of user experience and not security. The command will
                        fail if the user doesn't have a valid admin token. */}
            {shouldShowCommands ? (
                <CommandPanel
                    actions={buildCommandExecutionFormsAndLabels(
                        actionsFromApi,
                        compositeIdentifier
                    )}
                />
            ) : null}
        </>
    );

    return shouldEnableWebOfKnowledgeForResources ? (
        <CategorizablePageLayout
            compositeIdentifier={compositeIdentifier}
            selfNotesList={
                <SelfNotesPanelPresenter
                    compositeIdentifier={{
                        type: ResourceType.term,
                        id,
                        // TODO make sure these are populated from the back-end
                    }}
                    notes={Object.values(viewModel.notes).map((note) => {
                        const { id, note: text, context } = note;

                        /**
                         * In the future, we should expose the translations as well.
                         * These are available by language code via text.translations.
                         */
                        const singleLanguageText = text.original.text;

                        return {
                            id,
                            text: singleLanguageText,
                            context,
                        };
                    })}
                />
            }
            connectedResourcesList={
                connectResourceCompositeIds.length > 0 ? (
                    /**
                     * TODO We need to populate this from the denormalized view sent
                     * from the back-end. Currently, we only have the `resourceCompositeIdentifiers`
                     * for connected resourceson the view model. We should update our
                     * event consumer to eagerly join in the nested view.
                     */
                    <CategorizablesOfMultipleTypeContainer
                        heading="Connected Resources"
                        members={connectResourceCompositeIds}
                        detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                    />
                ) : (
                    <>No connections found.</>
                )
            }
            commandPanel={<Commands />}
        >
            <DetailPresenter {...viewModel} />
        </CategorizablePageLayout>
    ) : (
        <>
            <DetailPresenter {...viewModel} />
            <Commands />
        </>
    );
};
