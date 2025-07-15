import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../../common/entities/errors';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { Term } from './term.entity';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const existingTermWithTextInOneLanguage = buildTestInstance(Term, {
    text: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
});

const translationText = 'said by one in other way was this';

describe(`Term.provideLiteralTranslation`, () => {
    describe(`when the translation is valid`, () => {
        it(`should return the updated term`, () => {
            const result = existingTermWithTextInOneLanguage.provideLiteralTranslation(
                translationText,
                translationLanguageCode
            );

            expect(result).toBeInstanceOf(Term);

            const { text } = result as Term;

            expect(text.has(translationLanguageCode)).toBe(true);

            const { text: foundTranslationText, role: foundTranslationItemRole } =
                text.getTranslation(translationLanguageCode) as MultilingualTextItem;

            expect(foundTranslationItemRole).toBe(MultilingualTextItemRole.literalTranslation);

            expect(foundTranslationText).toBe(translationText);
        });
    });

    describe(`when there is already a literal translation in the given language`, () => {
        const existingText = buildMultilingualTextWithSingleItem(
            'original',
            originalLanguageCode
        ).translate({
            text: 'translation',
            languageCode: translationLanguageCode,
            role: MultilingualTextItemRole.literalTranslation,
        }) as MultilingualText;

        const existingTerm = buildTestInstance(Term, {
            text: existingText,
        });

        const translationText = 'oops, someone already did this one';

        it(`should return the expected error`, () => {
            const result = existingTerm.provideLiteralTranslation(
                translationText,
                translationLanguageCode
            );

            assertErrorAsExpected(
                result,
                new CannotAddDuplicateTranslationError(
                    new MultilingualTextItem({
                        text: translationText,
                        languageCode: translationLanguageCode,
                        role: MultilingualTextItemRole.literalTranslation,
                    }),
                    existingText
                )
            );
        });
    });

    describe(`when the translation language is the same as the original language`, () => {
        it(`should fail with the expected error`, () => {
            const translationText = `You can't currently provide a literal translation in the original language`;

            const result = existingTermWithTextInOneLanguage.provideLiteralTranslation(
                translationText,
                originalLanguageCode
            );

            assertErrorAsExpected(
                result,
                new CannotAddDuplicateTranslationError(
                    new MultilingualTextItem({
                        text: translationText,
                        languageCode: originalLanguageCode,
                        role: MultilingualTextItemRole.literalTranslation,
                    }),
                    existingTermWithTextInOneLanguage.text
                )
            );
        });
    });
});
