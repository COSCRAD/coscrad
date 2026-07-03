import { ICoscradEvent } from './coscrad-event.interface';

export interface ICoscradEventHandler<T extends ICoscradEvent = ICoscradEvent> {
    handle(event: T): Promise<void>;
}
