import { ICoscradEvent, ICoscradEventHandler } from '../../../../../domain/common';

export class MultilingualTextAutoIndexer implements ICoscradEventHandler {
    handle(event: ICoscradEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
