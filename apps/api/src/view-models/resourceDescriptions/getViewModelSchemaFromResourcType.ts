import { getCoscradDataSchema } from '@coscrad/data-types';
import { AggregateTypesWhoseViewsAreSourcedFromSnapshots } from '../buildViewModelForResource/viewModels/utilities/ViewModelCtorFromResourceType';
import { getViewModelCtorFromAggregateType } from '../buildViewModelForResource/viewModels/utilities/ViewModelCtorFromResourceType/getViewModelCtorFromAggregateType';

export const getViewModelSchemaFromAggregateType = (
    aggregateType: AggregateTypesWhoseViewsAreSourcedFromSnapshots
) => getCoscradDataSchema(getViewModelCtorFromAggregateType(aggregateType));
