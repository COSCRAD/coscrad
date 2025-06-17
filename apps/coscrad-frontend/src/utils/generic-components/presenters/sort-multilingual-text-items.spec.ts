import { IMultilingualText, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { groupMultilingualTextItems } from './group-multilingual-text-items';

const originalText = 'original text';
const originalLanguageCode = LanguageCode.English;
const translationText = 'translated text';
const translationLanguageCode = LanguageCode.Chilcotin;

const englishItem = {
    text: originalText,
    languageCode: originalLanguageCode,
    role: MultilingualTextItemRole.original,
};

const chilcotinItem = {
    text: translationText,
    languageCode: translationLanguageCode,
    role: MultilingualTextItemRole.freeTranslation,
};

describe(`groupMultilingualTextItems`, () => {
    describe(`when there is a single, original item`, () => {
        it(`should return the expected result`, () => {
            const input: IMultilingualText = {
                items: [englishItem],
            };

            const { primaryMultilingualTextItem, translations } = groupMultilingualTextItems(
                input,
                originalLanguageCode
            );

            expect(primaryMultilingualTextItem.languageCode).toBe(originalLanguageCode);

            expect(primaryMultilingualTextItem.text).toBe(originalText);

            expect(primaryMultilingualTextItem.role).toBe(MultilingualTextItemRole.original);

            expect(translations).toEqual([]);
        });
    });

    describe(`when there are two text items`, () => {
        const input: IMultilingualText = {
            items: [englishItem, chilcotinItem],
        };

        describe(`when the original uses the default language code`, () => {
            const { primaryMultilingualTextItem, translations } = groupMultilingualTextItems(
                input,
                originalLanguageCode
            );

            it(`should return the expected result`, () => {
                expect(primaryMultilingualTextItem).toEqual(englishItem);

                expect(translations).toHaveLength(1);

                expect(translations[0]).toEqual(chilcotinItem);
            });
        });

        describe(`when the translation item uses the default language code`, () => {
            const { primaryMultilingualTextItem, translations } = groupMultilingualTextItems(
                input,
                translationLanguageCode
            );

            it(`should return the expected result`, () => {
                expect(primaryMultilingualTextItem).toEqual(chilcotinItem);

                expect(translations).toHaveLength(1);

                expect(translations[0]).toEqual(englishItem);
            });
        });

        describe(`when no item uses the default language code`, () => {
            const { primaryMultilingualTextItem, translations } = groupMultilingualTextItems(
                input,
                LanguageCode.French
            );

            it(`should fall back to the original item`, () => {
                expect(primaryMultilingualTextItem).toEqual(englishItem);

                expect(translations).toHaveLength(1);

                expect(translations[0]).toEqual(chilcotinItem);
            });
        });
    });

    describe(`when there are several text items`, () => {
        const input: IMultilingualText = {
            items: [
                englishItem,
                chilcotinItem,
                {
                    text: 'text for Haida',
                    languageCode: LanguageCode.Haida,
                    role: MultilingualTextItemRole.freeTranslation,
                },
                {
                    text: 'text for Chinook',
                    languageCode: LanguageCode.Chinook,
                    role: MultilingualTextItemRole.freeTranslation,
                },
            ],
        };

        it(`should return the expected result`, () => {
            const { primaryMultilingualTextItem, translations } = groupMultilingualTextItems(
                input,
                LanguageCode.English
            );

            expect(primaryMultilingualTextItem).toEqual(englishItem);

            expect(translations).toHaveLength(input.items.length - 1);

            const missingLanguages = translations.filter(
                ({ languageCode }) =>
                    ![LanguageCode.Chilcotin, LanguageCode.Haida, LanguageCode.Chinook].includes(
                        languageCode
                    )
            );

            expect(missingLanguages).toEqual([]);
        });
    });
});
