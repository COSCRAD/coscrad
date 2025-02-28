import { ICoscradEventHandler } from '../coscrad-event-handler.interface';
import { ICoscradEvent } from '../coscrad-event.interface';

export const EVENT_PUBLISHER_TOKEN = 'EVENT_PUBLISHER_TOKEN';

export interface ICoscradEventPublisher {
    publish(eventsToPublish: ICoscradEvent | ICoscradEvent[]): void;

    // TODO Should we have a separate event bus? What does this look like with a messaging queue?
    register(eventConsumer: ICoscradEventHandler): void;
}
