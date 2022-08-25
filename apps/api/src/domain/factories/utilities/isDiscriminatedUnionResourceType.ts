import { AggregateType } from '../../types/AggregateType';
import { ResourceType } from '../../types/ResourceType';

const discriminatedUnionResourceTypes = [
    ResourceType.bibliographicReference,
    ResourceType.spatialFeature,
] as const;

type DiscriminatedUnionResourceType = typeof discriminatedUnionResourceTypes[number];

/**
 * We may eventually want to dynamically register the resource types that are
 * for a discriminated union. We could do this via a decorator
 * @Resource({discriminator: 'point'}). In this case, the following function will
 * be refactored to leverage 'discovery'.
 */
export const isDiscriminatedUnionResourceType = (
    aggregateType: AggregateType
): aggregateType is DiscriminatedUnionResourceType =>
    discriminatedUnionResourceTypes.includes(aggregateType as DiscriminatedUnionResourceType);
