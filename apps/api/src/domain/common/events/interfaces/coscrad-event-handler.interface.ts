import { ICoscradEvent } from './coscrad-event.interface';

export interface ICoscradEventHandler {
    handle(event: ICoscradEvent): Promise<void>;
}
