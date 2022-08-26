import { GeometricCoordinatesUnion } from '../types/Coordinates/GeometricCoordinatesUnion';
import { GeometricFeatureType } from '../types/GeometricFeatureType';

export interface IGeometricFeature<
    TGeometricFeatureType extends GeometricFeatureType = GeometricFeatureType,
    UCoordinate extends GeometricCoordinatesUnion = GeometricCoordinatesUnion
> {
    type: TGeometricFeatureType;

    coordinates: UCoordinate;
}
