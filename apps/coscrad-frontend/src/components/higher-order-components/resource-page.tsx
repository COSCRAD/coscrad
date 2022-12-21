import { CategorizableType, CategorizableTypeToViewModel } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { WithCommands } from '../resources/shared';
import { AggregateDetailContainer } from './aggregate-detail-container';

type DetailPresenter<T extends CategorizableType> = (
    viewModel: CategorizableTypeToViewModel[T]
) => JSX.Element;

interface ResourcePageProps<T extends CategorizableType> {
    categorizableType: CategorizableType;
    detailPresenterFactory: (categorizableType: T) => DetailPresenter<T>;
}

/**
 * TODO [https://www.pivotaltracker.com/story/show/184069659]
 *
 * We may want to extends this to an `AggregatePage` some day, or at least
 * `CategorizablePage`. We aren't too concerned about that right now as our core
 * value is being extensbile to adding new resource typs and non-resource
 * aggregates are one-offs.
 *
 * We may want to put this in `/Components/Resources/Shared`.
 */
export const ResourcePage = <T extends CategorizableType>({
    categorizableType,
    detailPresenterFactory,
}: ResourcePageProps<T>): JSX.Element => {
    const id = useIdFromLocation();

    const { shouldEnableWebOfKnowledgeForResources } = useContext(ConfigurableContentContext);

    // TODO Determine this from user's roles
    const shouldShowCommands = true;

    const compositeIdentifier = { type: categorizableType, id };

    const EnhancedAggregateDetailContainer = (
        [
            [WithCommands, shouldShowCommands],
            // [WithWebOfKnowledge, shouldEnableWebOfKnowledgeForResources],
        ] as const
    ).reduce(
        (PartiallyDecoratedComponent, [Wrap, predicate]) =>
            predicate ? Wrap(PartiallyDecoratedComponent) : PartiallyDecoratedComponent,

        AggregateDetailContainer
    );

    return (
        <div>
            <EnhancedAggregateDetailContainer
                compositeIdentifier={compositeIdentifier}
                detailPresenterFactory={detailPresenterFactory}
            />
        </div>
    );
};
