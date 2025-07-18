import { IBaseResourceViewModel } from '../base.view-model.interface';
import { LanguageCode } from '../multilingual-text';
import { IMultilingualText } from './common';

export interface IVocabularyListRecordForTerm {
    id: string;
    name: IMultilingualText;
    // TODO size
}

export interface IToken {
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

export interface ITermViewModel extends IBaseResourceViewModel {
    audioURL?: string;

    mediaItemId?: string;

    // mimeType?: MIMEType; Do we want this?

    sourceProject?: string;

    // TODO put this on the base interface
    isPublished: boolean;

    vocabularyLists: IVocabularyListRecordForTerm[];

    tokens: IToken[];

    possibleAudioFilenames: string[];
}
