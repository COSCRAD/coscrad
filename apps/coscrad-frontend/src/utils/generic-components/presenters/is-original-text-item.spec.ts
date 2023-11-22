import {
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { isOriginalTextItem } from './is-original-text-item';

describe(`isOriginalTextItem`, () => {
    const originalText = 'original text';

    const originalItemLanguageCode = LanguageCode.English;

    const originalTextItem: IMultilingualTextItem = {
        text: originalText,
        role: MultilingualTextItemRole.original,
        languageCode: originalItemLanguageCode,
    };

    const translationTextItem: IMultilingualTextItem = {
        text: 'translation into Haida',
        role: MultilingualTextItemRole.freeTranslation,
        languageCode: LanguageCode.Haida,
    };

    const multilingualText: IMultilingualText = {
        items: [originalTextItem],
    };

    const multilingualTextWithTranslation = {
        items: [originalTextItem, translationTextItem],
    };

    describe(`when there is only original text`, () => {
        it(`should find the text item`, () => {
            const result = multilingualText.items.find((item) => isOriginalTextItem(item));

            const { languageCode, text } = result;

            expect(languageCode).toBe(originalItemLanguageCode);

            expect(text).toBe(originalText);
        });
    });

    describe(`when there is also a translation`, () => {
        it(`should find the text item`, () => {
            const result = multilingualTextWithTranslation.items.find((item) =>
                isOriginalTextItem(item)
            );

            const { languageCode, text } = result;

            expect(languageCode).toBe(originalItemLanguageCode);

            expect(text).toBe(originalText);
        });
    });

    /**
     * This is a system error as such a multilingual text would not satisfy
     * the invariants. But we test for this for completeness.
     */
    describe(`when there are no items`, () => {
        it(`should return undefined`, () => {
            const emptyMultiLingualText = { items: [] };

            const result = emptyMultiLingualText.items.find((item) => isOriginalTextItem(item));

            expect(result).toBe(undefined);
        });
    });
});
