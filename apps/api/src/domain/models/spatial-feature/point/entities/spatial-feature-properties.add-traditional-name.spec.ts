import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { CannotReplaceTraditionalNameError } from '../../errors';
import { SpatialFeatureProperties } from './spatial-feature-properties.entity';

const emptySpatialFeatureProperties = buildTestInstance(SpatialFeatureProperties, {});

const textForName = `big hole`;

const languageCode = LanguageCode.French;

describe(`SpatialFeatureProperties.addTraditionalName`, () => {
    describe(`when the update is valid`, () => {
        it(`should add the traditional name`, () => {
            const result = emptySpatialFeatureProperties.addTraditionalName(
                textForName,
                languageCode
            );

            const { traditionalName: updatedName } = result as SpatialFeatureProperties;

            expect(updatedName.getOriginalTextItem().text).toBe(textForName);
        });
    });

    describe(`when the update is invalid`, () => {
        describe(`when there is already a traditional name`, () => {
            const spatialFeaturePropertiesWithExistingTraditionalName = buildTestInstance(
                SpatialFeatureProperties,
                {
                    traditionalName: buildMultilingualTextWithSingleItem(textForName, languageCode),
                }
            );

            const newTextForName = 'Little Hole';

            it.only(`should return the expected error`, () => {
                const result =
                    spatialFeaturePropertiesWithExistingTraditionalName.addTraditionalName(
                        newTextForName,
                        languageCode
                    );

                assertErrorAsExpected(
                    result,
                    new CannotReplaceTraditionalNameError(newTextForName, textForName)
                );
            });
        });
    });
});
