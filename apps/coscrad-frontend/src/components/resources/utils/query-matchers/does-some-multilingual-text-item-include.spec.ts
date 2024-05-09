import { IMultilingualText, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { doesSomeMultilingualTextItemInclude } from './does-some-multilingual-text-item-include';

describe(``, () => {
    const textToFind = 'Bears eat';

    describe(`when the search is language indpenendent`, () => {
        describe(`when the multilingual text matches the search`, () => {
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

    describe(`when the search is for a specific language`, () => {
        const languageCode = LanguageCode.Haida;

        describe(`when the search text is included in a different language only`, () => {
            it(`should return false`, () => {
                const result = doesSomeMultilingualTextItemInclude(
                    {
                        items: [
                            {
                                languageCode,
                                text: 'not what you are looking for',
                                role: MultilingualTextItemRole.original,
                            },
                            {
                                text: `${textToFind} berries all day!`,
                                languageCode: LanguageCode.English,
                                role: MultilingualTextItemRole.freeTranslation,
                            },
                        ],
                    },
                    `{hai}:${textToFind}`
                );

                expect(result).toBe(false);
            });
        });

        describe(`when the search text is included for the given language`, () => {
            it(`should return true`, () => {
                const result = doesSomeMultilingualTextItemInclude(
                    {
                        items: [
                            {
                                languageCode: LanguageCode.English,
                                text: 'not what you are looking for',
                                role: MultilingualTextItemRole.original,
                            },
                            {
                                text: `${textToFind} berries all day!`,
                                languageCode,
                                role: MultilingualTextItemRole.freeTranslation,
                            },
                        ],
                    },
                    `{hai}:${textToFind}`
                );

                expect(result).toBe(true);
            });
        });
    });
});
