import { ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConsoleCoscradCliLogger, COSCRAD_LOGGER_TOKEN } from '../../../../coscrad-cli/logging';
import { buildMockLogger } from '../../../../coscrad-cli/logging/__tests__';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { buildTestInstance } from '../../../../test-data/utilities';
import { EVENT_PUBLISHER_TOKEN, EventModule } from '../../../common';
import { SyncInMemoryEventPublisher } from '../../../common/events/sync-in-memory-event-publisher';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import { TagCreated } from '../../tag/commands/create-tag/tag-created.event';
import { ContributionSummary, ContributorCreated } from '../../user-management';
import { UserRegistered } from '../../user-management/user/commands/register-user/user-registered.event';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../common-commands/publish-resource/resource-published.event-handler';
import { BaseEvent } from '../events/base-event.entity';
import { Attributor } from './attributor.event-handler';

const TEST_RESOURCE_TYPE = 'widget';

class Widget {
    readonly type = TEST_RESOURCE_TYPE;

    id: string;

    name: string;

    contributions: string[] = [];

    constructor({ id, name }: { id: string; name: string }) {
        this.id = id;

        this.name = name;
    }
}

class WidgetRepository {
    private readonly store = new Map<string, Widget>();

    async fetchById(id: string) {
        if (!this.store.has(id)) {
            return NotFound;
        }

        return this.store.get(id);
    }

    async create(widget: Widget) {
        if (!this.store.has(widget.id)) {
            this.store.set(widget.id, widget);
        }
    }

    async attribute(id: string, { contributorIds }: ContributionSummary) {
        const target = await this.fetchById(id);

        if (isNotFound(target)) {
            return;
        }

        for (const c of contributorIds) {
            target.contributions.push(c);
        }
    }
}

type WidgetCreatedPayload = {
    aggregateCompositeIdentifier: {
        // TODO shouldn't this be string
        type: ResourceType;
        id: string;
    };

    name: string;
};

class WidgetCreated extends BaseEvent<WidgetCreatedPayload> {
    readonly type = 'WIDGET_CREATED';

    payload: WidgetCreatedPayload;
}

const contributorIdsForEvent = [1, 2, 3, 4].map((n) => n.toString());

const targetResourceId = '123';

const widgetName = '3D Printer A';

const testEventId = buildDummyUuid(4);

const widgetCreated = new WidgetCreated(
    {
        aggregateCompositeIdentifier: {
            type: TEST_RESOURCE_TYPE as ResourceType,
            id: targetResourceId,
        },
        name: widgetName,
    },
    {
        id: testEventId,
        dateCreated: dummyDateNow,
        userId: buildDummyUuid(33),
        contributorIds: contributorIdsForEvent,
    }
);

const testQueryRepository = new WidgetRepository();

const provider = {
    forResource(type: string) {
        if (type !== TEST_RESOURCE_TYPE) {
            throw new Error(`only widgets are supported`);
        }

        return testQueryRepository;
    },
};

describe(`Attributor`, () => {
    describe(`when there is an existing resource`, () => {
        const targetResource = new Widget({ id: targetResourceId, name: widgetName });

        const attributor = new Attributor(provider, new ConsoleCoscradCliLogger());

        beforeAll(async () => {
            await testQueryRepository.create(targetResource);
        });

        it(`should add the attribution`, async () => {
            await attributor.handle(widgetCreated);

            const updatedWidget = (await testQueryRepository.fetchById(
                targetResource.id
            )) as Widget;

            expect(updatedWidget.contributions).toHaveLength(contributorIdsForEvent.length);

            const missingContributorIds = contributorIdsForEvent.filter(
                (idToFind) =>
                    !updatedWidget.contributions.some(
                        (idOnUpdatedView) => idToFind === idOnUpdatedView
                    )
            );

            expect(missingContributorIds).toEqual([]);
        });
    });

    describe(`when handling events for non-resource aggregate roots`, () => {
        let app: INestApplication;

        let publisher: SyncInMemoryEventPublisher;

        const mockLogger = buildMockLogger({ isEnabled: true });

        beforeAll(async () => {
            const testModule = await Test.createTestingModule({
                imports: [EventModule],
                providers: [
                    Attributor,
                    {
                        provide: QUERY_REPOSITORY_PROVIDER_TOKEN,
                        useValue: provider,
                    },
                    {
                        provide: COSCRAD_LOGGER_TOKEN,
                        useValue: mockLogger,
                    },
                ],
            }).compile();

            app = testModule.createNestApplication();

            await app.init();

            publisher = app.get(EVENT_PUBLISHER_TOKEN);
        });

        const assertEventIsNotHandled = (event: BaseEvent) => {
            const foundHandlers = publisher.getHandlersFor(event);

            expect(foundHandlers).toEqual([]);
        };

        describe(`when the event is for a user`, () => {
            it(`should not handle the event`, async () => {
                assertEventIsNotHandled(buildTestInstance(UserRegistered));
            });
        });

        describe(`when the event is for a tag`, () => {
            it(`should not handle the event`, async () => {
                assertEventIsNotHandled(buildTestInstance(TagCreated));
            });
        });

        describe(`when the event is for a contributor`, () => {
            it(`should not handle the event`, async () => {
                assertEventIsNotHandled(buildTestInstance(ContributorCreated));
            });
        });
    });
});
