import { isNullOrUndefined } from '../../../../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../../../../lib/errors/InternalError';
import {
    AggregateTypesWhoseViewsAreSourcedFromSnapshots,
    aggregateTypeToViewModelCtor,
} from './aggregateTypeToViewModelCtor';
import { AggregateTypeToViewModelCtor } from './types';

export const getViewModelCtorFromAggregateType = <
    T extends AggregateTypesWhoseViewsAreSourcedFromSnapshots
>(
    resourceType: T
): AggregateTypeToViewModelCtor[T] => {
    const lookupResult = aggregateTypeToViewModelCtor[resourceType];

    if (isNullOrUndefined(lookupResult)) {
        throw new InternalError(
            `Failed to find a view model constructor for resource type: ${resourceType}`
        );
    }

    return lookupResult as AggregateTypeToViewModelCtor[T];
};
