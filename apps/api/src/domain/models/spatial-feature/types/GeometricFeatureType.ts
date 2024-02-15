import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { CtorToInstance } from '../../../../lib/types/InstanceToCtor';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Line } from '../line/entities/line.entity';
import { Point } from '../point/entities/point.entity';
import { Polygon } from '../polygon/entities/polygon.entity';

import { GeometricFeatureType } from '@coscrad/api-interfaces';

export { GeometricFeatureType };

/**
 * TODO Can we Make every `GeometricFeatureType` required using types instead of
 * the accompanying unit test?
 */
export const geometricFeatureTypeToSpatialFeatureCtor = {
    [GeometricFeatureType.point]: Point,
    [GeometricFeatureType.line]: Line,
    [GeometricFeatureType.polygon]: Polygon,
} as const;

export type GeometricFeatureTypeToSpatialFeatureCtor = {
    [K in keyof typeof geometricFeatureTypeToSpatialFeatureCtor]: typeof geometricFeatureTypeToSpatialFeatureCtor[K];
};

export type GeometricFeatureTypeToSpatialFeatureInstance = {
    [K in keyof GeometricFeatureTypeToSpatialFeatureCtor]: CtorToInstance<
        GeometricFeatureTypeToSpatialFeatureCtor[K]
    >;
};

export const getSpatialFeatureCtorFromGeometricFeatureType = <T extends GeometricFeatureType>(
    geometricFeatureType: T
): DomainModelCtor<GeometricFeatureTypeToSpatialFeatureInstance[T]> => {
    const lookupResult = geometricFeatureTypeToSpatialFeatureCtor[geometricFeatureType];

    if (isNullOrUndefined(lookupResult)) {
        throw new InternalError(
            `There is no Spatial Feature constructor registered for Geometric Feature Type: ${geometricFeatureType}`
        );
    }

    // TODO investigate further
    return lookupResult as unknown as DomainModelCtor<
        GeometricFeatureTypeToSpatialFeatureInstance[T]
    >;
};
