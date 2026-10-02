import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NotFound } from '../../../lib/types/not-found';
import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import { buildTestInstance } from '../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../common/entities/errors';
import { MultilingualText, MultilingualTextItem } from '../../common/entities/multilingual-text';
import { GeospatialMap } from './geospatial-map.entity';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.French;

const existingGeospatialMapWithTextInOneLanguage = buildTestInstance(GeospatialMap, {
    name: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
});

const translationText = 'translation for the geospatial map name text';

describe(`GeospatialMap.translateName`, () => {
    describe(`when the translation is valid`, () => {
        it(`should translate the name`, () => {
            const result = existingGeospatialMapWithTextInOneLanguage.translateName(
                translationText,
                translationLanguageCode
            );

            expect(result).toBeInstanceOf(GeospatialMap);

            const translationSearchResult = (result as GeospatialMap).name.getTranslation(
                translationLanguageCode
            );

            expect(translationSearchResult).not.toBe(NotFound);

            const { text, role } = translationSearchResult as MultilingualTextItem;

            expect(text).toBe(translationText);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`when there is already a translation`, () => {
        const existingText = buildMultilingualTextWithSingleItem(
            'original',
            originalLanguageCode
        ).translate({
            text: 'translation',
            languageCode: translationLanguageCode,
            role: MultilingualTextItemRole.freeTranslation,
        }) as MultilingualText;

        const existingGeospatialMap = buildTestInstance(GeospatialMap, {
            name: existingText,
        });

        const translationText = 'this language is already in use here';

        it(`should return the expected error`, () => {
            const result = existingGeospatialMap.translateName(
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
            const translationText = `You can't currently provide literal translation in the original language`;

            const result = existingGeospatialMapWithTextInOneLanguage.translateName(
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
                    existingGeospatialMapWithTextInOneLanguage.name
                )
            );
        });
    });
});
