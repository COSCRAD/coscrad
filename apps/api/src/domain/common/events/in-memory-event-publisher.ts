import { Inject, OnModuleDestroy } from '@nestjs/common';
import { Subscription, catchError, defer, filter, mergeMap, of } from 'rxjs';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../coscrad-cli/logging';
import { InternalError } from '../../../lib/errors/InternalError';
import { ICoscradEvent, ICoscradEventHandler, ICoscradEventPublisher } from './interfaces';
import { ObservableBus } from './utils';

export class InMemoryEventPublisher
    extends ObservableBus<ICoscradEvent>
    implements ICoscradEventPublisher, OnModuleDestroy
{
    private readonly subscriptions: Subscription[] = [];

    constructor(@Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger) {
        super();
    }

    publish(eventOrEvents: ICoscradEvent<unknown> | ICoscradEvent<unknown>[]): void {
        const eventsToPublish = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];

        eventsToPublish.forEach((event) => this._subject$.next(event));
    }

    // TODO Link to source code this was inspired by
    register(eventType: string, handler: ICoscradEventHandler): void {
        const subscription = this.ofEventType(eventType)
            .pipe(
                mergeMap((event) =>
                    defer(() => Promise.resolve(handler.handle(event))).pipe(
                        catchError((error) => {
                            const unhandledError = new InternalError(
                                `Event handler: ${handler.constructor.name} for event: ${eventType} has thrown an unknown error`,
                                error instanceof Error ? [new InternalError(error.message)] : []
                            );
                            // this.unhandledExceptionBus.publish(unhandledError);
                            this.logger.log(
                                `"${
                                    handler.constructor.name
                                }" has thrown an unhandled exception. \n ${unhandledError.toString()}`
                            );
                            return of();
                        })
                    )
                )
            )
            .subscribe();

        this.subscriptions.push(subscription);
    }

    private ofEventType(type: string) {
        return this.subject$.pipe(filter((event) => event.isOfType(type)));
    }

    onModuleDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
