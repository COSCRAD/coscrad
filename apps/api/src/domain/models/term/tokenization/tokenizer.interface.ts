import { LanguageCode } from '@coscrad/api-interfaces';

export type Token = {
    text: string;
    languageCode: LanguageCode;
    /**
     * Note that if `isSpace` and `isPunct` are false, the `symbols` array will
     * be a list of the atomic letters for the given alphabet, which may use
     * multiple unicode symbols to indicate one letter.
     */
    symbols?: string[];
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
