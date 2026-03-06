import { GeometricCoordinatesUnion } from '../types/Coordinates/GeometricCoordinatesUnion';

export interface IGeometricFeature<
    TGeometricFeatureType extends string = string,
    UCoordinate extends GeometricCoordinatesUnion = GeometricCoordinatesUnion
> {
    type: TGeometricFeatureType;

    coordinates: UCoordinate;
}
