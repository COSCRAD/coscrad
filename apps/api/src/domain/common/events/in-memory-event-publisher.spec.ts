import { INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { EVENT_PUBLISHER_TOKEN } from './constants';
import { CoscradEventConsumer } from './coscrad-event-consumer.decorator';
import { ICoscradEventHandler } from './coscrad-event-handler.interface';
import { CoscradEvent } from './coscrad-event.decorator';
import { ICoscradEvent } from './coscrad-event.interface';
import { EventModule } from './event.module';
import { ObservableInMemoryEventPublisher } from './in-memory-event-publisher';

@CoscradEvent(`WIDGET_CREATED`)
class WidgetCreated implements ICoscradEvent {
    type = `WIDGET_CREATED`;

    payload: {
        id: string;
        name: string;
    };

    constructor(id: string, name: string) {
        this.payload = { id, name };
    }

    isFor(compositeIdentifier: { type: string; id: string }): boolean {
        const { type, id } = compositeIdentifier;

        return type === this.type && id === this.payload.id;
    }

    isOfType(type: string): boolean {
        return type === this.type;
    }

    getPayload(): unknown {
        return this.payload;
    }
}

class Widget {
    id: string;

    name: string;

    constructor(id: string, name: string) {
        this.id = id;

        this.name = name;
    }
}

class WidgetRepository {
    private widgetMap: Map<string, Widget>;

    constructor() {
        this.widgetMap = new Map();
    }

    create(widget: Widget) {
        this.widgetMap.set(widget.id, widget);
    }

    update(widget: Widget) {
        this.widgetMap.set(widget.id, widget);
    }

    fetchById(id: string): Maybe<Widget> {
        if (!this.widgetMap.has(id)) return NotFound;

        return this.widgetMap.get(id);
    }

    fetchMany(): Widget[] {
        return [...this.widgetMap.values()];
    }
}

@CoscradEventConsumer(`WIDGET_CREATED`)
class HandleWidgetCreated implements ICoscradEventHandler {
    constructor(private readonly widgetRepository: WidgetRepository) {}

    handle({ payload: { id, name } }: WidgetCreated) {
        return Promise.resolve(this.widgetRepository.create(new Widget(id, name)));
    }
}

@Module({
    imports: [EventModule],
    providers: [WidgetRepository, HandleWidgetCreated],
})
class WidgetModule {}

describe(`InMemoryEventPublisher`, () => {
    let app: INestApplication;

    let widgetRepository: WidgetRepository;

    let eventPublisher: ObservableInMemoryEventPublisher;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [WidgetModule],
        }).compile();

        app = moduleRef.createNestApplication();

        await app.init();

        widgetRepository = app.get(WidgetRepository);

        eventPublisher = app.get(EVENT_PUBLISHER_TOKEN);
    });

    describe(`when there are event handlers with subscriptions`, () => {
        it(`should handle the events`, () => {
            const widgetId = '1';

            const widgetName = 'blue widget';

            eventPublisher.publish(new WidgetCreated(widgetId, widgetName));

            const searchResult = widgetRepository.fetchById(widgetId);

            expect(searchResult).not.toBe(NotFound);

            const foundWidget = searchResult as Widget;

            expect(foundWidget.name).toBe(widgetName);
        });
    });
});
