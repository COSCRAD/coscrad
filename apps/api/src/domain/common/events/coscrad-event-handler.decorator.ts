import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';

const COSCRAD_EVENT_HANDLER_META = '__COSCRAD_EVENT_HANDLER__';

type EventHandlerScope = 'CREATE' | 'UPDATE';

export type CoscradEventHandlerMeta = {
    eventType: string;
    scope: EventHandlerScope;
    // Do we need to know the target aggregate type?
};

export const getCoscradEventHandlerMeta = (target: Object): Maybe<CoscradEventHandlerMeta> => {
    return Reflect.getMetadata(COSCRAD_EVENT_HANDLER_META, target) || NotFound;
};

export function CoscradEventHandler({ eventType, scope }: CoscradEventHandlerMeta): ClassDecorator {
    return (target: Object) => {
        Reflect.defineMetadata(COSCRAD_EVENT_HANDLER_META, { eventType, scope }, target);
    };
}
