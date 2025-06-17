import { LanguageCode } from '@coscrad/api-interfaces';
import { ChilcotinTokenizer } from '../../../lib/nlp/tokenization/chilcotin-tokenizer';
import { buildMultilingualTextFromBilingualText } from '../build-multilingual-text-from-bilingual-text';
import { deepStandardizeMultilingualText } from './deep-standardize-multilingual-text';
import { MultilingualText } from './multilingual-text';

const standardizerProvider = {
    has(_l: LanguageCode) {
        return true;
    },
    forLanguage(languageCode: LanguageCode) {
        if (languageCode === LanguageCode.Chilcotin) {
            return new ChilcotinTokenizer();
        }

        return {
            standardize(input: string) {
                return input;
            },
        };
    },
};

const textThatIsAlreadyOk = 'good';

const languageCodeForOkText = LanguageCode.English;

const textThatShouldBeStandardized = 'swzSWZ'
    .split('')
    .map((c) => `${c}${String.fromCodePoint(770)}`)
    .join('');

const languageCodeForReplacements = LanguageCode.Chilcotin;

const expectedStandardizationResult = '\u015d\u0175\u1e91\u015c\u0174\u1e90';

const existingMultilngualText = buildMultilingualTextFromBilingualText(
    {
        text: textThatIsAlreadyOk,
        languageCode: languageCodeForOkText,
    },
    {
        text: textThatShouldBeStandardized,
        languageCode: languageCodeForReplacements,
    }
);

const expectedUpdatedMultilingualText = buildMultilingualTextFromBilingualText(
    {
        text: textThatIsAlreadyOk,
        languageCode: languageCodeForOkText,
    },
    {
        text: expectedStandardizationResult,
        languageCode: languageCodeForReplacements,
    }
);

describe(`deepStandardizeMultilingualText`, () => {
    describe(`when some of the text items require standardization and some do not`, () => {
        class Widget {
            id: string;

            name: MultilingualText;

            aliases?: MultilingualText[];

            constructor(id: string, name: MultilingualText, items?: MultilingualText[]) {
                this.id = id;

                this.name = name;

                if (Array.isArray(items)) {
                    this.aliases = items;
                }
            }
        }

        describe(`when there is a top-level multilingual text property`, () => {
            it(`should return an the updated text`, () => {
                const modelWithMultilingualText = new Widget('123', existingMultilngualText);

                const result = deepStandardizeMultilingualText(
                    standardizerProvider,
                    modelWithMultilingualText
                );

                const { id, name: updatedMultilingualTextProperty } = result;

                expect(updatedMultilingualTextProperty.toDTO()).toEqual(
                    expectedUpdatedMultilingualText.toDTO()
                );

                expect(id).toBe(modelWithMultilingualText.id);
            });
        });

        describe(`when there is a nested, array of multilingual text`, () => {
            it(`should return the updated text`, () => {
                const modelWithMultilingualText = new Widget('456', existingMultilngualText, [
                    existingMultilngualText,
                ]);

                const result = deepStandardizeMultilingualText(
                    standardizerProvider,
                    modelWithMultilingualText
                );

                const { aliases } = result;

                const updatedMultilingualTextProperty = aliases[0];

                expect(updatedMultilingualTextProperty.toDTO()).toEqual(
                    expectedUpdatedMultilingualText.toDTO()
                );
            });
        });
    });
});
