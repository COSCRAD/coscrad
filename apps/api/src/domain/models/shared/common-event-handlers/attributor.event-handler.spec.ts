import { ResourceType } from '@coscrad/api-interfaces';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
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

    async attribute(id: string, { meta: { contributorIds } }: BaseEvent) {
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

describe(`Attributor`, () => {
    describe(`when there is an existing resource`, () => {
        const testQueryRepository = new WidgetRepository();

        const provider = {
            forResource(type: string) {
                if (type !== TEST_RESOURCE_TYPE) {
                    throw new Error(`only widgets are supported`);
                }

                return testQueryRepository;
            },
        };

        const targetResource = new Widget({ id: targetResourceId, name: widgetName });

        const attributor = new Attributor(provider);

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
});
