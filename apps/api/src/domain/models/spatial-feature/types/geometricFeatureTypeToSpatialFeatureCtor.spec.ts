import {
    GeometricFeatureType,
    geometricFeatureTypeToSpatialFeatureCtor,
} from './GeometricFeatureType';

describe(`geometricFeatureTypeToSpatialFeatureCtor`, () => {
    Object.values(GeometricFeatureType).forEach((geometricFeatureType) => {
        describe(`geometric feature type: ${geometricFeatureType}`, () => {
            it('should have a registered Ctor', () => {
                expect(geometricFeatureTypeToSpatialFeatureCtor[geometricFeatureType]).toBeTruthy();
            });
        });
    });
});
