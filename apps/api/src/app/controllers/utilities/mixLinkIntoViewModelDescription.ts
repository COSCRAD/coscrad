import { AggregateInfo } from '../../../view-models/resourceDescriptions/types/AggregateInfo';
import { buildIndexPathForAggregate } from './buildIndexPathForAggregate';

/**
 * Note that this is curried because we almost always want
 * to generate several such links for one single global prefix
 */
export const mixLinkIntoViewModelDescription =
    (globalPrefix: string) =>
    (aggregateInfo: AggregateInfo): AggregateInfo & { link: string } => ({
        ...aggregateInfo,
        link: `/${globalPrefix}/${buildIndexPathForAggregate(aggregateInfo.type)}`,
    });
