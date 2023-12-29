import { DomainModelCtor } from '../../lib/types/DomainModelCtor';
import { ResultOrError } from '../../types/ResultOrError';
import { Aggregate } from '../models/aggregate.entity';
import { AggregateType } from '../types/AggregateType';
import buildBibliographicCitationFactory from './complex-factories/build-bibliographic-citation-factory';
import buildSpatialFeatureFactory from './complex-factories/build-spatial-feature-factory';
import buildInstanceFactory from './utilities/buildInstanceFactory';
import getAggregateCtorFromAggregateType from './utilities/getAggregateCtorFromAggregateType';

export type InstanceFactory<TResourceType> = (dto: unknown) => ResultOrError<TResourceType>;

/**
 * It would be nice to find a pattern that gives us better type safety.
 */
export default <TResource extends Aggregate>(
    aggregateType: AggregateType
): InstanceFactory<TResource> => {
    // @ts-expect-error TODO correlated types
    if (aggregateType === AggregateType.spatialFeature) return buildSpatialFeatureFactory();

    if (aggregateType === AggregateType.bibliographicCitation)
        // @ts-expect-error TODO correlated types
        return buildBibliographicCitationFactory();

    const Ctor = getAggregateCtorFromAggregateType(aggregateType);

    return buildInstanceFactory<TResource>(Ctor as unknown as DomainModelCtor<TResource>);
};
