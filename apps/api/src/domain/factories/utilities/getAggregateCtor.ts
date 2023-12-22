import { Ctor } from '../../../lib/types/Ctor';
import { isBibliographicCitationType } from '../../models/bibliographic-citation/types/bibliogrpahic-citation-type';
import { getSpatialFeatureCtorFromGeometricFeatureType } from '../../models/spatial-feature/types/GeometricFeatureType';
import isGeometricFeatureType from '../../models/spatial-feature/types/isGeometricFeatureType';
import { AggregateType, AggregateTypeToAggregateInstance } from '../../types/AggregateType';
import getCtorFromBibliographicCitationType from '../complex-factories/build-bibliographic-citation-factory/get-ctor-from-bibliographic-citation-type';
import getAggregateCtorFromAggregateType from './getAggregateCtorFromAggregateType';
import { isDiscriminatedUnionResourceType } from './isDiscriminatedUnionResourceType';

// TODO Remove this logic in favor of dynamic registration via annotation (decorators)
export const getAggregateCtor = <TAggregateType extends AggregateType>(
    type: TAggregateType,
    subtype?: string
): Ctor<AggregateTypeToAggregateInstance[TAggregateType]> => {
    /**
     * We probably want a more extensible, dynamic way to do this. The time to
     * go there is when we introduce an `@Resource` decorator with an
     * `isUnion` option.
     */
    if (isDiscriminatedUnionResourceType(type)) {
        if (isBibliographicCitationType(subtype))
            // @ts-expect-error TODO remove these lookup tables and use dynamic registration
            return getCtorFromBibliographicCitationType(subtype) as Ctor<
                AggregateTypeToAggregateInstance[TAggregateType]
            >;

        if (isGeometricFeatureType(subtype)) {
            return getSpatialFeatureCtorFromGeometricFeatureType(subtype) as unknown as Ctor<
                AggregateTypeToAggregateInstance[TAggregateType]
            >;
        }
    }

    return getAggregateCtorFromAggregateType(type);
};
