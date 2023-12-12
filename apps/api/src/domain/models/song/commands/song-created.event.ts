import { CoscradEvent } from '../../../common';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { CreateSong } from './create-song.command';

export type SongCreatedPayload = CreateSong;

@CoscradEvent('SONG_CREATED')
export class SongCreated extends BaseEvent<SongCreatedPayload> {
    type = 'SONG_CREATED';
}
