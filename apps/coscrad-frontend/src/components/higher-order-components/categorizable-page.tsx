import {
    AggregateTypeToViewModel,
    CategorizableType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CommandPanel } from '../commands';
import { buildCreateNoteCommandExecutor } from '../commands/connections/create-note-form';
import {
    buildCommandExecutor,
    buildDynamicCommandForm,
} from '../commands/dynamic-command-execution-form';
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
                .map((action) => ({
                    ...action,
                    form: buildCommandExecutor(buildDynamicCommandForm(action)),
                }))
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
                                  form: buildCreateNoteCommandExecutor({
                                      resourceCompositeIdentifier: {
                                          type: categorizableType,
                                          id: viewModel.id,
                                      },
                                  }),
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
