import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from './build-multilingual-text-with-single-item';

const dummyText = `foo, bar, baz, and such are not good variable names`;

describe(`buildMultilingualTextWithSingleItem`, () => {
    describe(`when all args are provided`, () => {
        it(`should return the expected result`, () => {
            const dummyLanguageCode = LanguageCode.Haida;

            const { items } = buildMultilingualTextWithSingleItem(dummyText, dummyLanguageCode);

            expect(items.length).toBe(1);

            const { languageCode, text, role } = items[0];

            expect(languageCode).toBe(dummyLanguageCode);

            expect(text).toBe(dummyText);

            expect(role).toBe(MultilingualTextItemRole.original);
        });
    });

    describe(`when the language code is omitted`, () => {
        it(`should default to English`, () => {
            const result = buildMultilingualTextWithSingleItem(dummyText);

            expect(result.items[0].languageCode).toBe(LanguageCode.English);
        });
    });
});
