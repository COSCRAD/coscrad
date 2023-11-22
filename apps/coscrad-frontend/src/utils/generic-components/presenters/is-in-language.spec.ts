import {
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { isInLanguage } from './is-in-language';

describe(`isInLanguage`, () => {
    const languageText = 'english text';

    const languageCodeForText = LanguageCode.English;

    const translationText = 'translation into Haida';

    const languageCodeForTranslation = LanguageCode.Haida;

    const languageTextItem: IMultilingualTextItem = {
        text: languageText,
        role: MultilingualTextItemRole.original,
        languageCode: languageCodeForText,
    };

    const translationTextItem: IMultilingualTextItem = {
        text: translationText,
        role: MultilingualTextItemRole.freeTranslation,
        languageCode: languageCodeForTranslation,
    };

    const multilingualText: IMultilingualText = {
        items: [languageTextItem],
    };

    const multilingualTextWithTranslation = {
        items: [languageTextItem, translationTextItem],
    };

    describe(`when there is only text in the language`, () => {
        it(`should find the text item`, () => {
            const result = multilingualText.items.find((item) =>
                isInLanguage(languageCodeForText, item)
            );

            const { languageCode, text } = result;

            expect(languageCode).toBe(languageCodeForText);

            expect(text).toBe(languageText);
        });
    });

    describe(`when there is also a translation`, () => {
        it(`should find the text item`, () => {
            const result = multilingualTextWithTranslation.items.find((item) =>
                isInLanguage(languageCodeForText, item)
            );

            const { languageCode, text } = result;

            expect(languageCode).toBe(languageCodeForText);

            expect(text).toBe(languageText);
        });

        it(`should find the translation text item`, () => {
            const result = multilingualTextWithTranslation.items.find((item) =>
                isInLanguage(languageCodeForTranslation, item)
            );

            const { languageCode, text } = result;

            expect(languageCode).toBe(languageCodeForTranslation);

            expect(text).toBe(translationText);
        });
    });

    /**
     * This is a system error as such a multilingual text would not satisfy
     * the invariants. But we test for this for completeness.
     */
    describe(`when there are no items`, () => {
        it(`should return undefined`, () => {
            const emptyMultiLingualText = { items: [] };

            const result = emptyMultiLingualText.items.find((item) =>
                isInLanguage(languageCodeForText, item)
            );

            expect(result).toBe(undefined);
        });
    });
});
