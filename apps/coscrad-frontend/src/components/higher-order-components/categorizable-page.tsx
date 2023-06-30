import {
    AggregateTypeToViewModel,
    CategorizableType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { ConnectedResourcesPanel } from '../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../store/slices/resources/shared/notes-for-resource';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CommandPanel, ICommandExecutorAndLabels } from '../commands';
import { buildStaticCommandExecutors } from '../commands/build-static-command-executors';
import { buildCommandExecutor, buildDynamicCommandForm } from '../commands/command-executor';
import { NoteDetailPageContainer } from '../notes/note-detail-page.container';
import { AggregateDetailContainer } from './aggregate-detail-container';

type DetailPresenter<T extends CategorizableType> = (
    viewModel: AggregateTypeToViewModel[T]
) => JSX.Element;

interface ResourcePageProps<T extends CategorizableType> {
    categorizableType: CategorizableType;
    detailPresenterFactory: (categorizableType: T) => DetailPresenter<T>;
}

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
export const CategorizablePage = <T extends CategorizableType>({
    categorizableType,
    detailPresenterFactory,
}: ResourcePageProps<T>): JSX.Element => {
    const id = useIdFromLocation();

    const { shouldEnableWebOfKnowledgeForResources } = useContext(ConfigurableContentContext);

    if (categorizableType === CategorizableType.note) {
        return <NoteDetailPageContainer />;
    }

    const compositeIdentifier = { type: categorizableType, id };

    const DetailPresenterWithCommandPanel = (categorizableType: CategorizableType) => {
        // @ts-expect-error FIX ME
        const DetailPresenter = detailPresenterFactory(categorizableType);

        return (viewModel) => {
            const actionsFromApi = viewModel.actions as IBackendCommandFormAndLabels[];

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

            return (
                <>
                    <DetailPresenter {...viewModel} />
                    {/* Note that we don't mix-in static forms if there were no
                    actions returned from the back-end as we're not in admin
                    mode in that case. Note that exposing the forms is only a 
                    matter of user experience and not security. The command will
                    fail if the user doesn't have a valid admin token. */}
                    {viewModel?.actions?.length > 0 ? (
                        <Accordion>
                            <AccordionSummary>
                                <Typography variant="h3">Commands</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <CommandPanel actions={commandExecutionFormsAndLabels} />
                            </AccordionDetails>
                        </Accordion>
                    ) : null}
                </>
            );
        };
    };

    return (
        <>
            <AggregateDetailContainer
                compositeIdentifier={compositeIdentifier}
                detailPresenterFactory={DetailPresenterWithCommandPanel}
            />
            {shouldEnableWebOfKnowledgeForResources ? (
                <>
                    <ConnectedResourcesPanel compositeIdentifier={compositeIdentifier} />
                    <SelfNotesPanelContainer compositeIdentifier={compositeIdentifier} />
                </>
            ) : null}
        </>
    );
};
