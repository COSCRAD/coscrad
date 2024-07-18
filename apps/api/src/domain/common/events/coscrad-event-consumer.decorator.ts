import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';

export interface CoscradEventConsumerMetadata {
    type: string;
}

const COSCRAD_EVENT_CONSUMER_METADATA = 'COSCRAD_EVENT_CONSUMER_METADATA';

const setCoscradEventConsumerMeta = (meta: CoscradEventConsumerMetadata, target: Object) => {
    Reflect.defineMetadata(COSCRAD_EVENT_CONSUMER_METADATA, meta, target);
};

export const getCoscradEventConsumerMeta = (
    target: Object
): Maybe<CoscradEventConsumerMetadata> => {
    const searchResult = Reflect.getMetadata(COSCRAD_EVENT_CONSUMER_METADATA, target);

    if (!searchResult) return NotFound;

    return searchResult;
};

/**
 * This marks a class as a consumer of Coscrad Events. This should not
 * be confused with the `handleX` methods used to event-source the domain.
 */
export const CoscradEventConsumer = (eventType: string): ClassDecorator => {
    return function (target: Object) {
        setCoscradEventConsumerMeta(
            {
                type: eventType,
            },
            target
        );
    };
};
