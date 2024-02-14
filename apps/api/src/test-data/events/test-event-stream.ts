import { LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { plainToInstance } from 'class-transformer';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../domain/models/__tests__/utilities/dummyDateNow';
import { getNoteTestEventMap } from '../../domain/models/context/test-data';
import {
    AudioAddedForDigitalTextPage,
    AudioAddedForDigitalTextPagePayload,
    AudioAddedForDigitalTextTitle,
    AudioAddedForDigitalTextTitlePayload,
    CoverPhotographAddedForDigitalText,
    CoverPhotographAddedForDigitalTextPayload,
    DigitalTextCreated,
    DigitalTextPageContentTranslated,
    DigitalTextPageContentTranslatedPayload,
    DigitalTextTitleTranslated,
    DigitalTextTitleTranslatedPayload,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import {
    ContentAddedToDigitalTextPage,
    ContentAddedToDigitalTextPagePayload,
} from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import {
    PhotographAddedToDigitalTextPage,
    PhotographAddedToDigitalTextPagePayload,
} from '../../domain/models/digital-text/commands/add-photograph-to-digital-text-page';
import { getPhotographTestEventBuilders } from '../../domain/models/photograph/test-data';
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
import { getTagTestEventBuildersMap } from '../../domain/models/tag';
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
import {
    FilterPropertyType,
    TermAddedToVocabularyList,
    TermAddedToVocabularyListPayload,
    TermInVocabularyListAnalyzed,
    TermInVocabularyListAnalyzedPayload,
    VocabularyListCreated,
    VocabularyListCreatedPayload,
    VocabularyListFilterPropertyRegistered,
    VocabularyListFilterPropertyRegisteredPayload,
} from '../../domain/models/vocabulary-list/commands';
import {
    VocabularyListNameTranslated,
    VocabularyListNameTranslatedPayload,
} from '../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { AggregateId } from '../../domain/types/AggregateId';
import { AggregateType } from '../../domain/types/AggregateType';
import { InternalError } from '../../lib/errors/InternalError';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { BaseEvent } from '../../queries/event-sourcing';
import { DeepPartial } from '../../types/DeepPartial';

type EventRecordMetadataOverrides = DeepPartial<EventRecordMetadata>;

export type EventMetadataBuilder = () => EventRecordMetadata;

export type EventBuilder<T extends BaseEvent> = (
    payloadOverrides: EventPayloadOverrides<T>,
    metaDataBuilder: EventMetadataBuilder
) => T;

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

// TODO We need a helper for event-sourced test data setup
const buildDigitalTextCreatedEvent = (
    payloadOverrides: DeepPartial<DigitalTextCreated['payload']>,
    buildMetadata: EventMetadataBuilder
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

    return new DigitalTextCreated(payloadWithOverridesApplied, buildMetadata());
};

const buildDigitalTextTitleTranslated: EventBuilder<DigitalTextTitleTranslated> = (
    payloadOverrides: DeepPartial<DigitalTextTitleTranslated['payload']>,
    buildMetadata: EventMetadataBuilder
) => {
    const payloadDefaults: DigitalTextTitleTranslatedPayload = {
        aggregateCompositeIdentifier,
        translation: 'this is the translation',
        languageCode: LanguageCode.English,
    };

    return new DigitalTextTitleTranslated(
        clonePlainObjectWithOverrides(payloadDefaults, payloadOverrides),
        buildMetadata()
    );
};

const buildResourceReadAccessGrantedToUserEvent = (
    payloadOverrides: DeepPartial<ResourceReadAccessGrantedToUser['payload']>,
    buildMetadata: EventMetadataBuilder
) =>
    new ResourceReadAccessGrantedToUser(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
                userId: dummyQueryUserId,
            } as ResourceReadAccessGrantedToUser['payload'],
            payloadOverrides
        ),
        buildMetadata()
    );

const buildResourcePublishedEvent = (
    payloadOverrides: DeepPartial<ResourcePublished['payload']>,
    buildMetadata: EventMetadataBuilder
) =>
    new ResourcePublished(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
            } as ResourcePublished['payload'],
            payloadOverrides
        ),
        buildMetadata()
    );

const buildPageAddedEvent = (
    payloadOverrides: DeepPartial<PageAddedToDigitalText['payload']>,
    buildMetadata: EventMetadataBuilder
) =>
    new PageAddedToDigitalText(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
                identifier: '12',
            } as PageAddedToDigitalText['payload'],
            payloadOverrides
        ),
        buildMetadata()
    );

const buildAudioAddedForDigitalTextPage = (
    payloadOverrides: DeepPartial<AudioAddedForDigitalTextPagePayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const payloadDefaults: AudioAddedForDigitalTextPagePayload = {
        aggregateCompositeIdentifier,
        pageIdentifier: 'XXL',
        audioItemId: buildDummyUuid(987),
        languageCode: LanguageCode.Haida,
    };

    return new AudioAddedForDigitalTextPage(
        clonePlainObjectWithOverrides(payloadDefaults, payloadOverrides),
        buildMetadata()
    );
};

const buildAudioAddedForDigitalTextTitle = (
    payloadOverrides: DeepPartial<AudioAddedForDigitalTextTitlePayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const payloadDefaults: AudioAddedForDigitalTextTitlePayload = {
        aggregateCompositeIdentifier,
        audioItemId: buildDummyUuid(117),
        languageCode: LanguageCode.English,
    };

    return new AudioAddedForDigitalTextTitle(
        clonePlainObjectWithOverrides(payloadDefaults, payloadOverrides),
        buildMetadata()
    );
};

const buildContentAddedToDigitalTextPage = (
    payloadOverrides: DeepPartial<ContentAddedToDigitalTextPagePayload>,
    buildMetadata: EventMetadataBuilder
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
        buildMetadata()
    );
};

const buildDigitalTextPageContentTranslated = (
    payloadOverrides: DeepPartial<DigitalTextPageContentTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
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
        buildMetadata()
    );
};

const buildCoverPhotographForDigitalText = (
    payloadOverrides: DeepPartial<CoverPhotographAddedForDigitalTextPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: CoverPhotographAddedForDigitalTextPayload = {
        aggregateCompositeIdentifier: { type: AggregateType.digitalText, id: buildDummyUuid(117) },
        photographId: buildDummyUuid(145),
    };

    return new CoverPhotographAddedForDigitalText(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildPhotographAddedToDigitalTextPage = (
    payloadOverrides: DeepPartial<PhotographAddedToDigitalTextPagePayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: PhotographAddedToDigitalTextPagePayload = {
        aggregateCompositeIdentifier: { type: AggregateType.digitalText, id: buildDummyUuid(124) },
        pageIdentifier: '117',
        photographId: buildDummyUuid(5),
    };

    return new PhotographAddedToDigitalTextPage(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildTermCreated = (
    payloadOverrides: DeepPartial<TermCreatedPayload>,
    buildMetadata: EventMetadataBuilder
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

    return new TermCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildTermTranslated = (
    payloadOverrides: DeepPartial<TermTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: TermTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(124),
        },
        translation: 'he is jumping (translation)',
        languageCode: LanguageCode.English,
    };

    return new TermTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildPromptTermCreated = (
    payloadOverrides: DeepPartial<PromptTermCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: PromptTermCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(125),
        },
        text: 'how do you say, "sing to me"',
    };

    return new PromptTermCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildTermElicitedFromPrompt = (
    payloadOverrides: DeepPartial<TermElicitedFromPromptPayload>,
    buildMetadata: EventMetadataBuilder
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
        buildMetadata()
    );
};

const buildAudioAddedForTerm = (
    payloadOverrides: DeepPartial<AudioAddedForTermPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: AudioAddedForTermPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(127),
        },
        audioItemId: buildDummyUuid(777),
        languageCode: LanguageCode.Haida,
    };

    return new AudioAddedForTerm(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildSongCreated = (
    payloadOverrides: DeepPartial<SongCreatedPayload>,
    buildMetadata: EventMetadataBuilder
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

    return new SongCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildSongTitleTranslated = (
    payloadOverrides: DeepPartial<SongTitleTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
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
        buildMetadata()
    );
};

const buildLyricsAddedForSong = (
    payloadOverrides: DeepPartial<LyricsAddedForSongPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: LyricsAddedForSongPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id: buildDummyUuid(567),
        },
        lyrics: 'la la la',
        languageCode: LanguageCode.Haida,
    };

    return new LyricsAddedForSong(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildSongLyricsTranslated = (
    payloadOverrides: DeepPartial<SongLyricsTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
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
        buildMetadata()
    );
};

const buildVocabularyListCreated = (
    payloadOverrides: DeepPartial<VocabularyListCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: VocabularyListCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.vocabularyList,
            id: buildDummyUuid(124),
        },
        name: 'the vocab list',
        languageCodeForName: LanguageCode.English,
    };

    return new VocabularyListCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildVocabularyListNameTranslated = (
    payloadOverrides: DeepPartial<VocabularyListNameTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: VocabularyListNameTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.vocabularyList,
            id: buildDummyUuid(135),
        },
        text: 'Translation of Vocabulary List Name',
        languageCode: LanguageCode.Chilcotin,
    };

    return new VocabularyListNameTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildTermAddedToVocabularyList = (
    payloadOverrides: DeepPartial<TermAddedToVocabularyListPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: TermAddedToVocabularyListPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.vocabularyList,
            id: buildDummyUuid(999),
        },
        termId: buildDummyUuid(123),
    };

    return new TermAddedToVocabularyList(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildVocabularyListFilterPropertyRegistered = (
    payloadOverrides: DeepPartial<VocabularyListFilterPropertyRegisteredPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: VocabularyListFilterPropertyRegisteredPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.vocabularyList,
            id: buildDummyUuid(34),
        },
        type: FilterPropertyType.selection,
        name: 'person',
        allowedValuesAndLabels: [
            {
                value: '12',
                label: 'we',
            },
            {
                value: '11',
                label: 'I',
            },
        ],
    };

    return new VocabularyListFilterPropertyRegistered(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

const buildTermInVocabularyListAnalyzed = (
    payloadOverrides: TermInVocabularyListAnalyzedPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: TermInVocabularyListAnalyzedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.vocabularyList,
            id: buildDummyUuid(901),
        },
        termId: buildDummyUuid(88),
        propertyValues: {
            person: '1',
            number: '1',
            aspect: '3',
            positive: '0',
        },
    };

    return new TermInVocabularyListAnalyzed(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};

export class TestEventStream {
    private readonly TIME_OFFSET = 100; // 100 ms between events

    private readonly eventOverrides: EventTypeAndPayloadOverrides<BaseEvent>[] = [];

    private eventBuilderMap: Map<string, EventBuilder<BaseEvent>> = new Map();

    private readonly startingDate: number = dummyDateNow;

    private readonly idGenerator: TestIdGenerator = new TestIdGenerator(3000);

    private readonly dateManager: DummyDateManager = new DummyDateManager(dummyDateNow);

    constructor() {
        /**
         * TODO Consider injecting the builder as a dependency to the constructor.
         *
         * TODO Find a pattern for doing this in separate files.
         *
         * TODO If you use the constructor in `.clone`, this logic happens
         * on every call to clone. This isn't very performant.
         */
        this.registerBuilder('DIGITAL_TEXT_CREATED', buildDigitalTextCreatedEvent)
            .registerBuilder('PAGE_ADDED_TO_DIGITAL_TEXT', buildPageAddedEvent)
            .registerBuilder(
                'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
                buildResourceReadAccessGrantedToUserEvent
            )
            .registerBuilder('RESOURCE_PUBLISHED', buildResourcePublishedEvent)
            .registerBuilder(
                'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE',
                buildContentAddedToDigitalTextPage
            )
            .registerBuilder(
                'PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE',
                buildPhotographAddedToDigitalTextPage
            )
            .registerBuilder(
                'COVER_PHOTOGRAPH_ADDED_FOR_DIGITAL_TEXT',
                buildCoverPhotographForDigitalText
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
            .registerBuilder(`AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`, buildAudioAddedForDigitalTextPage)
            .registerBuilder(`DIGITAL_TEXT_TITLE_TRANSLATED`, buildDigitalTextTitleTranslated)
            .registerBuilder(
                `AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE`,
                buildAudioAddedForDigitalTextTitle
            )
            .registerBuilder(`VOCABULARY_LIST_CREATED`, buildVocabularyListCreated)
            .registerBuilder(`VOCABULARY_LIST_NAME_TRANSLATED`, buildVocabularyListNameTranslated)
            .registerBuilder(
                `VOCABULARY_LIST_FILTER_PROPERTY_REGISTERED`,
                buildVocabularyListFilterPropertyRegistered
            )
            .registerBuilder(`TERM_ADDED_TO_VOCABULARY_LIST`, buildTermAddedToVocabularyList)
            .registerBuilder(`TERM_IN_VOCABULARY_LIST_ANALYZED`, buildTermInVocabularyListAnalyzed);

        [
            ...getTagTestEventBuildersMap(),
            ...getNoteTestEventMap().entries(),
            ...getPhotographTestEventBuilders().entries(),
        ].reduce((acc, [eventType, builder]) => acc.registerBuilder(eventType, builder), this);
    }

    andThen<T extends BaseEvent>(
        eventTypeAndPayloadOverrides: EventTypeAndPayloadOverrides<T>
    ): TestEventStream {
        const { type: eventType, meta: metaOverrides } = eventTypeAndPayloadOverrides;

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
        return this.clone([
            ...this.eventOverrides,
            {
                ...eventTypeAndPayloadOverrides,
                // ensure unique IDs and monotinically increasing event time stamps are used- unless the user overrides these
                meta: this.buildEventMeta(metaOverrides),
            },
        ]);
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

                return eventBuilder(overridesWithCustomId, () =>
                    this.buildEventMeta(metaOverrides)
                );
            }
        );
    }

    public registerBuilder<T extends BaseEvent>(
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

    /**
     * It is important to clone when creating a new event stream from an old one,
     * so that we don't have side effects from aliasing.
     */
    private clone(eventOverrides: EventTypeAndPayloadOverrides<BaseEvent>[]): TestEventStream {
        const { eventBuilderMap } = this;

        // We follow this approach so we can maintain the private, internal state except for the event overrides
        const dto = cloneToPlainObject(this);

        dto.eventOverrides = eventOverrides;

        const instance = plainToInstance(TestEventStream, dto);

        instance.eventBuilderMap = eventBuilderMap;

        return instance;
    }

    private buildEventMeta(metaOverrides?: EventRecordMetadataOverrides): EventRecordMetadata {
        const defaultMeta = {
            id: idGenerator.next(),
            userId: dummySystemUserId,
            dateCreated: dateManager.next(),
        };

        return clonePlainObjectWithOverrides(defaultMeta, metaOverrides || {});
    }

    static fromReflection() {
        const defaultPayloadMap = Reflect.getMetadata(
            '__DEFAULT_PAYLOADS__',
            TestEventStream
        ) as Map<string, EventBuilder<BaseEvent>>;

        const builder = defaultPayloadMap.get('TAG_CREATED');

        return new TestEventStream().registerBuilder('TAG_CREATED', builder);
    }
}
