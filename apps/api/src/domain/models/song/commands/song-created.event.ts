import { CoscradEvent } from '../../../common';
import { BaseEvent } from '../../shared/events/base-event.entity';

@CoscradEvent('SONG_CREATED')
export class SongCreated extends BaseEvent {
    type = 'SONG_CREATED';
}
