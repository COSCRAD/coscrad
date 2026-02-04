import { CoscradEvent } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

export type NoteReadAccessGrantedToUserPayload = {
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    readonly userId: AggregateId;
};

@CoscradEvent(`NOTE_READ_ACCESS_GRANTED_TO_USER`)
export class NoteReadAccessGrantedToUser extends BaseEvent<NoteReadAccessGrantedToUserPayload> {
    readonly type = 'NOTE_READ_ACCESS_GRANTED_TO_USER';
}
