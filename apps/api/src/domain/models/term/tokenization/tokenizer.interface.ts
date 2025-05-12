import { LanguageCode } from '@coscrad/api-interfaces';

/**
 * TODO[naming] This is tough to name. It's meant to be
 * either a (possibly length > 1) string of roman characters
 * that represents either one atomic letter in the target language
 * or punctuation or white space, or else an out-of-alphabet symbol (e.g. in a loan-word)
 *
 * `Character` would be find if it didn't overlap with a basic data type.
 * `Symbol` is also already taken.
 * `Letter` is not sufficient because we want to include out-of-alphabet symbols
 * and punctuation.
 */
export type AlphabetCharacters = {
    text: string;
    isPunctuationOrWhiteSpace: boolean;
    isOutOfAlphabet: boolean;
};

export type Token = {
    text: string;
    languageCode: LanguageCode;
    /**
     * Note that if `isSpace` and `isPunct` are false, the `symbols` array will
     * be a list of the atomic letters for the given alphabet, which may use
     * multiple unicode symbols to indicate one letter.
     */
    characters?: AlphabetCharacters[];
    /**
     * Eventually, we would like to move our NLP to spacy. We are staying
     * close to their API for that reason.
     */
    isSpace: boolean;
    isPunct: boolean;
    isStop: boolean;
};

export interface ITokenizer {
    /**
     * Do we want this to be async in case we reach out to Spacy out of
     * process in the future? Or will this be handled in a python
     * event handler that receives publications from a messaging queue?
     */
    tokenize(document: string): Token[];
}
