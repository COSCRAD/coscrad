import { isString } from '@coscrad/validation-constraints';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { BaseEvent } from '../../../queries/event-sourcing';

export type EventPredicate = <T extends BaseEvent = BaseEvent>(event: T) => boolean;

export interface CoscradEventConsumerMetadata {
    matcher: EventPredicate;
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
export const CoscradEventConsumer = (matcher: string | EventPredicate): ClassDecorator => {
    const resolvedMatcher = isString(matcher)
        ? (event: BaseEvent) => event.isOfType(matcher)
        : matcher;

    return function (target: Object) {
        setCoscradEventConsumerMeta(
            {
                matcher: resolvedMatcher,
            },
            target
        );

        // @ts-expect-error fix this
        Object.defineProperty(target.prototype, 'handles', {
            value: resolvedMatcher,
        });
    };
};
