import {
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { getTextItemsNotInLanguage } from './get-text-items-not-in-language';

describe(`getTextItemsNotInLanguage`, () => {
    const languageText = 'text in language';

    const languageTextLanguageCode = LanguageCode.Haida;

    const englishTranslationText = 'translation into English';

    const languageOriginalTextItem: IMultilingualTextItem = {
        text: languageText,
        role: MultilingualTextItemRole.original,
        languageCode: languageTextLanguageCode,
    };

    const translationTextItem: IMultilingualTextItem = {
        text: englishTranslationText,
        role: MultilingualTextItemRole.glossedTo,
        languageCode: LanguageCode.English,
    };

    const multilingualText: IMultilingualText = {
        items: [languageOriginalTextItem],
    };

    const multilingualTextWithTranslation = {
        items: [languageOriginalTextItem, translationTextItem],
    };

    const englishMultilingualTextWithLanguageTranslation = {
        items: [
            { ...languageOriginalTextItem, role: MultilingualTextItemRole.freeTranslation },
            { ...translationTextItem, role: MultilingualTextItemRole.original },
        ],
    };

    describe(`when there is only original text`, () => {
        it(`should not find items not in language`, () => {
            const results = getTextItemsNotInLanguage(multilingualText, languageTextLanguageCode);

            expect(results.length).toBe(0);
        });
    });

    describe(`when there is also a translation into English`, () => {
        it(`should find the English text item`, () => {
            const results = getTextItemsNotInLanguage(
                multilingualTextWithTranslation,
                languageTextLanguageCode
            );

            const englishTextItem = results.find(
                ({ languageCode }) => languageCode === LanguageCode.English
            );

            const { text } = englishTextItem;

            expect(text).toBe(englishTranslationText);
        });

        it('should not find the original item', () => {
            const results = getTextItemsNotInLanguage(
                multilingualTextWithTranslation,
                languageTextLanguageCode
            );

            const originalTextItem = results.find(
                ({ role }) => role === MultilingualTextItemRole.original
            );

            console.log({ originalTextItem });

            expect(originalTextItem).toBe(undefined);
        });
    });

    describe(`when there is an original english text`, () => {
        it(`should find the language text item translation`, () => {
            const results = getTextItemsNotInLanguage(
                englishMultilingualTextWithLanguageTranslation,
                LanguageCode.English
            );

            const languageTextItem = results.find(
                ({ languageCode }) => languageCode === languageTextLanguageCode
            );

            expect(languageTextItem).not.toBe(undefined);

            const { languageCode, text } = languageTextItem;

            expect(languageCode).toBe(languageTextLanguageCode);

            expect(text).toBe(languageText);
        });
    });

    /**
     * This is a system error as such a multilingual text would not satisfy
     * the invariants. But we test for this for completeness.
     */
    describe(`when there are no items`, () => {
        it(`should not find any text items`, () => {
            const results = getTextItemsNotInLanguage(
                {
                    items: [],
                },
                languageTextLanguageCode
            );

            expect(results.length).toBe(0);
        });
    });
});
