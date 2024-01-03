import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';

interface EventHandlerMetadata {
    type: string;
}

const EVENT_HANDLER_METADATA = '__EVENT_HANDLER_META__';

const setEventHandlerMeta = (meta: EventHandlerMetadata, target: Object) => {
    Reflect.defineMetadata(EVENT_HANDLER_METADATA, meta, target);
};

export const getEventHandlerMeta = (target: Object): Maybe<EventHandlerMetadata> => {
    const searchResult = Reflect.getMetadata(EVENT_HANDLER_METADATA, target);

    if (!searchResult) return NotFound;

    return searchResult;
};

/**
 * This marks a class as a consumer of Coscrad Events. This should not
 * be confused with the `handleX` methods used to event-source the domain.
 */
export const EventHandler = (eventType: string): ClassDecorator => {
    return function (target: Object) {
        setEventHandlerMeta(
            {
                type: eventType,
            },
            target
        );
    };
};
