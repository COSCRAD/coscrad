import { BaseEvent } from '../../shared/events/base-event.entity';

/**
 * For now, we are just mirroring our command payload onto our events. We can update
 * this if and when we decide to use the events (e.g. for event sourcing).
 */
export class SongCreated extends BaseEvent {
    type = 'SONG_CREATED';
}
