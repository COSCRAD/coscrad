import { Inject } from '@nestjs/common';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../coscrad-cli/logging';
import { InternalError } from '../../../lib/errors/InternalError';
import { ICoscradEventHandler } from './coscrad-event-handler.interface';
import { ICoscradEvent } from './coscrad-event.interface';
import { ICoscradEventPublisher } from './interfaces';

export class SyncInMemoryEventPublisher implements ICoscradEventPublisher {
    private eventTypeToConsumers = new Map<string, ICoscradEventHandler[]>();

    constructor(@Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger) {}

    async publish(eventsToPublish: ICoscradEvent | ICoscradEvent[]): Promise<void> {
        const events = Array.isArray(eventsToPublish) ? eventsToPublish : [eventsToPublish];

        for (const e of events) {
            const { type: eventType } = e;

            const handlers = this.eventTypeToConsumers.get(eventType);

            if (typeof handlers === 'undefined' || handlers.length === 0) {
                this.logger.log(
                    `There are no event consumers registered for events of the type: ${eventType}`
                );

                continue;
            }

            for (const handler of handlers) {
                try {
                    await handler.handle(e);
                } catch (error) {
                    this.logger.log(
                        new InternalError(
                            `failed to publish event: ${JSON.stringify(e)}. Handler failed.`,
                            [error]
                        ).toString()
                    );
                }
            }
        }
    }

    register(eventType: string, eventConsumer: ICoscradEventHandler): void {
        if (!this.eventTypeToConsumers.has(eventType)) {
            this.eventTypeToConsumers.set(eventType, []);
        }

        /**
         * We want registration to be idempotent in case this module is somehow
         * initialized multiple times.
         */
        if (!this.has(eventType, eventConsumer))
            this.eventTypeToConsumers.get(eventType).push(eventConsumer);
    }

    private has(eventType: string, eventConsumer: ICoscradEventHandler) {
        return (
            this.eventTypeToConsumers.has(eventType) &&
            // Compare by reference
            this.eventTypeToConsumers.get(eventType).some((handler) => handler === eventConsumer)
        );
    }
}
