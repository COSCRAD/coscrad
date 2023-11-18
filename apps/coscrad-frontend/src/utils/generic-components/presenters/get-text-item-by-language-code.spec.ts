import {
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { getTextItemByLanguageCode } from './get-text-item-by-language-code';

describe(`getTextItemByLanguageCode`, () => {
    const languageText = 'text in language';

    const languageTextLanguageCode = LanguageCode.Haida;

    const languageOriginalTextItem: IMultilingualTextItem = {
        text: languageText,
        role: MultilingualTextItemRole.original,
        languageCode: languageTextLanguageCode,
    };

    const translationTextItem: IMultilingualTextItem = {
        text: 'translation into English',
        role: MultilingualTextItemRole.glossedTo,
        languageCode: LanguageCode.English,
    };

    const multilingualText: IMultilingualText = {
        items: [languageOriginalTextItem],
    };

    const multilingualTextWithTranslation = {
        items: [languageOriginalTextItem, translationTextItem],
    };

    const multilingualTextWithLanguageTranslation = {
        items: [
            { ...languageOriginalTextItem, role: MultilingualTextItemRole.freeTranslation },
            { ...translationTextItem, role: MultilingualTextItemRole.original },
        ],
    };

    describe(`when there is only original text`, () => {
        it(`should find the language text item`, () => {
            const result = getTextItemByLanguageCode(multilingualText, languageTextLanguageCode);

            const { languageCode, text } = result;

            expect(languageCode).toBe(languageTextLanguageCode);

            expect(text).toBe(languageText);
        });
    });

    describe(`when there is also a translation into English`, () => {
        it(`should find the language text item`, () => {
            const result = getTextItemByLanguageCode(
                multilingualTextWithTranslation,
                languageTextLanguageCode
            );

            const { languageCode, text } = result;

            expect(languageCode).toBe(languageTextLanguageCode);

            expect(text).toBe(languageText);
        });
    });

    describe(`when there is an original english text`, () => {
        it(`should find the language text item translation`, () => {
            const result = getTextItemByLanguageCode(
                multilingualTextWithLanguageTranslation,
                languageTextLanguageCode
            );

            const { languageCode, text } = result;

            expect(languageCode).toBe(languageTextLanguageCode);

            expect(text).toBe(languageText);
        });
    });

    /**
     * This is a system error as such a multilingual text would not satisfy
     * the invariants. But we test for this for completeness.
     */
    describe(`when there are no items`, () => {
        it(`should find the text item`, () => {
            const result = getTextItemByLanguageCode(
                {
                    items: [],
                },
                languageTextLanguageCode
            );

            expect(result).toBe(undefined);
        });
    });
});
