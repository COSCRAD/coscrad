import { GeometricFeatureType } from './GeometricFeatureType';
import isGeometricFeatureType from './isGeometricFeatureType';
/**
 * The main value in this test is that this is the first time I've created
 * a typeGuard for an enum, having previously used objects for the same purpose.
 * I want to make sure that I've got this right.
 */
describe('isGeometricFeatureType', () => {
    Object.values(GeometricFeatureType).forEach((featureType) =>
        describe(`For a valid feature type string identifier: ${featureType}`, () => {
            it('should return true', () => {
                const isValid = isGeometricFeatureType(featureType);

                expect(isValid).toBe(true);
            });
        })
    );

    ['scribble', 8, { foo: [1, 2, 3] }].forEach((invalidType) =>
        describe(`For an invalid feature type: ${invalidType}`, () => {
            it('should return false', () => {
                const isValid = isGeometricFeatureType(invalidType);

                expect(isValid).toBe(false);
            });
        })
    );
});
