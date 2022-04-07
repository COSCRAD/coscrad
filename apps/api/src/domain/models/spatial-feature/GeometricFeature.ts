import { GeometricCoordinatesUnion } from './types/Coordinates/GeometricCoordinatesUnion';
import { GeometricFeatureType } from './types/GeometricFeatureType';

export interface GeometricFeature<
    TGeometricFeatureType extends GeometricFeatureType = GeometricFeatureType,
    UCoordinateType extends GeometricCoordinatesUnion = GeometricCoordinatesUnion
> {
    type: TGeometricFeatureType;

    coordinates: UCoordinateType;
}
