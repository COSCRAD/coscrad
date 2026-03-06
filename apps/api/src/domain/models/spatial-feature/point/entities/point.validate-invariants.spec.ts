import { LanguageCode } from '@coscrad/api-interfaces';
import { buildTestInstance } from '../../../../../../src/test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { Point } from './point.entity';

/**
 * TODO Move the point geometry validation test cases here
 */
describe(`Point.validateInvariants`, () => {
    describe(`when the point is valid`, () => {
        describe(`when it has only a traditional name`, () => {
            const validPointWithTraditionalName = buildTestInstance(Point, {
                properties: {
                    traditionalName: buildMultilingualTextWithSingleItem(
                        'big lake',
                        LanguageCode.Chilcotin
                    ),
                },
            });

            it(`should return the expected result`, () => {
                const result = validPointWithTraditionalName.validateInvariants();

                expect(result).toBe(Valid);
            });
        });

        describe(`when it has only a contemporary name`, () => {
            const validPointWithContemporaryName = buildTestInstance(Point, {
                properties: {
                    traditionalName: buildMultilingualTextWithSingleItem(
                        'big lake',
                        LanguageCode.Chilcotin
                    ),
                },
            });

            it(`should return the expected result`, () => {
                const result = validPointWithContemporaryName.validateInvariants();

                expect(result).toBe(Valid);
            });
        });

        describe(`when it has both a traditional and contemporary name`, () => {
            const validPointWithBothNames = buildTestInstance(Point, {
                properties: {
                    traditionalName: buildMultilingualTextWithSingleItem(
                        'big lake',
                        LanguageCode.Chilcotin
                    ),
                },
            });

            it(`should return the expected result`, () => {
                const result = validPointWithBothNames.validateInvariants();

                expect(result).toBe(Valid);
            });
        });
    });

    describe(`when the point is invalid`, () => {
        // we test this in more detail in `SpatialFeatureProperties.validateComplexInvariants` unit test
        describe(`when it has no traditional or contemporary name`, () => {
            const pointWithoutAName = buildTestInstance(Point, {
                properties: {
                    traditionalName: null,
                    contemporaryName: null,
                },
            });

            it(`should return an error`, () => {
                const result = pointWithoutAName.validateInvariants();

                const msg = result.toString();

                expect(msg).toContain(
                    'must have at least one of: traditional name, contemporary name'
                );
            });
        });
    });
});
