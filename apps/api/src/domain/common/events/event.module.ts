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
import { ICoscradEventPublisher } from './interfaces';
import { SyncInMemoryEventPublisher } from './sync-in-memory-event-publisher';

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
            useFactory: () => new SyncInMemoryEventPublisher(new ConsoleCoscradCliLogger()),
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
        const allInstancesAndMeta = this.discoveryService
            .getProviders()
            .filter((provider) => provider.instance)
            .map((provider) => [
                provider.instance,
                getCoscradEventConsumerMeta(Object.getPrototypeOf(provider.instance).constructor),
            ]);

        const handlersAndTypes = allInstancesAndMeta.filter(
            (
                instanceAndMeta
            ): instanceAndMeta is [ICoscradEventHandler, CoscradEventConsumerMetadata] =>
                !isNotFound(instanceAndMeta[1])
        );

        handlersAndTypes.forEach(([handler, _type]) => this.eventPublisher.register(handler));
    }
}
