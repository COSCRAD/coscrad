import { isNotFound } from '../../../lib/types/not-found';
import { getCoscradEventHandlerMeta } from './coscrad-event-handler.decorator';
import { ICoscradEvent } from './coscrad-event.interface';

export interface ICreationEventHandler<TAggregate> {
    handle(creationEvent: ICoscradEvent): TAggregate;
}

export interface IUpdateEventHandler<TAggregate> {
    handle(updateEvent: ICoscradEvent, initialAggregate: TAggregate): TAggregate | Error;
}

interface CreationAndUpdateEventHandlerMaps<TAggregate> {
    creationEventHandlerMap: Map<string, ICreationEventHandler<TAggregate>>;
    updateEventHandlerMap: Map<string, IUpdateEventHandler<TAggregate>>;
}

export const buildEventHandlerMaps = <TAggregate>(
    allCtors: any[]
): CreationAndUpdateEventHandlerMaps<TAggregate> => {
    const initialMaps: CreationAndUpdateEventHandlerMaps<TAggregate> = {
        creationEventHandlerMap: new Map(),
        updateEventHandlerMap: new Map(),
    };

    const eventHandlerMaps: CreationAndUpdateEventHandlerMaps<TAggregate> = allCtors.reduce(
        (
            accumulatedMaps: CreationAndUpdateEventHandlerMaps<TAggregate>,
            Ctor
        ): CreationAndUpdateEventHandlerMaps<TAggregate> => {
            const meta = getCoscradEventHandlerMeta(Ctor);

            if (isNotFound(meta)) {
                return accumulatedMaps;
            }

            const { creationEventHandlerMap, updateEventHandlerMap } = accumulatedMaps;

            const { scope, eventType } = meta;

            if (scope === 'CREATE') {
                return {
                    creationEventHandlerMap: creationEventHandlerMap.set(eventType, new Ctor()),
                    updateEventHandlerMap,
                };
            }

            if (scope === 'UPDATE') {
                return {
                    creationEventHandlerMap,
                    updateEventHandlerMap: updateEventHandlerMap.set(eventType, new Ctor()),
                };
            }

            return accumulatedMaps;
        },
        initialMaps
    );

    return eventHandlerMaps;
};
