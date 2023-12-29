import {
    ICreationEventHandler,
    IUpdateEventHandler,
    buildEventHandlerMaps,
} from './build-event-handler-maps';
import { CoscradEventHandler } from './coscrad-event-handler.decorator';
import { CoscradEvent } from './coscrad-event.decorator';
import { HasAggregateCompositeIdentifier, ICoscradEvent } from './coscrad-event.interface';

const assertEmptyMap = (result: unknown): void => {
    expect(result).toBeInstanceOf(Map);

    const numberOfEntries = (result as Map<string, unknown>).size;

    expect(numberOfEntries).toBe(0);
};

const WIDGET = 'widget';

const buildWidgetCompositeId = (id: string) => ({
    type: WIDGET,
    id,
});

const WIDGET_CREATED = `WIDGET_CREATED`;

class Widget {
    type = WIDGET;

    id: string;

    name: string;

    rating: number;

    constructor(id: string, name: string, rating?: number) {
        this.id = id;

        this.name = name;

        this.rating = Number.isInteger(rating) ? rating : -1;
    }

    rate(rating: number): Widget {
        this.rating = rating;

        return this;
    }

    rename(newName: string): Widget {
        this.name = newName;

        return this;
    }
}

/**
 * Creation event definitions
 */

type WidgetCreatedPayload = HasAggregateCompositeIdentifier & { name: string };

@CoscradEvent(WIDGET_CREATED)
class WidgetCreated implements ICoscradEvent<WidgetCreatedPayload, {}> {
    type = WIDGET_CREATED;

    payload: WidgetCreatedPayload;

    meta = {};

    constructor(id: string, name: string) {
        this.payload = {
            aggregateCompositeIdentifier: buildWidgetCompositeId(id),
            name,
        };
    }
}

@CoscradEventHandler({ eventType: WIDGET_CREATED, scope: 'CREATE' })
class WidgetCreatedEventHandler implements ICreationEventHandler<Widget> {
    handle(creationEvent: WidgetCreated): Widget {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                name,
            },
        } = creationEvent;

        return new Widget(id, name);
    }
}

/**
 * Here we introduce a second creation event for the `Widget`, since multiple
 * creation events are a possibility in our use cases.
 */

const WIDGET_CREATED_WITH_RATING = `WIDGET_CREATED_WITH_RATING`;

type WidgetCreatedWithRatingPayload = HasAggregateCompositeIdentifier & {
    name: string;
    rating: number;
};

/**
 * TODO Test that there is an error when the same event type is registered
 * twice.
 */
@CoscradEvent(WIDGET_CREATED_WITH_RATING)
class WidgetCreatedWithRating implements ICoscradEvent<WidgetCreatedWithRatingPayload, {}> {
    type = WIDGET_CREATED_WITH_RATING;

    payload: WidgetCreatedWithRatingPayload;

    meta = {};

    constructor(id: string, name: string, rating: number) {
        this.payload = {
            aggregateCompositeIdentifier: buildWidgetCompositeId(id),
            name,
            rating,
        };
    }
}

@CoscradEventHandler({ eventType: WIDGET_CREATED_WITH_RATING, scope: 'CREATE' })
class WidgetCreatedWithRatingEventHandler implements ICreationEventHandler<Widget> {
    handle(creationEvent: WidgetCreatedWithRating): Widget {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                name,
                rating,
            },
        } = creationEvent;

        return new Widget(id, name, rating);
    }
}

/**
 * Update event definitions.
 */

type WidgetRatedPayload = HasAggregateCompositeIdentifier & {
    rating: number;
};

const WIDGET_RATED = 'WIDGET_RATED';

@CoscradEvent(WIDGET_RATED)
class WidgetRated implements ICoscradEvent<WidgetRatedPayload, {}> {
    type = WIDGET_RATED;

    payload: WidgetRatedPayload;

    meta = {};

    constructor(id: string, rating: number) {
        this.payload = {
            aggregateCompositeIdentifier: buildWidgetCompositeId(id),
            rating,
        };
    }
}

@CoscradEventHandler({
    eventType: WIDGET_RATED,
    scope: 'UPDATE',
})
class WidgetRatedEventHandler implements IUpdateEventHandler<Widget> {
    handle(updateEvent: WidgetRated, initialAggregate: Widget): Widget | Error {
        return initialAggregate.rate(updateEvent.payload.rating);
    }
}

const WIDGET_RENAMED = 'WIDGET_RENAMED';

type WidgetRenamedPayload = HasAggregateCompositeIdentifier & {
    newName: string;
};

@CoscradEvent(WIDGET_RENAMED)
class WidgetRenamed implements ICoscradEvent<WidgetRenamedPayload, {}> {
    type = WIDGET_RENAMED;

    payload: WidgetRenamedPayload;

    meta = {};

    constructor(id: string, newName: string) {
        this.payload = {
            aggregateCompositeIdentifier: buildWidgetCompositeId(id),
            newName,
        };
    }
}

@CoscradEventHandler({
    eventType: WIDGET_RENAMED,
    scope: 'UPDATE',
})
class WidgetRenamedEventHandler implements IUpdateEventHandler<Widget> {
    handle(updateEvent: WidgetRenamed, widget: Widget): Widget | Error {
        return widget.rename(updateEvent.payload.newName);
    }
}

describe(`buildEventHandlerMaps`, () => {
    describe(`when there are no registered event handlers`, () => {
        it(`should return empty maps`, () => {
            const { creationEventHandlerMap, updateEventHandlerMap } = buildEventHandlerMaps([]);

            assertEmptyMap(creationEventHandlerMap);

            assertEmptyMap(updateEventHandlerMap);
        });
    });

    describe(`when there is a single registered creation event handler`, () => {
        // Do we want the Ctor or a singleton instance?
        it(`should return the expected event handler`, () => {
            const { creationEventHandlerMap, updateEventHandlerMap } = buildEventHandlerMaps([
                Widget,
                WidgetCreated,
                // is this really how we want this to work? Why not just an instance of the event handler?
                WidgetCreatedEventHandler,
            ]);

            // No update handlers were registered
            assertEmptyMap(updateEventHandlerMap);

            const numberOfCreationEventHandlersFound = creationEventHandlerMap.size;

            expect(numberOfCreationEventHandlersFound).toBe(1);

            const creationHandlerSearchResult = creationEventHandlerMap.get(WIDGET_CREATED);

            expect(creationHandlerSearchResult).toBeInstanceOf(WidgetCreatedEventHandler);
        });
    });

    describe(`when there is a single registered update event handler`, () => {
        const { updateEventHandlerMap } = buildEventHandlerMaps([
            Widget,
            WidgetCreated,
            WidgetRated,
            WidgetCreatedEventHandler,
            WidgetRatedEventHandler,
        ]);

        expect(updateEventHandlerMap.size).toBe(1);

        expect(updateEventHandlerMap.get(WIDGET_RATED)).toBeInstanceOf(WidgetRatedEventHandler);
    });

    describe(`when there are multiple create handlers`, () => {
        it(`return the correct create event handler map`, () => {
            const { creationEventHandlerMap } = buildEventHandlerMaps([
                Widget,
                // Creation Events
                WidgetCreated,
                WidgetCreatedWithRating,
                // Update Events
                WidgetRated,
                // Event Handlers
                WidgetCreatedEventHandler,
                WidgetCreatedWithRatingEventHandler,
                WidgetRatedEventHandler,
            ]);

            expect(creationEventHandlerMap.size).toBe(2);

            expect(creationEventHandlerMap.get(WIDGET_CREATED)).toBeInstanceOf(
                WidgetCreatedEventHandler
            );

            expect(creationEventHandlerMap.get(WIDGET_CREATED)).toBeInstanceOf(
                WidgetCreatedEventHandler
            );
        });
    });

    describe(`when there are multiple update handlers`, () => {
        it(`should return the correct update event handler map`, () => {
            const { updateEventHandlerMap } = buildEventHandlerMaps([
                Widget,
                // Creation Events
                WidgetCreated,
                WidgetCreatedWithRating,
                // Update Events
                WidgetRated,
                WidgetRenamed,
                // Event Handlers
                WidgetCreatedEventHandler,
                WidgetCreatedWithRatingEventHandler,
                WidgetRatedEventHandler,
                WidgetRenamedEventHandler,
            ]);

            expect(updateEventHandlerMap.size).toBe(2);

            expect(updateEventHandlerMap.get(WIDGET_RATED)).toBeInstanceOf(WidgetRatedEventHandler);

            expect(updateEventHandlerMap.get(WIDGET_RENAMED)).toBeInstanceOf(
                WidgetRenamedEventHandler
            );
        });
    });

    describe(`when there are events that target different aggregate types`, () => {
        it.todo(`should have a test`);
    });
});
