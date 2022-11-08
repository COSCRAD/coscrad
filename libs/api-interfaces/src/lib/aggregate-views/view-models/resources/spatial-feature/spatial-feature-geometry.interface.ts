import { GeometricFeatureType } from './geometric-feature-type.enum';

export interface ISpatialFeatureGeometry<T> {
    type: GeometricFeatureType;
    coordinates: T;
}
