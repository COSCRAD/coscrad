import { Token } from '../types/tokenizer.dto';

export interface ITokenizer {
    /**
     * Do we want this to be async in case we reach out to Spacy out of
     * process in the future? Or will this be handled in a python
     * event handler that receives publications from a messaging queue?
     */
    tokenize(document: string): Token[];
}
