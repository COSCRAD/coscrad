import {
    AggregateType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { DetailScopedCommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { ICoscradEvent } from '../../../domain/common';
import { buildMultilingualTextFromBilingualText } from '../../../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import {
    PromptTermCreated,
    TermCreated,
    TermTranslated,
} from '../../../domain/models/term/commands';
import { ContributionSummary } from '../../../domain/models/user-management/contributor/views';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Token } from '../../../lib/nlp/tokenization';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { ConnectionRecordForResourceViewModel } from './connection-record-for-resource.view-model';
import { NoteRecordForResourceViewModel } from './note-record-for-resource.view-model';
import { EventSourcedTagViewModel } from './tag.view-model.event-sourced';

export class VocabularyListRecordForTerm {
    @UUID({
        label: 'vocabulary list ID',
        description: 'system identifier for this vocabulary list',
    })
    id: AggregateId;

    @NestedDataType(MultilingualText, {
        label: 'vocabulary list name',
        description: 'name of this vocabulary list (including translations thereof)',
    })
    name: MultilingualText;

    constructor({ id, name }: DTO<VocabularyListRecordForTerm>) {
        this.id = id;

        this.name = new MultilingualText(name);
    }

    public static fromDto(dto: DTO<VocabularyListRecordForTerm>) {
        return new VocabularyListRecordForTerm(dto);
    }
}

/**
 * This is the first view model leveraging a new approach that involves denormalized,
 * event-sourced, materialized views.
 */
@CoscradDataExample<TermViewModel>({
    example: {
        type: AggregateType.term,
        id: buildDummyUuid(1),
        isPublished: true,
        accessControlList: new AccessControlList().toDTO(),
        actions: [],
        name: buildMultilingualTextFromBilingualText(
            {
                text: 'term (in the language)',
                languageCode: LanguageCode.Chilcotin,
            },
            {
                text: 'term (in English)',
                languageCode: LanguageCode.English,
            }
        ),
        contributions: [],
        tags: [],
        notes: [],
        connections: [],
        vocabularyLists: [],
        tokens: [],
        possibleAudioFilenames: [],
    },
})
export class TermViewModel implements HasAggregateId, DetailScopedCommandWriteContext {
    // extends BaseEventSourcedResourceViewModel {
    readonly type = ResourceType.term;

    /**
     * TODO extend base
     */
    @UUID({
        label: 'id',
        description: 'system identifier for this resource',
    })
    id: AggregateId;

    @NestedDataType(MultilingualText, {
        label: 'name',
        // note that we call it `name` not `text` for consistency with other models
        description: 'name (text) includes the text as well as any translations for this term',
    })
    name: MultilingualText;

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this resource available to the public',
    })
    isPublished: boolean;

    accessControlList: AccessControlList;

    @NestedDataType(ContributionSummary, {
        label: 'contributions',
        description: 'a list of all contributions to the development of this resource',
        // Can't we get this from reflection?
        isArray: true,
    })
    contributions: ContributionSummary[];

    @NestedDataType(EventSourcedTagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    @NestedDataType(NoteRecordForResourceViewModel, {
        label: 'notes',
        description: 'a list of contextualized notes about this resource',
        isArray: true,
    })
    notes: NoteRecordForResourceViewModel[];

    @NestedDataType(ConnectionRecordForResourceViewModel, {
        label: 'connections',
        description: 'a list of contextualized connections to other resources about with a note',
        isArray: true,
    })
    connections: ConnectionRecordForResourceViewModel[];
    // end TODO extend base
    /**
     * TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-300]
     * We really want to have a full nested view of the multilingual audio,
     * including one media item id per language. At very least, we should
     * rename this property `mediaItemIdForAudio`.
     */
    @ReferenceTo(AggregateType.mediaItem)
    mediaItemId?: string;

    // TODO update the api interfaces
    @ReferenceTo(AggregateType.mediaItem)
    mediaItemIdForPhotograph?: string;

    @ReferenceTo(AggregateType.mediaItem)
    mediaItemIdForVideo?: string;

    @NestedDataType(VocabularyListRecordForTerm, {
        label: 'vocabulary lists including this term',
        description: 'a list of all the vocabulary lists that contain this term as an entry',
        isArray: true,
    })
    vocabularyLists: VocabularyListRecordForTerm[];

    // TODO remove this in favor of `getAvailableActions()`
    actions: string[];

    @NestedDataType(Token, {
        label: 'tokens',
        description:
            'a list of the individual tokens (pre-processed words) in this term, including a letter-by-letter breakdown',
        isArray: true,
    })
    tokens: Token[];

    // TODO remove this when returning general queries?
    possibleAudioFilenames: string[];

    constructor(dto: DTO<TermViewModel>) {
        const {
            actions,
            mediaItemId,
            mediaItemIdForPhotograph,
            mediaItemIdForVideo,
            vocabularyLists,
            tokens,
            possibleAudioFilenames: possibleAudioFilenames,
        } = dto;

        // TODO extend base
        // super(dto);
        const {
            contributions,
            name,
            id,
            accessControlList,
            tags,
            isPublished,
            notes,
            connections,
        } = dto;

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText({
                ...name,
                items: name.items.map((item) => {
                    if (item.languageCode !== LanguageCode.Chilcotin) {
                        return item;
                    }

                    const defaultCharacterReplacements = {
                        // (U+0073) - ◌̂ (U+0302)[
                        // ŝ
                        [`s${`\u0302`}`]: '\u015d',
                        // Ŝ
                        [`S${`\u0302`}`]: '\u015c',
                        // ŵ
                        [`w${`\u0302`}`]: '\u0175',
                        // Ŵ
                        [`W${`\u0302`}`]: '\u0174',
                        // ẑ:
                        [`z${`\u0302`}`]: '\u1e91',
                        // Ẑ
                        [`Z${`\u0302`}`]: '\u1e91',
                    };

                    Object.entries(defaultCharacterReplacements).reduce(
                        (updatedText, [twoCharSequenceWithLoneSurrogate, singleUnicodeChar]) =>
                            updatedText.replace(
                                twoCharSequenceWithLoneSurrogate,
                                singleUnicodeChar
                            ),
                        item.text
                    );

                    return item;
                }),
            });
        }

        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.accessControlList = new AccessControlList(accessControlList);

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];

        if (Array.isArray(notes))
            this.notes = notes.map((n) => NoteRecordForResourceViewModel.fromDto(n));

        if (Array.isArray(connections))
            this.connections = connections.map((n) =>
                ConnectionRecordForResourceViewModel.fromDto(n)
            );
        // end TODO extend base

        this.possibleAudioFilenames = Array.isArray(possibleAudioFilenames)
            ? possibleAudioFilenames
            : [];

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        this.actions = actions;

        if (!isNullOrUndefined(mediaItemId)) {
            this.mediaItemId = mediaItemId;
        }

        if (!isNullOrUndefined(mediaItemIdForPhotograph)) {
            this.mediaItemIdForPhotograph = mediaItemIdForPhotograph;
        }

        if (!isNullOrUndefined(mediaItemIdForVideo)) {
            this.mediaItemIdForVideo = mediaItemIdForVideo;
        }

        this.actions = actions;

        this.vocabularyLists = Array.isArray(vocabularyLists)
            ? vocabularyLists.map((vocabularyListDto) => {
                  return new VocabularyListRecordForTerm(vocabularyListDto);
              })
            : [];

        this.tokens = Array.isArray(tokens) ? tokens : [];
    }

    static fromTermCreated({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: termId },
        },
        meta: { contributorIds },
    }: TermCreated): TermViewModel {
        const term = new TermViewModel({
            type: AggregateType.term,
            id: termId,
            isPublished: false,
            accessControlList: new AccessControlList(),
            actions: [], // TODO build all actions
            tags: [], // none yet
            /**
             * Note that this must be written in the DB by the event-handler, as
             * we do not have access to the contributors in this scope.
             */
            contributions: [],
            vocabularyLists: [], // none yet
            name: buildMultilingualTextWithSingleItem(text, languageCode),
            notes: [], // none at creation
            connections: [],
            tokens: [], // appended externally
            possibleAudioFilenames: [],
        });

        term.name = buildMultilingualTextWithSingleItem(text, languageCode);

        term.id = termId;

        term.actions = []; // TODO build all actions here

        /**
         * Note that this must be written in the DB by the event-handler, as
         * we do not have access to the contributors in this scope.
         */
        term.contributions = [];

        /**
         * The contributor should have access.
         */
        term.accessControlList = new AccessControlList().allowUsers(contributorIds);

        // term.notes = []; // there are no notes when the term is first created

        // term.tags = []; // there are no tags with the term is first created

        // set term.events here by applying the first event

        term.isPublished = false;

        term.actions = [
            'TRANSLATE_TERM',
            'PUBLISH_RESOURCE',
            'ADD_AUDIO_FOR_TERM',
            'TAG_RESOURCE',
            'CONNECT_RESOURCES_WITH_NOTE',
            'CREATE_NOTE_ABOUT_RESOURCE',
        ];

        return term;
    }

    static fromPromptTermCreated({
        payload: {
            text,
            aggregateCompositeIdentifier: { id: termId },
        },
    }: PromptTermCreated): TermViewModel {
        const term = new TermViewModel({
            type: AggregateType.term,
            id: termId,
            isPublished: false,
            accessControlList: new AccessControlList(),
            name: buildMultilingualTextWithSingleItem(text, LanguageCode.English),
            contributions: [],
            actions: [
                'ELICIT_TERM_FROM_PROMPT',
                'PUBLISH_RESOURCE',
                'ADD_AUDIO_FOR_TERM',
                'TAG_RESOURCE',
                'CONNECT_RESOURCES_WITH_NOTE',
                'CREATE_NOTE_ABOUT_RESOURCE',
            ],
            vocabularyLists: [],
            tags: [],
            notes: [], // none at creation
            connections: [],
            tokens: [], // appended externally
            possibleAudioFilenames: [],
        });

        return term;
    }

    static fromDto(dto: DTO<TermViewModel>): TermViewModel {
        const term = new TermViewModel(dto);

        return term;
    }

    appendAction(action: string): TermViewModel {
        this.actions.push(action);

        return this;
    }

    appendActions(actions: string[]): TermViewModel {
        for (const a of actions) {
            this.actions.push(a);
        }

        return this;
    }

    apply(event: ICoscradEvent): TermViewModel {
        if (
            !event.isFor({
                type: AggregateType.term,
                id: this.id,
            })
        )
            return this;

        if (event.isOfType('TERM_TRANSLATED')) {
            const {
                payload: { translation, languageCode },
            } = event as TermTranslated;

            const updatedName = this.name.translate({
                text: translation,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });

            if (!isInternalError(updatedName)) {
                this.name = updatedName;
            }

            return this;
        }

        if (event.isOfType('AUDIO_ADDED_FOR_TERM')) {
            // const {payload: {audioItemId}} = event as AudioAddedForTerm
            throw new Error(`Not implemented`);
        }

        // there is no handler for this event
        return this;
    }

    public getAvailableCommands() {
        return this.actions;
    }

    public getCompositeIdentifier() {
        return {
            type: AggregateType.term,
            id: this.id,
        };
    }

    public toDto(): DTO<TermViewModel> {
        return cloneToPlainObject(this);
    }

    public clone(overrides: DeepPartial<DTO<TermViewModel>>) {
        const dtoWithOverridesApplied = clonePlainObjectWithOverrides(this.toDto(), overrides);

        return TermViewModel.fromDto(dtoWithOverridesApplied);
    }

    public forUser(userWithGroups: CoscradUserWithGroups): Maybe<TermViewModel> {
        if (this.isPublished || this.accessControlList.canUserWithGroups(userWithGroups)) {
            return this;
        }

        return NotFound;
    }
}
