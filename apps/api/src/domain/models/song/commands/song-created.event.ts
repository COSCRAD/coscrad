import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { AddSong } from './add-song.command';

/**
 * For now, we are just mirroring our command payload onto our events. We can update
 * this if and when we decide to use the events (e.g. for event sourcing).
 */
export class SongCreated extends BaseDomainModel {
    type = 'SONG_CREATED';

    dateCreated: number;

    id: string;

    constructor(command: AddSong, eventId: AggregateId) {
        super();

        Object.assign(this, command);

        this.dateCreated = Date.now();

        this.id = eventId;
    }
}
