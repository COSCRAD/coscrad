import { AggregateTypeToViewModel, CategorizableType } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CommandPanel } from '../commands';
import { NoteDetailPageContainer } from '../notes/note-detail-page.container';
import { WithWebOfKnowledge } from '../resources/shared';
import {
    AggregateDetailContainer,
    AggregateDetailContainerProps,
} from './aggregate-detail-container';

interface IDetailPresenter<T extends CategorizableType> {
    (viewModel: AggregateTypeToViewModel[T]): JSX.Element;
}

interface ResourcePageProps<T extends CategorizableType> {
    categorizableType: CategorizableType;
    DetailPresenter: IDetailPresenter<T>;
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
    DetailPresenter,
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

    const EnhancedDetailPresenterFactory = () => {
        return (viewModel) => (
            <>
                <DetailPresenter {...viewModel} />
                {viewModel?.actions?.length > 0 ? (
                    <CommandPanel
                        actions={viewModel.actions}
                        commandContext={compositeIdentifier}
                    />
                ) : null}
            </>
        );
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
