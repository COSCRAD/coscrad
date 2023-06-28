import {
    AggregateType,
    AggregateTypeToViewModel,
    CategorizableType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CommandPanel, ICommandExecutorAndLabels } from '../commands';
import {
    CommandExecutionFormProps,
    buildCommandExecutor,
    buildDynamicCommandForm,
} from '../commands/command-executor';
import { ConnectResourcesWithNoteForm } from '../commands/connections';
import { CreateNoteForm } from '../commands/connections/create-note-form';
import { NoteDetailPageContainer } from '../notes/note-detail-page.container';
import { WithWebOfKnowledge } from '../resources/shared';
import {
    AggregateDetailContainer,
    AggregateDetailContainerProps,
} from './aggregate-detail-container';

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

    const EnhancedAggregateDetailContainer = shouldEnableWebOfKnowledgeForResources
        ? // @ts-expect-error FIX ME
          WithWebOfKnowledge<AggregateDetailContainerProps<AggregateTypeToViewModel<T>>>(
              AggregateDetailContainer
          )
        : AggregateDetailContainer;

    const EnhancedDetailPresenterFactory = (categorizableType: CategorizableType) => {
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
                .concat(
                    ...(categorizableType === CategorizableType.note
                        ? []
                        : [
                              {
                                  // TODO Pull the meta from the back-end
                                  label: 'Create Note',
                                  description: 'Create a note about this resource',
                                  type: 'CREATE_NOTE_ABOUT_RESOURCE',
                                  executor: buildCommandExecutor(
                                      CreateNoteForm,
                                      {
                                          /**
                                           * Here we bind the composite identifier
                                           * for the current page to the payload
                                           * for `CREATE_NOTE_ABOUT_RESOURCE`. Note
                                           * that this command is being presented in
                                           * a foreign aggregate context, so we do
                                           * not bind to `aggregateCompositeIdentifier`
                                           * on the payload. This, the ID of the newly
                                           * created note, must be generated via the
                                           * ID generation system.
                                           */
                                          resourceCompositeIdentifier: {
                                              ...compositeIdentifier,
                                          },
                                      },
                                      AggregateType.note
                                  ),
                              },
                              {
                                  // TODO Pull the meta from the back-end
                                  label: 'Create Connection with Note',
                                  description:
                                      'Connect this resource to another resource with a note',
                                  type: 'CONNECT_RESOURCES_WITH_NOTE',
                                  executor: buildCommandExecutor(
                                      ({ onSubmitForm }: CommandExecutionFormProps) => (
                                          <ConnectResourcesWithNoteForm
                                              fromMemberCompositeIdentifier={compositeIdentifier}
                                              onSubmitForm={onSubmitForm}
                                              bindProps={{
                                                  fromMemberCompositeIdentifier:
                                                      compositeIdentifier,
                                              }}
                                          />
                                      ),
                                      {
                                          /**
                                           * Here we bind the composite identifier
                                           * for the current page to the payload
                                           * for `CONNECT_RESOURCES_WITH_NOTE`. Note
                                           * that this command is being presented in
                                           * a foreign aggregate context, so we do
                                           * not bind to `aggregateCompositeIdentifier`
                                           * on the payload. This, the ID of the newly
                                           * created note, must be generated via the
                                           * ID generation system.
                                           */
                                          fromMemberCompositeIdentifier: {
                                              ...compositeIdentifier,
                                          },
                                      },
                                      AggregateType.note
                                  ),
                              },
                          ])
                );

            return (
                <>
                    <DetailPresenter {...viewModel} />
                    {viewModel?.actions?.length > 0 ? (
                        <CommandPanel
                            actions={commandExecutionFormsAndLabels}
                            commandContext={compositeIdentifier}
                        />
                    ) : null}
                </>
            );
        };
    };

    return (
        <div>
            <EnhancedAggregateDetailContainer
                compositeIdentifier={compositeIdentifier}
                detailPresenterFactory={EnhancedDetailPresenterFactory}
            />
        </div>
    );
};
