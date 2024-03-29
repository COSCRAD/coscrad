import {
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { findOriginalTextItem } from './find-original-text-item';

describe(`findOriginalTextItem`, () => {
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

    describe(`when there is only original text`, () => {
        it(`should find the text item`, () => {
            const result = findOriginalTextItem({
                items: [originalTextItem],
            });

            const { languageCode, text } = result;

            expect(languageCode).toBe(originalItemLanguageCode);

            expect(text).toBe(originalText);
        });
    });

    describe(`when there is also a translation`, () => {
        it(`should find the text item`, () => {
            const result = findOriginalTextItem({
                items: [originalTextItem, translationTextItem],
            });

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
        it(`should find the text item`, () => {
            const result = findOriginalTextItem({
                items: [],
            });

            expect(result).toBe(undefined);
        });
    });
});
