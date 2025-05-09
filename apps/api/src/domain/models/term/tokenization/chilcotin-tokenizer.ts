import { LanguageCode } from '@coscrad/api-interfaces';
import { ChilcotinAlphabetParser } from './ChilcotinAlphabetParser';
import { ITokenizer, Token } from './tokenizer.interface';

export class ChilcotinTokenizer implements ITokenizer {
    private letterParser = new ChilcotinAlphabetParser();

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
