import { LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../domain/models/__tests__/utilities/dummyDateNow';
import {
    DigitalTextCreated,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import {
    ContentAddedToDigitalTextPage,
    ContentAddedToDigitalTextPagePayload,
} from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { TagCreated } from '../../domain/models/tag/commands/create-tag/tag-created.event';
import { ResourceOrNoteTagged } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
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

const aggregateCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: buildDummyUuid(1),
} as const;

const dateManager = new DummyDateManager();

export type EventPayloadOverrides<T extends BaseEvent> = DeepPartial<T['payload']>;

export type EventTypeAndPayloadOverrides<T extends BaseEvent> = {
    type: T['type'];
    payload: EventPayloadOverrides<T>;
};

const dummyQueryUserId = buildDummyUuid(4);

const dummySystemUserId = buildDummyUuid(999);

// TODO We need a helper for event-sourced test data setup
const buildDigitalTextCreatedEvent = (
    payloadOverrides: DeepPartial<DigitalTextCreated['payload']>
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

    return new DigitalTextCreated(
        payloadWithOverridesApplied,
        buildDummyUuid(2),
        dummySystemUserId,
        dateManager.next()
    );
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
        buildDummyUuid(3),
        dummySystemUserId,
        dateManager.next()
    );

const buildResourcePublishedEvent = (payloadOverrides: DeepPartial<ResourcePublished['payload']>) =>
    new ResourcePublished(
        clonePlainObjectWithOverrides(
            {
                aggregateCompositeIdentifier,
            } as ResourcePublished['payload'],
            payloadOverrides
        ),
        buildDummyUuid(5),
        dummySystemUserId,
        dateManager.next()
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
        buildDummyUuid(6),
        dummySystemUserId,
        dateManager.next()
    );

const buildTagCreatedEvent = (payloadOverrides: DeepPartial<TagCreated['payload']>) =>
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
        buildDummyUuid(7),
        dummySystemUserId,
        dateManager.next()
    );

const buildReourceOrNoteTaggedEvent = (
    payloadOverrides: DeepPartial<ResourceOrNoteTagged['payload']>
) =>
    new ResourceOrNoteTagged(
        // TODO Why is this empty?
        clonePlainObjectWithOverrides({} as ResourceOrNoteTagged['payload'], payloadOverrides),
        buildDummyUuid(8),
        dummySystemUserId,
        dateManager.next()
    );

const buildContentAddedToDigitalTextPage = (
    payloadOverrides: DeepPartial<ContentAddedToDigitalTextPagePayload>
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
        buildDummyUuid(9),
        dummySystemUserId,
        dateManager.next()
    );
};

export type EventBuilder<T extends BaseEvent> = (payloadOverrides: EventPayloadOverrides<T>) => T;

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
        return this.eventOverrides.map(({ type, payload: payloadOverrides }) => {
            /**
             * Note that we already have eagerly checked that there is a builder
             * for each event type we've registered an event for.
             */
            const eventBuilder = this.eventBuilderMap.get(type);

            const identityOverrides = isNonEmptyString(aggregateType)
                ? { id, type: aggregateType as AggregateType }
                : { id };

            const overridesWithCustomId = clonePlainObjectWithOverrides(payloadOverrides, {
                aggregateCompositeIdentifier: identityOverrides,
            });

            return eventBuilder(overridesWithCustomId);
        });
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
