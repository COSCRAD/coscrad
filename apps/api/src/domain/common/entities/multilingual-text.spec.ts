import { LanguageCode } from '@coscrad/api-interfaces';
import { ChilcotinTokenizer } from '../../../lib/nlp/tokenization';
import { buildMultilingualTextFromBilingualText } from '../build-multilingual-text-from-bilingual-text';

const standardizerProvider = {
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

describe(`MultilingualText`, () => {
    describe(`standardize`, () => {
        describe(`when a standardizer with non-trivial replacements for some languages is provided`, () => {
            it(`should make the expected replacements`, () => {
                const textThatIsAlreadyOk = 'good';

                const languageCodeForOkText = LanguageCode.English;

                const textThatShouldBeStandardized = 'swzSWZ'
                    .split('')
                    .map((c) => `${c}${String.fromCodePoint(770)}`)
                    .join('');

                const languageCodeForReplacements = LanguageCode.Chilcotin;

                const expectedStandardizationResult = '\u015d\u0175\u1e91\u015c\u0174\u1e90';

                const multilngualText = buildMultilingualTextFromBilingualText(
                    {
                        text: textThatIsAlreadyOk,
                        languageCode: languageCodeForOkText,
                    },
                    {
                        text: textThatShouldBeStandardized,
                        languageCode: languageCodeForReplacements,
                    }
                );

                const result = multilngualText.standardize(standardizerProvider);

                expect(result.toDTO()).toEqual(
                    buildMultilingualTextFromBilingualText(
                        {
                            text: textThatIsAlreadyOk,
                            languageCode: languageCodeForOkText,
                        },
                        {
                            text: expectedStandardizationResult,
                            languageCode: languageCodeForReplacements,
                        }
                    ).toDTO()
                );
            });
        });
    });
});
