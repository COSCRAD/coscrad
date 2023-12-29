import { isDeepStrictEqual } from 'util';
import { ICoscradEvent } from './coscrad-event.interface';

interface ICreationEventHandler<TAggregate> {
    handle(creationEvent: ICoscradEvent): TAggregate;
}

interface IUpdateEventHandler<TAggregate> {
    handle(updateEvent: ICoscradEvent, initialAggregate: TAggregate): TAggregate | Error;
}

export class CoscradEventSourcedAggregateFactory<TAggregate> {
    constructor(
        private readonly creationEventHandlerMap: Map<string, ICreationEventHandler<TAggregate>>,
        private readonly updateEventHandlerMap: Map<string, IUpdateEventHandler<TAggregate>>
    ) {}

    build(
        // TODO Generalize this to a `Reducible<ICoscradEvent>`
        eventStream: ICoscradEvent[],
        aggregateCompositeIdentifier: {
            type: string;
            id: string;
        }
    ): TAggregate | Error {
        // TODO sort by date, implement unambiguous tie-breaker
        const sortedEventStream = eventStream;

        /**
         * When event-sourcing the domain (in a normalized way), one event applies
         * to one aggregate root, so we filter only the events for this particular
         * aggregate root as specified by the `aggregateCompositeIdentifier`.
         */
        const [creationEvent, ...updateEvents] = sortedEventStream.filter((event) =>
            // TODO Consider using a `behaviour` (method) based interface so we can use `isFor`, `isOfType`, etc.
            isDeepStrictEqual(
                event.payload.aggregateCompositeIdentifier,
                aggregateCompositeIdentifier
            )
        );

        // TODO Check that creationEvent has been annotated as such

        const { type: creationEventType } = creationEvent;

        const creationEventHandler = this.creationEventHandlerMap.get(creationEventType);

        if (!creationEventHandler) {
            throw new Error(
                `Failed to find event handler for creation event of type: ${creationEventType}`
            );
        }

        const initialAggregate = creationEventHandler.handle(creationEvent);

        return updateEvents.reduce((previousResultOrError: Error | TAggregate, nextEvent) => {
            if (previousResultOrError instanceof Error) return previousResultOrError;

            const updateEventHandler = this.updateEventHandlerMap.get(nextEvent.type);

            if (!updateEventHandler) return previousResultOrError;

            return updateEventHandler.handle(nextEvent, previousResultOrError);
        }, initialAggregate);
    }
}
