import { ICoscradEventHandler } from '../../../../../../../domain/common';
import { TranscriptCreated } from './transcript-created.event';

// TODO write integration test first!
// todo decorator
export class TranscriptCreatedEventHandler implements ICoscradEventHandler {
    // inject the `AudioItemQueryRepository` in the constructor

    handle(_event: TranscriptCreated): Promise<void> {
        // log and exit if the event is for a video
        throw new Error('Method not implemented.');
    }
}
