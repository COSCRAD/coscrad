import { PointCoordinates } from './types/Coordinates/PointCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

export class GeometricFeature {
    type: GeometricFeatureType;

    coordinates: PointCoordinates;
}
