import {
    CoscradEventConsumer,
    ICoscradEvent,
    ICoscradEventHandler,
} from '../../../../../domain/common';

@CoscradEventConsumer('AUDIO_ITEM_ADDED_TO_PLAYLIST')
export class AudioItemAddedToPlaylistEventHandler implements ICoscradEventHandler {
    async handle(_event: ICoscradEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
