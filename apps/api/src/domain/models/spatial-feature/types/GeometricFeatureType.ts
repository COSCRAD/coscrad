import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { CtorToInstance } from '../../../../lib/types/InstanceToCtor';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Line } from '../entities/line.entity';
import { Point } from '../entities/point.entity';
import { Polygon } from '../entities/polygon.entity';

// Let's trying using a real enum and see if it causes any grief
// the GEOJSON standard specifies that the following values should be capitalized
export enum GeometricFeatureType {
    point = 'Point',
    line = 'LineString',
    polygon = 'Polygon',
}

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

    return lookupResult as DomainModelCtor<GeometricFeatureTypeToSpatialFeatureInstance[T]>;
};
