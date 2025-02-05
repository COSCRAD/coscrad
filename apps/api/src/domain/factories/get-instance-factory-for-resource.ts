import { DomainModelCtor } from '../../lib/types/DomainModelCtor';
import { ResultOrError } from '../../types/ResultOrError';
import { Resource } from '../models/resource.entity';
import { ResourceType } from '../types/ResourceType';
import buildBibliographicCitationFactory from './complex-factories/build-bibliographic-citation-factory';
import buildSpatialFeatureFactory from './complex-factories/build-spatial-feature-factory';
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

    if (resourceType === ResourceType.bibliographicCitation)
        // @ts-expect-error TODO fix this tricky type error
        return buildBibliographicCitationFactory();

    const Ctor = getAggregateCtorFromAggregateType(resourceType);

    /**
     * Realistically, all we need is to use the following and cast. We don't
     * need magic mapping layers from global enums to types \ Ctors.
     */
    return buildInstanceFactory<TResource>(Ctor as unknown as DomainModelCtor<TResource>);
};
