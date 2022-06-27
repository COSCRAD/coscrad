import BaseDomainModel from '../../../BaseDomainModel';
import { EventRecordMetadata } from '../../../song/commands/song-created.event';

export interface IEvent extends BaseDomainModel {
    type: string;

    meta: EventRecordMetadata;
}
