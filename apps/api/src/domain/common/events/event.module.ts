import { Inject, Module } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { ConsoleCoscradCliLogger } from '../../../coscrad-cli/logging';
import { isNotFound } from '../../../lib/types/not-found';
import { DynamicDataTypeModule } from '../../../validation';
import { EVENT_PUBLISHER_TOKEN } from './constants';
import {
    CoscradEventConsumerMetadata,
    getCoscradEventConsumerMeta,
} from './coscrad-event-consumer.decorator';
import { CoscradEventFactory } from './coscrad-event-factory';
import { ICoscradEventHandler } from './coscrad-event-handler.interface';
import { CoscradEventUnion } from './coscrad-event-union';
import { InMemoryEventPublisher } from './in-memory-event-publisher';
import { ICoscradEventPublisher } from './interfaces';

// TODO Should this be it's own lib or maybe part of the commands (CQRS now?) lib?
@Module({
    imports: [DynamicDataTypeModule, DiscoveryModule],
    providers: [
        CoscradEventFactory,
        {
            provide: CoscradEventUnion,
            useValue: CoscradEventUnion,
        },
        {
            provide: EVENT_PUBLISHER_TOKEN,
            useFactory: () =>
                new InMemoryEventPublisher(
                    // TODO We need to work on our logging strategy
                    new ConsoleCoscradCliLogger()
                ),
        },
    ],
    exports: [CoscradEventFactory, EVENT_PUBLISHER_TOKEN],
})
export class EventModule {
    constructor(
        private readonly discoveryService: DiscoveryService,
        /**
         * TODO Eventually, we want to move this out-of-process and use a proper
         * messaging queue, e.g., Kafka.
         */
        @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: ICoscradEventPublisher
    ) {}

    onApplicationBootstrap() {
        const handlersAndTypes = this.discoveryService
            .getProviders()
            .filter((provider) => provider.instance)
            .map((provider) => [
                provider.instance,
                getCoscradEventConsumerMeta(Object.getPrototypeOf(provider.instance).constructor),
            ])
            .filter(
                (
                    instanceAndMeta
                ): instanceAndMeta is [ICoscradEventHandler, CoscradEventConsumerMetadata] =>
                    !isNotFound(instanceAndMeta[1])
            )
            .map(([handler, { type: eventType }]): [ICoscradEventHandler, string] => [
                handler,
                eventType,
            ]);

        handlersAndTypes.forEach(([handler, type]) => this.eventPublisher.register(type, handler));
    }
}
