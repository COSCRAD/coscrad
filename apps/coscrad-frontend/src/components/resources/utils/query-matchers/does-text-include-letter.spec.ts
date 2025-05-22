import {
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';

import { doesTextIncludeLetter } from './does-text-include-letter';

describe(`doesTextIncludeLetter`, () => {
    describe(`when the text includes the letter`, () => {
        it(`should return true`, () => {
            const letter = 'tl';

            const rawTextString = `de${letter}ɨg`;

            const text: IMultilingualTextItem = {
                text: rawTextString,
                languageCode: LanguageCode.Chilcotin,
                role: MultilingualTextItemRole.freeTranslation,
                tokens: ['d', 'e', letter, 'ɨ', 'g'].map((l) => ({
                    isSpace: false,
                    isPunct: false,
                    isStop: false,
                    languageCode: LanguageCode.Chilcotin,
                    text: l,
                })),
            };

            const result = doesTextIncludeLetter(text, letter);

            expect(result).toBe(true);
        });
    });

    describe(`when the text does not include the letter`, () => {
        it(`should return true`, () => {
            const letter = 'tl';

            const rawTextString = `bel`;

            const text: IMultilingualTextItem = {
                text: rawTextString,
                languageCode: LanguageCode.Chilcotin,
                role: MultilingualTextItemRole.freeTranslation,
                // TODO shouldn't this an array of words, each of which is an array of letters?
                tokens: ['b', 'e', 'l'].map((l) => ({
                    isSpace: false,
                    isPunct: false,
                    isStop: false,
                    languageCode: LanguageCode.Chilcotin,
                    text: l,
                })),
            };

            const result = doesTextIncludeLetter(text, letter);

            expect(result).toBe(false);
        });
    });
});
