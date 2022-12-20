import {
    CategorizableType,
    CategorizableTypeToViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { AggregateDetailContainer } from './aggregate-detail-container';

type DetailPresenter<T extends CategorizableType> = (
    viewModel: CategorizableTypeToViewModel[T]
) => JSX.Element;

interface ResourcePageProps<T extends CategorizableType> {
    resourceType: ResourceType;
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
    resourceType,
    detailPresenterFactory,
}: ResourcePageProps<T>): JSX.Element => {
    const id = useIdFromLocation();

    const compositeIdentifier = { type: resourceType, id };

    return (
        <div>
            <AggregateDetailContainer
                compositeIdentifier={compositeIdentifier}
                detailPresenterFactory={detailPresenterFactory}
            />
        </div>
    );
};
