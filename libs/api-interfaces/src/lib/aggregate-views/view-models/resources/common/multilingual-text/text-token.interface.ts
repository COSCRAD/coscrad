import { LanguageCode } from '../../../multilingual-text/language-code.enum';

export interface ITextToken {
    text: string;
    languageCode: LanguageCode;
    /**
     * Note that if `isSpace` and `isPunct` are false, the `symbols` array will
     * be a list of the atomic letters for the given alphabet, which may use
     * multiple unicode symbols to indicate one letter.
     */
    characters?: {
        text: string;
        isPunctuationOrWhiteSpace: boolean;
        isOutOfAlphabet: boolean;
    }[];
    /**
     * Eventually, we would like to move our NLP to spacy. We are staying
     * close to their API for that reason.
     */
    isSpace: boolean;
    isPunct: boolean;
    isStop: boolean;
}
