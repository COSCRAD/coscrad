import { ICoscradEventHandler } from '../coscrad-event-handler.interface';
import { ICoscradEvent } from '../coscrad-event.interface';

export const EVENT_PUBLISHER_TOKEN = 'EVENT_PUBLISHER_TOKEN';

export interface ICoscradEventPublisher {
    publish(eventsToPublish: ICoscradEvent | ICoscradEvent[]): void;

    register(eventConsumer: ICoscradEventHandler): void;
}
