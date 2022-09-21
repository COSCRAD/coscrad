import { getCoscradDataSchema } from '@coscrad/data-types';
import { AggregateType } from '../../domain/types/AggregateType';
import { getViewModelCtorFromAggregateType } from '../buildViewModelForResource/viewModels/utilities/ViewModelCtorFromResourceType/getViewModelCtorFromAggregateType';

export const getViewModelSchemaFromAggregateType = (aggregateType: AggregateType) =>
    getCoscradDataSchema(getViewModelCtorFromAggregateType(aggregateType));
