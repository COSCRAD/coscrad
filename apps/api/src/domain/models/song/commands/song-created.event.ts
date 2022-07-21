import { AggregateId } from '../../../types/AggregateId';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { CreateSong } from './create-song.command';

export type EventRecordMetadata = {
    dateCreated: number;

    id: string;
};

/**
 * For now, we are just mirroring our command payload onto our events. We can update
 * this if and when we decide to use the events (e.g. for event sourcing).
 */
export class SongCreated extends BaseEvent {
    type = 'SONG_CREATED';

    meta: EventRecordMetadata;

    constructor(command: CreateSong, eventId: AggregateId) {
        super(command, eventId);
    }
}
