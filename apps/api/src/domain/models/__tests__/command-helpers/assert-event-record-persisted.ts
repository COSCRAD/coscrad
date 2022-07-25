import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { Aggregate } from '../../aggregate.entity';

export const assertEventRecordPersisted = (
    aggregate: Aggregate,
    eventType: string,
    adminUserId: AggregateId
) => {
    const { eventHistory } = aggregate;

    expect(eventHistory).toBeTruthy();

    if (!Array.isArray(eventHistory)) {
        throw new InternalError(
            `Invalid event history: ${JSON.stringify(
                eventHistory
            )} for aggregate: ${formatAggregateCompositeIdentifier(
                aggregate.getCompositeIdentifier()
            )}`
        );
    }

    const foundEvent = eventHistory.find(({ type }) => type === eventType);

    /**
     * We store plain DTOs, not instances, of events.
     * The best we can do is to check that an event
     * record DTO with the correct type is found
     */
    expect(foundEvent).toBeTruthy();

    if (!foundEvent) {
        // This shouldn't happen if the expect is satisfied
        throw new InternalError(`No event record was found`);
    }

    expect(foundEvent.meta.userId).toBe(adminUserId);
};
