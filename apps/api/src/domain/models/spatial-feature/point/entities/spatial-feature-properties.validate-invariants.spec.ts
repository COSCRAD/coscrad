import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { SpatialFeatureMustHaveANameError } from '../../errors';
import { SpatialFeatureProperties } from './spatial-feature-properties.entity';

describe(`SpatialFeatureProperties.validateComplexInvariants`, () => {
    describe(`when the instance is valid`, () => {
        it.todo(`should return the expected result`);
    });

    describe(`when the instance is invalid`, () => {
        const invalidSpatialFeatureProperties = buildTestInstance(SpatialFeatureProperties, {
            traditionalName: null,
            contemporaryName: null,
        });

        describe(`when neither a traditional nor contemporary name exists`, () => {
            it(`should return the expected error`, () => {
                const result = invalidSpatialFeatureProperties.validateComplexInvariants();

                expect(result).toHaveLength(1);

                assertErrorAsExpected(result[0], new SpatialFeatureMustHaveANameError());
            });
        });
    });
});
