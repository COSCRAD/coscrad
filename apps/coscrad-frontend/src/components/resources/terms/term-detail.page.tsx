import {
    AggregateType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    IDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { useLoadableTermById } from '../../../store/slices/resources';
import { SelfNotesPanelPresenter } from '../../../store/slices/resources/shared/notes-for-resource/self-notes-panel.presenter';
import { useIdFromLocation } from '../../../utils/custom-hooks/use-id-from-location';
import { CommandPanel } from '../../commands';
import { ErrorDisplay } from '../../error-display/error-display';
import { buildCommandExecutionFormsAndLabels } from '../../higher-order-components/aggregate-page';
import { CategorizablePageLayout } from '../../higher-order-components/categorizable-page-layout';
import { Loading } from '../../loading';
import { NotFoundPresenter } from '../../not-found';

interface TermPageProps {
    DetailPresenter: (viewModel: IDetailQueryResult<ITermViewModel>) => JSX.Element;
}

export const TermDetailPage = ({ DetailPresenter }: TermPageProps): JSX.Element => {
    const id = useIdFromLocation();

    const { isLoading, errorInfo, data: viewModel } = useLoadableTermById(id);

    const { shouldEnableWebOfKnowledgeForResources } = useContext(ConfigurableContentContext);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (viewModel === null) return <NotFoundPresenter />;

    if (isLoading || viewModel === null) return <Loading />;

    const compositeIdentifier = { type: AggregateType.term, id };

    const actionsFromApi = viewModel.actions as IBackendCommandFormAndLabels[];

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
                    notes={[]}
                />
            }
            connectedResourcesList={
                // TODO We need to populate this from the denormalized view sent from the back-end
                <NotFoundPresenter />
                // <SelectedCategorizablesOfMultipleTypesPresenter viewModelSnapshot={undefined} presenterFactory={undefined} getPluralLabelForCategorizableType={function (categorizableType: CategorizableType): string {
                //     throw new Error('Function not implemented.');
                // } } />
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
