import { isFunction } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../coscrad-cli/logging';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { ICoscradEventHandler } from './coscrad-event-handler.interface';
import { ICoscradEvent } from './coscrad-event.interface';
import { ICoscradEventPublisher } from './interfaces';

export class SyncInMemoryEventPublisher implements ICoscradEventPublisher {
    private eventConsumers = new Set<ICoscradEventHandler>();

    constructor(@Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger) {}

    async publish(eventsToPublish: ICoscradEvent | ICoscradEvent[]): Promise<void> {
        const events = Array.isArray(eventsToPublish) ? eventsToPublish : [eventsToPublish];

        for (const e of events) {
            const { type: eventType } = e;

            for (const handler of this.eventConsumers.values()) {
                if (!isFunction(handler.handle)) {
                    this.logger.log(
                        `Encountered an invalid handler (missing a handle method) for event of type: ${eventType}`
                    );
                }

                if (!(handler as unknown as { handles(e: any): boolean }).handles(e)) {
                    continue;
                }

                await this.handleWithRetries(e, handler);
            }
        }
    }

    register(eventConsumer: ICoscradEventHandler): void {
        // we want to make sure registration is idempotent so events are only handled once per handler (if matched)
        if (!this.eventConsumers.has(eventConsumer)) {
            this.eventConsumers.add(eventConsumer);
        }
    }

    private async handleWithRetries(
        event: ICoscradEvent,
        handler: ICoscradEventHandler,
        retried = 0
    ) {
        const result = await handler
            .handle(event)
            .catch(
                (handlerError) =>
                    new InternalError(
                        `failed to publish event: ${JSON.stringify(event.type)}. Handler failed.`,
                        [handlerError]
                    )
            );

        if (isInternalError(result)) {
            if (retried < 5) {
                this.handleWithRetries(event, handler, retried + 1);
            } else {
                const error = new InternalError(
                    `Failed to handle event of type: ${event.type} after 5 retries`,
                    [result]
                );

                this.logger.log(error.toString());

                /**
                 * Note that we don't want to throw because this event-queue
                 * is in-process. It's important that we don't bring down other
                 * subscribers. This is the  main reason why we want to use
                 * a proper out-of-process memory queue that pulls from the
                 * event store.
                 */
                // throw error;
            }
        }
    }
}
