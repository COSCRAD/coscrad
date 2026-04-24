import { IContributionSummary } from '../base.view-model.interface';
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

/**
 * TODO At some point we may want to leverage the Config on the back-end
 * to write info about the primary and secondary text so that less work
 * needs to be done on the client.
 */
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

export interface ITermViewModel {
    id: string;

    name: IMultilingualTextRecord;

    /**
     * These were originally on the base. Eventually, we can leverage a base
     * model that uses composable state, i.e., records by ID instead of arrays
     * for nested entities.
     */
    contributions: IContributionSummary[];

    /**
     * Terms do not leverage a dynamic command form for an admin UX.
     */
    // actions: ICommandFormAndLabels[];

    // Lookup table where the keys are note IDs
    notes: Record<string, INoteRecordForResource>;

    /**
     * What we want to do in the long run is to put the audio alongside the
     * corresponding text in a `MultilingualAudioText` item.
     */
    audioURL?: string;

    mediaItemId?: string;

    // mimeType?: MIMEType; Do we want this?

    // TODO put this on the base interface
    isPublished: boolean;

    vocabularyListsById: Record<string, IVocabularyListRecordForTerm>;

    /**
     * In the future, this should be nested on a `MultilingaulAudioText` property
     * with the raw text \ langauge code.
     */
    tokens: IToken[];

    connectionsById: Record<string, IConnectedResourceRecord>;
}
