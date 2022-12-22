import { CategorizableType, CategorizableTypeToViewModel } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { NoteDetailContainer } from '../notes/note-detail.container';
import { WithCommands, WithWebOfKnowledge } from '../resources/shared';
import {
    AggregateDetailContainer,
    AggregateDetailContainerProps,
} from './aggregate-detail-container';

type DetailPresenter<T extends CategorizableType> = (
    viewModel: CategorizableTypeToViewModel[T]
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
        return <NoteDetailContainer />;
    }

    // TODO Determine this from user's roles
    // TODO Move this to a higher `AggregatePage`
    const shouldShowCommands = true;

    const compositeIdentifier = { type: categorizableType, id };

    const EnhancedAggregateDetailContainer = shouldEnableWebOfKnowledgeForResources
        ? // @ts-expect-error FIX ME
          WithWebOfKnowledge<AggregateDetailContainerProps<CategorizableTypeToViewModel<T>>>(
              AggregateDetailContainer
          )
        : AggregateDetailContainer;

    const EnhancedDetailPresenterFactory = shouldShowCommands
        ? (categorizableType: CategorizableType) =>
              WithCommands(
                  // @ts-expect-error FIX ME
                  detailPresenterFactory(categorizableType),
                  // @ts-expect-error FIX ME
                  ({ actions }) => actions,
                  (_) => compositeIdentifier
              )
        : detailPresenterFactory;

    return (
        <div>
            <EnhancedAggregateDetailContainer
                compositeIdentifier={compositeIdentifier}
                detailPresenterFactory={EnhancedDetailPresenterFactory}
            />
        </div>
    );
};
