import { LanguageCode } from '@coscrad/api-interfaces';
import { ChilcotinAlphabetParser } from './chilcotin-alphabet-parser';
import { ITokenizer, Token } from './tokenizer.interface';

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
            // TODO handle capitalization
            const lowerCaseText = text.toLowerCase();

            const characters = this.letterParser.parse(lowerCaseText);

            return {
                text,
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
}
