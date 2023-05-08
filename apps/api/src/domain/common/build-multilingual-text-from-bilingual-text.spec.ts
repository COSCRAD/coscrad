import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import {
    buildMultilingualTextFromBilingualText,
    InvalidBilingualTextException,
    TextAndLanguageCode,
} from './build-multilingual-text-from-bilingual-text';
import { MultilingualText, MultilingualTextItem } from './entities/multilingual-text';

type TestCase = {
    description: string;
    primary: TextAndLanguageCode;
    secondary: TextAndLanguageCode;
    expectedOutput: MultilingualText;
};

const primaryText = `Primary Text`;
const secondaryText = `Secondary Text`;

const primaryLanguageCode = LanguageCode.Haida;

const secondaryLanguageCode = LanguageCode.English;

const primary: TextAndLanguageCode = {
    text: primaryText,
    languageCode: primaryLanguageCode,
};

const secondary: TextAndLanguageCode = {
    text: secondaryText,
    languageCode: secondaryLanguageCode,
};

const testCases: TestCase[] = [
    {
        description: `when both properties are defined`,
        primary,
        secondary,
        expectedOutput: new MultilingualText({
            items: [
                new MultilingualTextItem({
                    text: primaryText,
                    languageCode: primaryLanguageCode,
                    role: MultilingualTextItemRole.original,
                }),
                new MultilingualTextItem({
                    text: secondaryText,
                    languageCode: secondaryLanguageCode,
                    role: MultilingualTextItemRole.freeTranslation,
                }),
            ],
        }),
    },
    {
        description: `when only the primary is defined`,
        primary,
        secondary: {
            text: undefined,
            languageCode: secondaryLanguageCode,
        },
        expectedOutput: new MultilingualText({
            items: [
                new MultilingualTextItem({
                    text: primaryText,
                    languageCode: primaryLanguageCode,
                    role: MultilingualTextItemRole.original,
                }),
            ],
        }),
    },
    {
        description: `when only the secondary is defined`,
        primary: {
            text: undefined,
            languageCode: primaryLanguageCode,
        },
        secondary,
        expectedOutput: new MultilingualText({
            items: [
                new MultilingualTextItem({
                    text: secondaryText,
                    languageCode: secondaryLanguageCode,
                    role: MultilingualTextItemRole.original,
                }),
            ],
        }),
    },
];

const act = (primary: TextAndLanguageCode, secondary: TextAndLanguageCode) =>
    buildMultilingualTextFromBilingualText(primary, secondary);

describe(`buildMultilingualTextFromBilingualText`, () => {
    describe(`when both primary and secondary items are omitted`, () => {
        it(`should throw`, () => {
            expect(() =>
                act(
                    {
                        text: undefined,
                        languageCode: primaryLanguageCode,
                    },
                    {
                        text: undefined,
                        languageCode: secondaryLanguageCode,
                    }
                )
            ).toThrowError(new InvalidBilingualTextException());
        });
    });

    testCases.forEach(({ description, primary, secondary, expectedOutput }) => {
        describe(description, () => {
            it(`should return the expected result`, () => {
                const result = act(primary, secondary);

                expect(result.toDTO()).toEqual(expectedOutput.toDTO());
            });
        });
    });
});
