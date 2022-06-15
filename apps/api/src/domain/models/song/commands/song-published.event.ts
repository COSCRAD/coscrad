import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { PublishSong } from './publish-song.command';
import { EventRecordMetadata } from './song-created.event';

export class SongPublished extends BaseDomainModel {
    type = 'SONG_PUBLISHED';

    meta: EventRecordMetadata;

    constructor(command: PublishSong, eventId: AggregateId) {
        super();

        Object.assign(this, command);

        this.meta = {
            dateCreated: Date.now(),
            id: eventId,
        };
    }
}
