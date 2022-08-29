import { Ctor } from '../../../lib/types/Ctor';
import { isBibliographicReferenceType } from '../../models/bibliographic-reference/types/BibliographicReferenceType';
import { getSpatialFeatureCtorFromGeometricFeatureType } from '../../models/spatial-feature/types/GeometricFeatureType';
import isGeometricFeatureType from '../../models/spatial-feature/types/isGeometricFeatureType';
import { AggregateType, AggregateTypeToAggregateInstance } from '../../types/AggregateType';
import getCtorFromBibliographicReferenceType from '../complexFactories/buildBibliographicReferenceFactory/getCtorFromBibliographicReferenceType';
import getAggregateCtorFromAggregateType from './getAggregateCtorFromAggregateType';
import { isDiscriminatedUnionResourceType } from './isDiscriminatedUnionResourceType';

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
        if (isBibliographicReferenceType(subtype))
            return getCtorFromBibliographicReferenceType(subtype) as Ctor<
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
