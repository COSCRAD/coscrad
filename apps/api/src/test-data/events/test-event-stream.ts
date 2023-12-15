import { LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { v4 as uuidv4 } from 'uuid';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../domain/models/__tests__/utilities/dummyDateNow';
import {
    AudioAddedForDigitalTextPage,
    AudioAddedForDigitalTextPagePayload,
    DigitalTextCreated,
    DigitalTextPageContentTranslated,
    DigitalTextPageContentTranslatedPayload,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import {
    ContentAddedToDigitalTextPage,
    ContentAddedToDigitalTextPagePayload,
} from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { EventRecordMetadata } from '../../domain/models/shared/events/types/EventRecordMetadata';
import {
    LyricsAddedForSong,
    LyricsAddedForSongPayload,
    SongCreated,
    SongCreatedPayload,
    SongLyricsTranslated,
    SongLyricsTranslatedPayload,
    SongTitleTranslated,
    SongTitleTranslatedPayload,
} from '../../domain/models/song/commands';
import { TagCreated } from '../../domain/models/tag/commands/create-tag/tag-created.event';
import {
    ResourceOrNoteTagged,
    ResourceOrNoteTaggedPayload,
} from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import {
    AudioAddedForTerm,
    AudioAddedForTermPayload,
    PromptTermCreated,
    PromptTermCreatedPayload,
    TermCreated,
    TermCreatedPayload,
    TermElicitedFromPrompt,
    TermElicitedFromPromptPayload,
    TermTranslated,
    TermTranslatedPayload,
} from '../../domain/models/term/commands';
import { PROMPT_TERM_CREATED } from '../../domain/models/term/commands/create-prompt-term/constants';
import { TERM_CREATED } from '../../domain/models/term/commands/create-term/constants';
import { TERM_ELICITED_FROM_PROMPT } from '../../domain/models/term/commands/elicit-term-from-prompt/constants';
import { TERM_TRANSLATED } from '../../domain/models/term/commands/translate-term/constants';
import { AggregateId } from '../../domain/types/AggregateId';
import { AggregateType } from '../../domain/types/AggregateType';
import { InternalError } from '../../lib/errors/InternalError';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import { BaseEvent } from '../../queries/event-sourcing';
import { DeepPartial } from '../../types/DeepPartial';

class DummyDateManager {
    private currentDate: number;

    constructor(startingDate = dummyDateNow) {
        this.currentDate = startingDate;
    }

    next(offset = 1) {
        const date = this.currentDate;

        // This will be the value returned from the next call
        this.currentDate += offset;

        return date;
    }
}

class TestIdGenerator {
    private currentId: number;

    constructor(firstSequenceNumber = 1) {
        this.currentId = firstSequenceNumber;
    }

    next() {
        const id = buildDummyUuid(this.currentId);

        this.currentId++;

        return id;
    }
}

const aggregateCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: buildDummyUuid(1),
} as const;

const dateManager = new DummyDateManager();

const idGenerator = new TestIdGenerator(3000);

export type EventPayloadOverrides<T extends BaseEvent> = DeepPartial<T['payload']>;

export type EventTypeAndPayloadOverrides<T extends BaseEvent> = {
    type: T['type'];
    payload?: EventPayloadOverrides<T>;
    meta?: DeepPartial<EventRecordMetadata>;
};

const dummyQueryUserId = buildDummyUuid(4);

const dummySystemUserId = buildDummyUuid(999);

const buildEventMeta = (): EventRecordMetadata => ({
    id: idGenerator.next(),
    userId: dummySystemUserId,
    dateCreated: dateManager.next(),
});

// TODO We need a helper for event-sourced test data setup
const buildDigitalTextCreatedEvent = (
    payloadOverrides: DeepPartial<DigitalTextCreated['payload']>,
    metadataOverrides?: DeepPartial<EventRecordMetadata>
) => {
    const payloadWithOverridesApplied: DigitalTextCreated['payload'] =
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
                title: 'Title for Digital Text',
                languageCodeForTitle: LanguageCode.English,
            } as DigitalTextCreated['payload'],
            payloadOverrides
        );

    return new DigitalTextCreated(payloadWithOverridesApplied, {
        ...buildEventMeta(),
        ...(metadataOverrides || {}),
    });
};

const buildResourceReadAccessGrantedToUserEvent = (
    payloadOverrides: DeepPartial<ResourceReadAccessGrantedToUser['payload']>
) =>
    new ResourceReadAccessGrantedToUser(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
                userId: dummyQueryUserId,
            } as ResourceReadAccessGrantedToUser['payload'],
            payloadOverrides
        ),
        buildEventMeta()
    );

const buildResourcePublishedEvent = (payloadOverrides: DeepPartial<ResourcePublished['payload']>) =>
    new ResourcePublished(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
            } as ResourcePublished['payload'],
            payloadOverrides
        ),
        buildEventMeta()
    );

const buildPageAddedEvent = (payloadOverrides: DeepPartial<PageAddedToDigitalText['payload']>) =>
    new PageAddedToDigitalText(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
                identifier: '12',
            } as PageAddedToDigitalText['payload'],
            payloadOverrides
        ),
        buildEventMeta()
    );

const buildAudioAddedForDigitalTextPage = (
    payloadOverrides: DeepPartial<AudioAddedForDigitalTextPagePayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const payloadDefaults: AudioAddedForDigitalTextPagePayload = {
        aggregateCompositeIdentifier,
        pageIdentifier: 'XXL',
        audioItemId: buildDummyUuid(987),
        languageCode: LanguageCode.Haida,
    };

    return new AudioAddedForDigitalTextPage(
        clonePlainObjectWithOverrides(payloadDefaults, payloadOverrides),
        clonePlainObjectWithOverrides(buildEventMeta(), metadataOverrides)
    );
};

const buildTagCreatedEvent = (
    payloadOverrides: DeepPartial<TagCreated['payload']>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) =>
    new TagCreated(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier: {
                    type: AggregateType.tag,
                    id: buildDummyUuid(9),
                },
                label: 'birds',
            } as TagCreated['payload'],
            payloadOverrides
        ),
        clonePlainObjectWithOverrides(buildEventMeta(), metadataOverrides)
    );

const buildReourceOrNoteTaggedEvent = (
    payloadOverrides: DeepPartial<ResourceOrNoteTagged['payload']>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: ResourceOrNoteTaggedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.tag,
            id: buildDummyUuid(8),
        },
        taggedMemberCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(9),
        },
    };

    return new ResourceOrNoteTagged(
        // TODO Why is this empty?
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        {
            ...buildEventMeta(),
            ...metadataOverrides,
        }
    );
};

const buildContentAddedToDigitalTextPage = (
    payloadOverrides: DeepPartial<ContentAddedToDigitalTextPagePayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: ContentAddedToDigitalTextPagePayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.digitalText,
            id: buildDummyUuid(124),
        },
        text: 'Hear ye, hear ye, I shall tell a great epic of years gone by!',
        languageCode: LanguageCode.English,
        pageIdentifier: 'X',
    };

    return new ContentAddedToDigitalTextPage(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        {
            ...buildEventMeta(),
            ...metadataOverrides,
        }
    );
};

const buildDigitalTextPageContentTranslated = (
    payloadOverrides: DeepPartial<DigitalTextPageContentTranslatedPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: DigitalTextPageContentTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.digitalText,
            id: buildDummyUuid(124),
        },
        pageIdentifier: '117',
        translation: 'the translation',
        languageCode: LanguageCode.English,
    };

    return new DigitalTextPageContentTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        { ...buildEventMeta(), ...metadataOverrides }
    );
};

const buildTermCreated = (
    payloadOverrides: DeepPartial<TermCreatedPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: TermCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(123),
        },
        text: 'he is jumping',
        languageCode: LanguageCode.Haida,
        // TODO remove this
        contributorId: '1',
    };

    return new TermCreated(clonePlainObjectWithOverrides(defaultPayload, payloadOverrides), {
        ...buildEventMeta(),
        ...metadataOverrides,
    });
};

const buildTermTranslated = (
    payloadOverrides: DeepPartial<TermTranslatedPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: TermTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(124),
        },
        translation: 'he is jumping (translation)',
        languageCode: LanguageCode.English,
    };

    return new TermTranslated(clonePlainObjectWithOverrides(defaultPayload, payloadOverrides), {
        ...buildEventMeta(),
        ...metadataOverrides,
    });
};

const buildPromptTermCreated = (
    payloadOverrides: DeepPartial<PromptTermCreatedPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: PromptTermCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(125),
        },
        text: 'how do you say, "sing to me"',
    };

    return new PromptTermCreated(clonePlainObjectWithOverrides(defaultPayload, payloadOverrides), {
        ...buildEventMeta(),
        ...metadataOverrides,
    });
};

const buildTermElicitedFromPrompt = (
    payloadOverrides: DeepPartial<TermElicitedFromPromptPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: TermElicitedFromPromptPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(126),
        },
        text: 'sing to me (in language)',
        languageCode: LanguageCode.Haida,
    };

    return new TermElicitedFromPrompt(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        {
            ...buildEventMeta(),
            ...metadataOverrides,
        }
    );
};

const buildAudioAddedForTerm = (
    payloadOverrides: DeepPartial<AudioAddedForTermPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: AudioAddedForTermPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(127),
        },
        audioItemId: buildDummyUuid(777),
        languageCode: LanguageCode.Haida,
    };

    return new AudioAddedForTerm(clonePlainObjectWithOverrides(defaultPayload, payloadOverrides), {
        ...buildEventMeta(),
        ...metadataOverrides,
    });
};

const buildSongCreated = (
    payloadOverrides: DeepPartial<SongCreatedPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: SongCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(567),
        },
        title: 'song title',
        languageCodeForTitle: LanguageCode.Haida,
        audioItemId: buildDummyUuid(577),
    };

    return new SongCreated(clonePlainObjectWithOverrides(defaultPayload, payloadOverrides), {
        ...buildEventMeta(),
        ...metadataOverrides,
    });
};

const buildSongTitleTranslated = (
    payloadOverrides: DeepPartial<SongTitleTranslatedPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: SongTitleTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(567),
        },
        translation: 'translation of song title',
        languageCode: LanguageCode.English,
    };

    return new SongTitleTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        {
            ...buildEventMeta(),
            ...metadataOverrides,
        }
    );
};

const buildLyricsAddedForSong = (
    payloadOverrides: DeepPartial<LyricsAddedForSongPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: LyricsAddedForSongPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(567),
        },
        lyrics: 'la la la',
        languageCode: LanguageCode.Haida,
    };

    return new LyricsAddedForSong(clonePlainObjectWithOverrides(defaultPayload, payloadOverrides), {
        ...buildEventMeta(),
        ...metadataOverrides,
    });
};

const buildSongLyricsTranslated = (
    payloadOverrides: DeepPartial<SongLyricsTranslatedPayload>,
    metadataOverrides: DeepPartial<EventRecordMetadata>
) => {
    const defaultPayload: SongLyricsTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(567),
        },
        translation: 'la la la (translation)',
        languageCode: LanguageCode.English,
    };

    return new SongLyricsTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        {
            ...buildEventMeta(),
            ...metadataOverrides,
        }
    );
};

export type EventBuilder<T extends BaseEvent> = (
    payloadOverrides: EventPayloadOverrides<T>,
    metaOverrides: DeepPartial<EventRecordMetadata>
) => T;

export class TestEventStream {
    private readonly eventOverrides: EventTypeAndPayloadOverrides<BaseEvent>[];

    private readonly eventBuilderMap: Map<string, EventBuilder<BaseEvent>> = new Map();

    constructor(eventOverrides: EventTypeAndPayloadOverrides<BaseEvent>[] = []) {
        this.eventOverrides = eventOverrides;

        /**
         * TODO Consider injecting the builder as a dependency to the constructor.
         *
         * TODO Find a pattern for doing this in separate files.
         */
        this.registerBuilder('DIGITAL_TEXT_CREATED', buildDigitalTextCreatedEvent)
            .registerBuilder('PAGE_ADDED_TO_DIGITAL_TEXT', buildPageAddedEvent)
            .registerBuilder(
                'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
                buildResourceReadAccessGrantedToUserEvent
            )
            .registerBuilder('RESOURCE_PUBLISHED', buildResourcePublishedEvent)
            .registerBuilder('RESOURCE_OR_NOTE_TAGGED', buildReourceOrNoteTaggedEvent)
            .registerBuilder('TAG_CREATED', buildTagCreatedEvent)
            .registerBuilder(
                'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE',
                buildContentAddedToDigitalTextPage
            )
            .registerBuilder(TERM_CREATED, buildTermCreated)
            .registerBuilder(TERM_TRANSLATED, buildTermTranslated)
            .registerBuilder(PROMPT_TERM_CREATED, buildPromptTermCreated)
            .registerBuilder(TERM_ELICITED_FROM_PROMPT, buildTermElicitedFromPrompt)
            .registerBuilder(`SONG_CREATED`, buildSongCreated)
            .registerBuilder(`SONG_TITLE_TRANSLATED`, buildSongTitleTranslated)
            .registerBuilder(`LYRICS_ADDED_FOR_SONG`, buildLyricsAddedForSong)
            .registerBuilder(`SONG_LYRICS_TRANSLATED`, buildSongLyricsTranslated)
            .registerBuilder(
                `DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED`,
                buildDigitalTextPageContentTranslated
            )
            .registerBuilder(`AUDIO_ADDED_FOR_TERM`, buildAudioAddedForTerm)
            .registerBuilder(
                `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`,
                buildAudioAddedForDigitalTextPage
            );
    }

    andThen<T extends BaseEvent>(
        eventTypeAndPayloadOverrides: EventTypeAndPayloadOverrides<T>
    ): TestEventStream {
        const { type: eventType } = eventTypeAndPayloadOverrides;

        /**
         * We want to catch this issue as soon as possible, so we do this check
         * now instead of waiting until we lazily execute the builder.
         */
        if (!this.eventBuilderMap.has(eventType)) {
            throw new InternalError(
                `Failed to find a test event builder for events of type: ${eventType}`
            );
        }

        /**
         * Avoid shared references. This makes reuse within tests quite easy.
         * Save a reference to the return of `andThen`. You can chain another
         * `andThen` without mutating the original.
         */
        return this.clone([...this.eventOverrides, eventTypeAndPayloadOverrides]);
    }

    /**
     * Given that some events are generic across resource types, it is possible
     * that we may want to override `aggregateType.type` at some point. To avoid
     * breaking changes in the future, we take an object as the paramter here.
     */
    as({ id, type: aggregateType }: { id: AggregateId; type?: string }): BaseEvent[] {
        return this.eventOverrides.map(
            ({ type, payload: payloadOverrides, meta: metaOverrides }) => {
                /**
                 * Note that we already have eagerly checked that there is a builder
                 * for each event type we've registered an event for.
                 */
                const eventBuilder = this.eventBuilderMap.get(type);

                const identityOverrides = isNonEmptyString(aggregateType)
                    ? { id, type: aggregateType as AggregateType }
                    : { id };

                const overridesWithCustomId = clonePlainObjectWithOverrides(
                    payloadOverrides || {},
                    {
                        aggregateCompositeIdentifier: identityOverrides,
                    }
                );

                return eventBuilder(overridesWithCustomId, {
                    // Here we avoid event ID collisions for events of the same type
                    id: uuidv4(),
                    // You can manually control the ID if necessary, though
                    ...(metaOverrides || {}),
                });
            }
        );
    }

    private registerBuilder<T extends BaseEvent>(
        eventType: string,
        builder: EventBuilder<T>
    ): TestEventStream {
        if (this.eventBuilderMap.has(eventType)) {
            throw new InternalError(
                `There is already a test data builder for events of type: ${eventType}`
            );
        }

        this.eventBuilderMap.set(eventType, builder);

        return this;
    }

    private clone(eventOverrides: EventTypeAndPayloadOverrides<BaseEvent>[]): TestEventStream {
        return new TestEventStream(eventOverrides);
    }
}
