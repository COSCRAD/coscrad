import {
    AggregateTypeToViewModel,
    CategorizableType,
    ICommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CommandPanel } from '../commands';
import { CreateNotePanel } from '../commands/connections/create-note-panel';
import { buildDynamicCommandExecutionForm } from '../commands/dynamic-command-execution-form';
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
            const actionsFromApi = viewModel.actions as ICommandFormAndLabels[];

            const commandExecutionFormsAndLabels = actionsFromApi.map((action) => ({
                ...action,
                form: buildDynamicCommandExecutionForm(action),
            }));

            return (
                <>
                    <DetailPresenter {...viewModel} />
                    {viewModel?.actions?.length > 0 ? (
                        <>
                            <CommandPanel
                                actions={commandExecutionFormsAndLabels}
                                commandContext={compositeIdentifier}
                            />
                            {/* TODO Remove this for the notes view */}
                            {categorizableType === CategorizableType.note ? null : (
                                <CreateNotePanel
                                    resourceCompositeIdentifier={{
                                        type: categorizableType,
                                        id: viewModel.id,
                                    }}
                                />
                            )}
                        </>
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
