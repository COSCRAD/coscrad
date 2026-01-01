import { IBaseResourceViewModel } from '../base.view-model.interface';
import { LanguageCode } from '../multilingual-text';
import { EdgeConnectionMemberRole, IEdgeConnectionContext } from '../note';
import { IMultilingualText } from './common';
import { ResourceCompositeIdentifier } from './resource-composite-identifier';

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

type IConnectedResourceRecord = {
    id: string;

    note: IMultilingualText;

    selfContext: IEdgeConnectionContext;

    otherCompositeIdentifier: ResourceCompositeIdentifier;

    otherContext: IEdgeConnectionContext;

    role: typeof EdgeConnectionMemberRole.to | typeof EdgeConnectionMemberRole.from;
};

export interface IMultilingualTextRecord {
    original: {
        text: string;
        languageCode: LanguageCode;
    };
    translations: Partial<
        Record<
            LanguageCode,
            {
                free?: string;
                literal?: string;
                // gloss?: string;
            }
        >
    >;
}

export interface INoteRecordForResource {
    id: string;
    context: IEdgeConnectionContext;
    // TODO make this `text`
    note: IMultilingualTextRecord;
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

    connections: IConnectedResourceRecord[];
}
