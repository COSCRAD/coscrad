import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { NotFound } from '../../lib/types/not-found';
import { ResultOrError } from '../../types/ResultOrError';
import { AggregateCompositeIdentifier } from '../types/AggregateCompositeIdentifier';
import { Aggregate } from './aggregate.entity';
import { BaseEvent } from './shared/events/base-event.entity';

type EventType = string;

export type CreationEventHandler<T extends Aggregate> = (event: BaseEvent) => ResultOrError<T>;

export type CreationEventHandlerMap<T extends Aggregate> = Map<EventType, CreationEventHandler<T>>;

export const buildAggregateRootFromEventHistory = <T extends Aggregate>(
    creationEventHandlerMap: CreationEventHandlerMap<T>,
    aggregateCompositeIdentifier: AggregateCompositeIdentifier,
    sortedEventHistory: BaseEvent[]
) => {
    const eventsForThisAggregateRoot = sortedEventHistory.filter((event) =>
        event.isFor(aggregateCompositeIdentifier)
    );

    if (eventsForThisAggregateRoot.length === 0) {
        return NotFound;
    }

    const [creationEvent, ...updateEvents] = eventsForThisAggregateRoot;

    const { type: creationEventType } = creationEvent;

    if (!creationEventHandlerMap.has(creationEventType)) {
        throw new InternalError(
            `There is no handler registered for the creation event: ${creationEventType}`
        );
    }

    const creationEventHandler = creationEventHandlerMap.get(creationEvent.type);

    const initialInstanceBuildResult = creationEventHandler(creationEvent);

    /**
     * This would occur if we have invalid data in the database. Maybe we've made
     * a mistake with event versioning. We choose to treat this as an exception
     * (system error). We should log and notify immediately so we can fix the state
     * (via compensating events).
     */
    if (isInternalError(initialInstanceBuildResult)) return initialInstanceBuildResult;

    return updateEvents.reduce(
        (previousResult: ResultOrError<T>, nextEvent) =>
            isInternalError(previousResult) ? previousResult : previousResult.apply(nextEvent),
        initialInstanceBuildResult
    );
};
