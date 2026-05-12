import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../../../../domain/common/entities/errors';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { SpatialFeatureProperties } from './spatial-feature-properties.entity';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const existingSpatialFeaturePropertiesWithTextInOneLanguage = buildTestInstance(
    SpatialFeatureProperties,
    {
        name: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
    }
);

const translationText = 'translation for spatial feature name text';

describe(`SpatialFeatureProperties.translateName`, () => {
    describe(`when the translation is valid`, () => {
        it(`should translate the name`, () => {
            const result = existingSpatialFeaturePropertiesWithTextInOneLanguage.translateName(
                translationText,
                translationLanguageCode
            );

            expect(result).toBeInstanceOf(SpatialFeatureProperties);

            const translationSearchResult = (
                result as SpatialFeatureProperties
            ).name.getTranslation(translationLanguageCode);

            expect(translationSearchResult).not.toBe(NotFound);

            const { text, role } = translationSearchResult as MultilingualTextItem;

            expect(text).toBe(translationText);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`when there is already a literal translation in the given language`, () => {
        const existingText = buildMultilingualTextWithSingleItem(
            'original',
            originalLanguageCode
        ).translate({
            text: 'translation',
            languageCode: translationLanguageCode,
            role: MultilingualTextItemRole.freeTranslation,
        }) as MultilingualText;

        const existingSpatialFeature = buildTestInstance(SpatialFeatureProperties, {
            name: existingText,
        });

        const translationText = 'this language is already in use here';

        it(`should return the expected error`, () => {
            const result = existingSpatialFeature.translateName(
                translationText,
                translationLanguageCode
            );

            assertErrorAsExpected(
                result,
                new CannotAddDuplicateTranslationError(
                    new MultilingualTextItem({
                        text: translationText,
                        languageCode: translationLanguageCode,
                        role: MultilingualTextItemRole.freeTranslation,
                    }),
                    existingText
                )
            );
        });
    });

    describe(`when the translation language is the same as the original language`, () => {
        it(`should fail with the expected error`, () => {
            const translationText = `You can't currently provide a literal translation in the original language`;

            const result = existingSpatialFeaturePropertiesWithTextInOneLanguage.translateName(
                translationText,
                originalLanguageCode
            );

            assertErrorAsExpected(
                result,
                new CannotAddDuplicateTranslationError(
                    new MultilingualTextItem({
                        text: translationText,
                        languageCode: originalLanguageCode,
                        role: MultilingualTextItemRole.freeTranslation,
                    }),
                    existingSpatialFeaturePropertiesWithTextInOneLanguage.name
                )
            );
        });
    });
});
