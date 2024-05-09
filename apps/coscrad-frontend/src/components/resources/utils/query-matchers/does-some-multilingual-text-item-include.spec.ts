import { IMultilingualText, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { doesSomeMultilingualTextItemInclude } from './does-some-multilingual-text-item-include';

describe(``, () => {
    describe(`when the multilingual text matches the search`, () => {
        const textToFind = 'Bears eat';

        it(`should return true`, () => {
            const multilingualText: IMultilingualText = {
                items: [
                    {
                        languageCode: LanguageCode.English,
                        text: `${textToFind} berries.`,
                        role: MultilingualTextItemRole.original,
                    },
                    {
                        languageCode: LanguageCode.Haida,
                        text: 'text in Haida',
                        role: MultilingualTextItemRole.freeTranslation,
                    },
                ],
            };

            const result = doesSomeMultilingualTextItemInclude(multilingualText, textToFind);

            expect(result).toBe(true);
        });
    });

    describe(`when the multilingual text does not match the search`, () => {
        const textToFind = 'Bears eat';

        it(`should return false`, () => {
            const multilingualText: IMultilingualText = {
                items: [
                    {
                        languageCode: LanguageCode.English,
                        text: `Deer drink water.`,
                        role: MultilingualTextItemRole.original,
                    },
                    {
                        languageCode: LanguageCode.Haida,
                        text: 'text in Haida',
                        role: MultilingualTextItemRole.freeTranslation,
                    },
                ],
            };

            const result = doesSomeMultilingualTextItemInclude(multilingualText, textToFind);

            expect(result).toBe(false);
        });
    });
});
