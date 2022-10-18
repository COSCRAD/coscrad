import { AggregateInfo } from '../../../view-models/resourceDescriptions/types/AggregateInfo';
import { buildIndexPathForAggregate } from './buildIndexPathForAggregate';

/**
 * Note that this is curried because we almost always want
 * to generate several such links for one single global prefix
 */
export const mixLinkIntoViewModelDescription =
    /**
     * We don't actually need to mix in the global prefix. This is part of the
     * config on the client anyway. We should refactor to no longer curry this.
     */


        (_: string) =>
        (aggregateInfo: Omit<AggregateInfo, 'link'>): AggregateInfo => ({
            ...aggregateInfo,
            link: `/${buildIndexPathForAggregate(aggregateInfo.type)}`,
        });
