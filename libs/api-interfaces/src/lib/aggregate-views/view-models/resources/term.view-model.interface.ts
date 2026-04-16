import { IContributionSummary } from '../base.view-model.interface';
import { LanguageCode } from '../multilingual-text';
import { EdgeConnectionMemberRole, IEdgeConnectionContext } from '../note';
import { IMultilingualText, MultilingualTextItemRole } from './common';
import { ResourceCompositeIdentifier } from './resource-composite-identifier';
import { ResourceType } from './resource-type.enum';

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
        // we'll want this in the future
        // or should this be an `AudioViewForResource`?
        // audioUrl?: URL;
        text: string;
        // We don't support tokenization for all languages.
        tokens?: IToken[];
        languageCode: LanguageCode;
    };
    translations: Partial<
        Record<
            LanguageCode,
            Record<
                MultilingualTextItemRole,
                {
                    text: string;
                    // we'll want this in the future
                    // or should this be an `AudioViewForResource`?
                    // audioUrl?: URL;
                    tokens: IToken[];
                }
            >
        >
    >;
}

export interface INoteRecordForResource {
    id: string;
    context: IEdgeConnectionContext;
    // TODO make this `text`
    note: IMultilingualTextRecord;
}

export type MultilingualTextItemViewModel = {
    text: string;
    tokens: IToken[];
};

export type MultilingualTextWithAudioForSingleLanguage = {
    audioUrl?: string;
    original: MultilingualTextItemViewModel;
    translations: Record<
        Exclude<MultilingualTextItemRole, 'original'>,
        MultilingualTextItemViewModel
    >;
};

export type MultilingualTextWithAudio = Record<
    LanguageCode,
    MultilingualTextWithAudioForSingleLanguage
>;

export interface ITermViewModel {
    /**
     * This is an array because order is the primary identity. The items are
     * immutable once pushed. Additionoal items will be appended as commands
     * succeed.
     */
    contributions: IContributionSummary[];

    /**
     * Note that although we do not use dynamic command forms here, we might
     * want to keep this property to create dynamic tooltips using the schema
     * descriptions.
     * ```ts
     * const actions: Record<CommandType,ICommandFormAndLabels> = {};
     *
     * const  tooltiptext = actions[myCommandType].description; // or label
     * ```
     */
    // actions: ICommandFormAndLabels[];

    // Lookup table where the keys are note IDs
    notes: Record<string, INoteRecordForResource>;
    // end from base

    text: IMultilingualTextRecord;

    /**
     * This is duplicated because the front-end expects a "name"
     * property for standardized presentation in index and detail
     * presenters.
     */
    name: IMultilingualTextRecord;

    audioURL?: string; // removed - use `text.original.audioUrl`

    mediaItemId?: string; // do we need this?

    // mimeType?: MIMEType; Do we want this?

    // TODO put this on the base interface
    isPublished: boolean;

    // We store these as a lookup table by-ID for fine-grained composability
    vocabularyListsById: Record<string, IVocabularyListRecordForTerm>;

    /**
     * Note that what we ultimately want here is not just the composite identifier
     * of the connected resources, but all props for the corresponding view.
     * This view may be a different view that is used to populate thumbnail views.
     */
    connectionsByIdByType: Record<ResourceType, Record<string, IConnectedResourceRecord>>;
}
