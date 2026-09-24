import { AggregateType } from '@coscrad/api-interfaces';

export const buildDataAttributeForAggregateDetailComponent = (
    aggregateType: AggregateType,
    id: string
) => `${aggregateType}/${id}`;
