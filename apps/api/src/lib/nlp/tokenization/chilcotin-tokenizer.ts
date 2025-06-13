import { LanguageCode } from '@coscrad/api-interfaces';
import { ITokenizer, Token } from '../interfaces/tokenizer.interface';
import { ChilcotinAlphabetParser } from './chilcotin-alphabet-parser';

/**
 * TODO Split this out into an `@coscrad/nlp` lib. This could potentially belong with
 * `MultilingualText`.
 */
export class ChilcotinTokenizer implements ITokenizer {
    private letterParser = new ChilcotinAlphabetParser();

    /**
     * TODO treat punctuation and stop words.
     * Currently, punctuation is simply returned as an "out-of-alphabet" symbol.
     */
    tokenize(document: string): Token[] {
        const rawTokens = document.split(' ');

        return rawTokens.map((text) => {
            const characters = this.letterParser.parse(text);

            return {
                text: characters.map(({ text }) => text).join(''),
                characters,
                languageCode: LanguageCode.Chilcotin,
                // TODO "zip" in the spaces
                isSpace: false,
                // TODO split out punctuation
                isPunct: false,
                // TODO accept stopwords via constructor?
                isStop: false,
            };
        });
    }

    standardize(input: string): string {
        /**
         * TODO Make tokenization "non-destructive" so that you can always
         * join the output.
         */
        return this.tokenize(input)
            .flatMap(({ characters }) =>
                characters.map(({ text: textForChar, isUpperCase }) =>
                    isUpperCase ? textForChar.toUpperCase() : textForChar
                )
            )
            .join('');
    }
}
