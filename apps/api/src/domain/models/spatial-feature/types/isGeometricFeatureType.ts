import { GeometricFeatureType } from './GeometricFeatureType';

export default (input: unknown): input is GeometricFeatureType =>
    Object.values(GeometricFeatureType).some((featureType) => input === featureType);
