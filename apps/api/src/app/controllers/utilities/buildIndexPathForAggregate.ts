import { isStringWithNonzeroLength } from '@coscrad/validation';
import { AggregateType } from '../../../domain/types/AggregateType';
import { isResourceType, ResourceType } from '../../../domain/types/ResourceType';
import { InternalError } from '../../../lib/errors/InternalError';
import { CATEGORY_TREE_INDEX_ROUTE } from '../category.controller';
import { USER_GROUP_INDEX_ROUTE } from '../coscrad-user-group.controller';
import { USER_INDEX_ROUTE } from '../coscrad-user.controller';
import { NOTE_INDEX_ROUTE } from '../edgeConnection.controller';
import { TAG_INDEX_ROUTE } from '../tag.controller';
import buildIndexPathForResourceType from './buildIndexPathForResourceType';

const nonResourceAggregateTypeToIndexPath: {
    [K in Exclude<AggregateType, ResourceType>]: string;
} = {
    note: NOTE_INDEX_ROUTE,
    tag: TAG_INDEX_ROUTE,
    category: CATEGORY_TREE_INDEX_ROUTE,
    user: USER_INDEX_ROUTE,
    userGroup: USER_GROUP_INDEX_ROUTE,
};

export const buildIndexPathForAggregate = (aggregateType: AggregateType): string => {
    if (isResourceType(aggregateType)) return buildIndexPathForResourceType(aggregateType);

    const lookupResult = nonResourceAggregateTypeToIndexPath[aggregateType];

    if (!isStringWithNonzeroLength(lookupResult)) {
        throw new InternalError(
            `There is no route registered for aggregate of type: ${aggregateType}`
        );
    }

    return lookupResult;
};
