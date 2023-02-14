import { IMultilingualText, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { PayloadAction } from '@reduxjs/toolkit';

import { multilingualTextFormReducer } from './multilingual-text-form-reducer';
import { updateItemRole } from './update-item-role';
import { updateItemText } from './update-item-text';

type TestCase = {
    description: string;
    initialState: IMultilingualText;
    action: PayloadAction<unknown>;
    expectedUpdatedState: IMultilingualText;
};

const emptyInitialState: IMultilingualText = {
    items: [],
};

const testCases: TestCase[] = [
    {
        description: `when adding text for the first time`,
        initialState: emptyInitialState,
        action: updateItemText(LanguageCode.Haida, `Haida text`),
        expectedUpdatedState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: null,
                },
            ],
        },
    },
    {
        description: `when adding a role for the first time to an item with existing text`,
        initialState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: null,
                },
            ],
        },
        action: updateItemRole(LanguageCode.Haida, MultilingualTextItemRole.original),
        expectedUpdatedState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
    },
    {
        description: `when adding a role for the first time for a new item`,
        initialState: emptyInitialState,
        action: updateItemRole(LanguageCode.English, MultilingualTextItemRole.freeTranslation),
        expectedUpdatedState: {
            items: [
                {
                    languageCode: LanguageCode.English,
                    text: null,
                    role: MultilingualTextItemRole.freeTranslation,
                },
            ],
        },
    },
    {
        description: `when adding text for the first time to an item with existing role`,
        initialState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: null,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
        action: updateItemText(LanguageCode.Haida, `Haida text`),
        expectedUpdatedState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
    },
    {
        description: `when adding a translation for the first time`,
        initialState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
        action: updateItemText(LanguageCode.English, `English translation text`),
        expectedUpdatedState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: MultilingualTextItemRole.original,
                },
                {
                    languageCode: LanguageCode.English,
                    text: `English translation text`,
                    role: null,
                },
            ],
        },
    },
    {
        description: `when updating an existing translation`,
        initialState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: MultilingualTextItemRole.original,
                },
                {
                    languageCode: LanguageCode.English,
                    text: `English translation text`,
                    role: MultilingualTextItemRole.freeTranslation,
                },
            ],
        },
        action: updateItemText(LanguageCode.English, `New English translation text`),
        expectedUpdatedState: {
            items: [
                {
                    languageCode: LanguageCode.Haida,
                    text: `Haida text`,
                    role: MultilingualTextItemRole.original,
                },
                {
                    languageCode: LanguageCode.English,
                    text: `New English translation text`,
                    role: MultilingualTextItemRole.freeTranslation,
                },
            ],
        },
    },
];

describe('multilignualTextFormReducer', () => {
    testCases.forEach(({ description, initialState, action, expectedUpdatedState }) => {
        describe(description, () => {
            it('should return the expected result', () => {
                const result = multilingualTextFormReducer(initialState, action);

                expect(result).toEqual(expectedUpdatedState);
            });
        });
    });
});
