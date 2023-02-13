import { IMultiLingualText, LanguageCode, MultiLingualTextItemRole } from '@coscrad/api-interfaces';
import { PayloadAction } from '@reduxjs/toolkit';

import { multilingualTextFormReducer } from './multilingual-text-form-reducer';
import { updateItemRole } from './update-item-role';
import { updateItemText } from './update-item-text';

type TestCase = {
    description: string;
    initialState: IMultiLingualText;
    action: PayloadAction<unknown>;
    expectedUpdatedState: IMultiLingualText;
};

const emptyInitialState: IMultiLingualText = {
    items: [],
};

const testCases: TestCase[] = [
    {
        description: `when adding text for the first time`,
        initialState: emptyInitialState,
        action: updateItemText(LanguageCode.haida, `Haida text`),
        expectedUpdatedState: {
            items: [
                {
                    languageId: LanguageCode.haida,
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
                    languageId: LanguageCode.haida,
                    text: `Haida text`,
                    role: null,
                },
            ],
        },
        action: updateItemRole(LanguageCode.haida, MultiLingualTextItemRole.original),
        expectedUpdatedState: {
            items: [
                {
                    languageId: LanguageCode.haida,
                    text: `Haida text`,
                    role: MultiLingualTextItemRole.original,
                },
            ],
        },
    },
    {
        description: `when adding a role for the first time for a new item`,
        initialState: emptyInitialState,
        action: updateItemRole(LanguageCode.english, MultiLingualTextItemRole.freeTranslation),
        expectedUpdatedState: {
            items: [
                {
                    languageId: LanguageCode.english,
                    text: null,
                    role: MultiLingualTextItemRole.freeTranslation,
                },
            ],
        },
    },
    {
        description: `when adding text for the first time to an item with existing role`,
        initialState: {
            items: [
                {
                    languageId: LanguageCode.haida,
                    text: null,
                    role: MultiLingualTextItemRole.original,
                },
            ],
        },
        action: updateItemText(LanguageCode.haida, `Haida text`),
        expectedUpdatedState: {
            items: [
                {
                    languageId: LanguageCode.haida,
                    text: `Haida text`,
                    role: MultiLingualTextItemRole.original,
                },
            ],
        },
    },
    {
        description: `when adding a translation for the first time`,
        initialState: {
            items: [
                {
                    languageId: LanguageCode.haida,
                    text: `Haida text`,
                    role: MultiLingualTextItemRole.original,
                },
            ],
        },
        action: updateItemText(LanguageCode.english, `English translation text`),
        expectedUpdatedState: {
            items: [
                {
                    languageId: LanguageCode.haida,
                    text: `Haida text`,
                    role: MultiLingualTextItemRole.original,
                },
                {
                    languageId: LanguageCode.english,
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
                    languageId: LanguageCode.haida,
                    text: `Haida text`,
                    role: MultiLingualTextItemRole.original,
                },
                {
                    languageId: LanguageCode.english,
                    text: `English translation text`,
                    role: MultiLingualTextItemRole.freeTranslation,
                },
            ],
        },
        action: updateItemText(LanguageCode.english, `New English translation text`),
        expectedUpdatedState: {
            items: [
                {
                    languageId: LanguageCode.haida,
                    text: `Haida text`,
                    role: MultiLingualTextItemRole.original,
                },
                {
                    languageId: LanguageCode.english,
                    text: `New English translation text`,
                    role: MultiLingualTextItemRole.freeTranslation,
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
