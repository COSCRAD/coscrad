import { Module } from '@nestjs/common';
import { isNotFound } from '../../../lib/types/not-found';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../validation';
import { buildEventHandlerMaps } from './build-event-handler-maps';
import { getCoscradEventHandlerMeta } from './coscrad-event-handler.decorator';
import { CoscradEventSourcedAggregateFactory } from './coscrad-event-sourced-aggregate-factory';

@Module({
    imports: [DynamicDataTypeModule],
    providers: [
        CoscradEventSourcedAggregateFactory,
        {
            provide: CoscradEventSourcedAggregateFactory,
            useFactory: async (dynamicDataTypeFinderService: DynamicDataTypeFinderService) => {
                const allCtors = await dynamicDataTypeFinderService.getAllDataClassCtors();

                const eventHandlerCtors = allCtors
                    .map(getCoscradEventHandlerMeta)
                    .filter((meta) => !isNotFound(meta));

                const { creationEventHandlerMap, updateEventHandlerMap } =
                    buildEventHandlerMaps(eventHandlerCtors);

                return new CoscradEventSourcedAggregateFactory(
                    creationEventHandlerMap,
                    updateEventHandlerMap
                );
            },
        },
    ],
})
export class CoscradEventModule {}
