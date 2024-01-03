import { ICoscradEventHandler } from './coscrad-event-handler.interface';
import { ICoscradEvent } from './coscrad-event.interface';

export interface ICoscradEventPublisher {
    publish(eventsToPublish: ICoscradEvent | ICoscradEvent[]): void;

    // TODO Should we have a separate event bus? What does this look like with a messaging queue?
    register(eventType: string, eventConsumer: ICoscradEventHandler): void;
}
