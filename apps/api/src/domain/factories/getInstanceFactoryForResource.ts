import { DomainModelCtor } from '../../lib/types/DomainModelCtor';
import { ResultOrError } from '../../types/ResultOrError';
import { Resource } from '../models/resource.entity';
import { ResourceType } from '../types/ResourceType';
import buildBibliographicReferenceFactory from './complexFactories/buildBibliographicReferenceFactory';
import buildSpatialFeatureFactory from './complexFactories/buildSpatialFeatureFactory';
import buildInstanceFactory from './utilities/buildInstanceFactory';
import getAggregateCtorFromAggregateType from './utilities/getAggregateCtorFromAggregateType';

export type InstanceFactory<TResourceType> = (dto: unknown) => ResultOrError<TResourceType>;

/**
 * It would be nice to find a pattern that gives us better type safety.
 */
export default <TResource extends Resource>(
    resourceType: ResourceType
): InstanceFactory<TResource> => {
    if (resourceType === ResourceType.spatialFeature)
        // @ts-expect-error TODO fix this tricky type error
        return buildSpatialFeatureFactory();

    if (resourceType === ResourceType.bibliographicReference)
        // @ts-expect-error TODO fix this tricky type error
        return buildBibliographicReferenceFactory();

    const Ctor = getAggregateCtorFromAggregateType(resourceType);

    return buildInstanceFactory<TResource>(Ctor as DomainModelCtor<TResource>);
};
